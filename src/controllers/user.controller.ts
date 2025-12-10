import { Response } from 'express'
import { User, Enrollment, LessonProgress, Lesson } from '../models'
import { success, error } from '../utils/jsend'
import { AuthRequest } from '../middlewares/auth.middleware'

/**
 * Get user dashboard data with stats and quick resume
 *
 * Retrieves the authenticated user's dashboard information including:
 * - User profile (name, avatar)
 * - Statistics (streak, XP, lessons completed)
 * - Quick resume information (first incomplete lesson in most recent course)
 *
 * @param req - AuthRequest with authenticated user
 * @param res - Express response object
 * @returns Promise<void> - Sends 200 with dashboard data on success, 401/404/500 on error
 *
 * @example
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "name": "John Doe",
 *       "avatar": null
 *     },
 *     "stats": {
 *       "streakDays": 3,
 *       "totalXp": 1250,
 *       "lessonsCompleted": 12
 *     },
 *     "quickResume": {
 *       "courseTitle": "Python 101",
 *       "lessonId": "lesson_id",
 *       "lessonTitle": "Loops and Logic"
 *     }
 *   }
 * }
 */
export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(error('Not authenticated', 'UNAUTHORIZED'))
      return
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      res.status(404).json(error('User not found', 'NOT_FOUND'))
      return
    }

    // Get enrollments to find quick resume
    const enrollments = await Enrollment.find({ userId: user._id })
      .populate('courseId')
      .sort({ lastAccessedAt: -1 })
      .limit(1)

    let quickResume = null

    if (enrollments.length > 0 && enrollments[0].courseId) {
      const enrollment = enrollments[0]
      const course = enrollment.courseId as any

      // Find first incomplete lesson in the most recently accessed course
      const lessons = await Lesson.find({ courseId: course._id }).sort({ orderIndex: 1 })

      for (const lesson of lessons) {
        const progress = await LessonProgress.findOne({
          userId: user._id,
          lessonId: lesson._id
        })

        if (!progress || !progress.isCompleted) {
          quickResume = {
            courseTitle: course.title,
            lessonId: lesson._id.toString(),
            lessonTitle: lesson.title
          }
          break
        }
      }
    }

    res.status(200).json(
      success({
        user: {
          name: user.profileData?.name || user.email,
          avatar: user.profileData?.avatar || null
        },
        stats: {
          streakDays: user.stats?.streakDays || 0,
          totalXp: user.stats?.totalXp || 0,
          lessonsCompleted: user.stats?.lessonsCompleted || 0
        },
        quickResume
      })
    )
  } catch (err) {
    console.error('Dashboard error:', err)
    res.status(500).json(error('Failed to get dashboard', 'INTERNAL_ERROR'))
  }
}

/**
 * Get list of user's course enrollments with progress
 *
 * Retrieves all courses the authenticated user is enrolled in, including:
 * - Course basic information (id, title)
 * - Progress metrics (total lessons, completed lessons)
 * - Last access timestamp
 *
 * @param req - AuthRequest with authenticated user
 * @param res - Express response object
 * @returns Promise<void> - Sends 200 with enrollments array on success, 401/500 on error
 *
 * @example
 * // Response
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "courseId": "course_id",
 *       "title": "Python 101",
 *       "totalLessons": 20,
 *       "completedLessons": 5,
 *       "lastAccessedAt": "2025-12-10T..."
 *     }
 *   ]
 * }
 */
