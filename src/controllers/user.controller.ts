import { Response } from 'express'
import { User, Enrollment, LessonProgress, Lesson } from '../models'
import { success, error } from '../utils/jsend'
import { AuthRequest } from '../middlewares/auth.middleware'

/**
 * Get user dashboard data
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
 * Get user enrollments
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
 * Enroll in a course
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
 * Update lesson progress
 */
export const updateLessonProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(error('Not authenticated', 'UNAUTHORIZED'))
      return
    }

    const { lessonId } = req.params
    const { isCompleted } = req.body

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

    // Update user stats if lesson is newly completed
    if (isCompleted) {
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