export const getEnrollments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(error('Not authenticated', 'UNAUTHORIZED'))
      return
    }

    const enrollments = await Enrollment.find({ userId: req.user.id }).populate('courseId')

    const enrollmentsData = await Promise.all(
      enrollments.map(async enrollment => {
        const course = enrollment.courseId as any
        if (!course) return null

        // Count total lessons in course
        const totalLessons = await Lesson.countDocuments({ courseId: course._id })

        // Count completed lessons
        const lessons = await Lesson.find({ courseId: course._id })
        const lessonIds = lessons.map(l => l._id)

        const completedLessons = await LessonProgress.countDocuments({
          userId: req.user!.id,
          lessonId: { $in: lessonIds },
          isCompleted: true
        })

        return {
          courseId: course._id.toString(),
          title: course.title,
          totalLessons,
          completedLessons,
          lastAccessedAt: enrollment.lastAccessedAt || enrollment.enrolledAt
        }
      })
    )

    res.status(200).json(success(enrollmentsData.filter(e => e !== null)))
  } catch (err) {
    console.error('Enrollments error:', err)
    res.status(500).json(error('Failed to get enrollments', 'INTERNAL_ERROR'))
  }
}

/**
 * Enroll authenticated user in a course
 *
 * Creates a new enrollment record for the user in the specified course.
 * Prevents duplicate enrollments.
 *
 * @param req - AuthRequest with authenticated user and courseId in body
 * @param res - Express response object
 * @returns Promise<void> - Sends 201 with enrollment ID on success, 400/401/409/500 on error
 *
 * @example
 * // Request body
 * {
 *   "courseId": "course_id_here"
 * }
 *
 * @example
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "enrollmentId": "enrollment_id"
 *   }
 * }
 */
export const enrollInCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(error('Not authenticated', 'UNAUTHORIZED'))
      return
    }

    const { courseId } = req.body

    if (!courseId) {
      res.status(400).json(error('Course ID is required', 'VALIDATION_ERROR'))
      return
    }

    // Check if already enrolled
    const existing = await Enrollment.findOne({
      userId: req.user.id,
      courseId
    })

    if (existing) {
      res.status(409).json(error('Already enrolled in this course', 'CONFLICT'))
      return
    }

    const enrollment = await Enrollment.create({
      userId: req.user.id,
      courseId,
      lastAccessedAt: new Date()
    })

    res.status(201).json(success({ enrollmentId: enrollment._id.toString() }))
  } catch (err) {
    console.error('Enroll error:', err)
    res.status(500).json(error('Failed to enroll in course', 'INTERNAL_ERROR'))
  }
}

/**
 * Update lesson progress for authenticated user
 *
 * Marks a lesson as completed or in-progress. Automatically awards XP
 * and increments lesson completion count when a lesson is first completed.
 * Prevents duplicate XP awards for the same lesson.
 *
 * @param req - AuthRequest with authenticated user, lessonId in params, and isCompleted in body
 * @param res - Express response object
 * @returns Promise<void> - Sends 200 with progress ID on success, 401/500 on error
 *
 * @example
 * // Request: PUT /users/progress/:lessonId
 * // Body
 * {
 *   "isCompleted": true
 * }
 *
 * @example
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "progress": "progress_id"
 *   }
 * }
 */
export const updateLessonProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(error('Not authenticated', 'UNAUTHORIZED'))
      return
    }

    const { lessonId } = req.params
    const { isCompleted } = req.body

    // Check if lesson was already completed
    const existingProgress = await LessonProgress.findOne({
      userId: req.user.id,
      lessonId
    })

    const wasAlreadyCompleted = existingProgress?.isCompleted || false

    const progress = await LessonProgress.findOneAndUpdate(
      {
        userId: req.user.id,
        lessonId
      },
      {
        isCompleted: isCompleted || false,
        completedAt: isCompleted ? new Date() : null
      },
      { upsert: true, new: true }
    )

    // Update user stats only if lesson is newly completed (not already completed)
    if (isCompleted && !wasAlreadyCompleted) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { 'stats.lessonsCompleted': 1, 'stats.totalXp': 50 }
      })
    }

    res.status(200).json(success({ progress: progress._id.toString() }))
  } catch (err) {
    console.error('Update progress error:', err)
    res.status(500).json(error('Failed to update progress', 'INTERNAL_ERROR'))
  }
}
