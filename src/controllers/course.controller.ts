import { Request, Response } from 'express'
import { Course, Lesson, LessonProgress, Enrollment } from '../models'
import { success, error } from '../utils/jsend'
import { AuthRequest } from '../middlewares/auth.middleware'

/**
 * Get list of published courses with optional filters
 *
 * Retrieves all published courses from the catalog. Supports filtering by
 * difficulty level and topic tags. Calculates metadata including lesson count
 * and estimated duration for each course.
 *
 * @param req - Express request with optional query params (difficulty, topic)
 * @param res - Express response object
 * @returns Promise<void> - Sends 200 with courses array on success, 500 on error
 *
 * @example
 * // Request: GET /courses?difficulty=BEGINNER&topic=Python
 *
 * @example
 * // Response
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "course_id",
 *       "title": "Python Fundamentals",
 *       "description": "Master the basics...",
 *       "difficulty": "BEGINNER",
 *       "tags": ["Python", "Programming"],
 *       "meta": {
 *         "lessonCount": 12,
 *         "durationHours": 6
 *       }
 *     }
 *   ]
 * }
 */
export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { difficulty, topic } = req.query

    const filter: any = { isPublished: true }

    if (difficulty) {
      filter.difficulty = difficulty
    }

    if (topic) {
      filter.tags = { $in: [topic] }
    }

    const courses = await Course.find(filter)

    const coursesData = await Promise.all(
      courses.map(async course => {
        const lessonCount = await Lesson.countDocuments({ courseId: course._id })

        return {
          id: course._id.toString(),
          title: course.title,
          description: course.description,
          difficulty: course.difficulty,
          tags: course.tags,
          meta: {
            lessonCount,
            durationHours: Math.ceil(lessonCount * 0.5) // Estimate
          }
        }
      })
    )

    res.status(200).json(success(coursesData))
  } catch (err) {
    console.error('Get courses error:', err)
    res.status(500).json(error('Failed to get courses', 'INTERNAL_ERROR'))
  }
}

/**
 * Get course by ID
 */
export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params

    const course = await Course.findById(courseId)
    if (!course) {
      res.status(404).json(error('Course not found', 'NOT_FOUND'))
      return
    }

    const lessonCount = await Lesson.countDocuments({ courseId: course._id })

    res.status(200).json(
      success({
        id: course._id.toString(),
        title: course.title,
        description: course.description,
        difficulty: course.difficulty,
        tags: course.tags,
        isPublished: course.isPublished,
        meta: {
          lessonCount,
          durationHours: Math.ceil(lessonCount * 0.5)
        }
      })
    )
  } catch (err) {
    console.error('Get course error:', err)
    res.status(500).json(error('Failed to get course', 'INTERNAL_ERROR'))
  }
}

/**
 * Get course syllabus with user progress
 */
export const getCourseSyllabus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params

    const course = await Course.findById(courseId)
    if (!course) {
      res.status(404).json(error('Course not found', 'NOT_FOUND'))
      return
    }

    const lessons = await Lesson.find({ courseId }).sort({ orderIndex: 1 })

    let userProgress = null
    let lessonsData = []

    if (req.user) {
      // User is authenticated, calculate progress
      const totalLessons = lessons.length
      const completedCount = await LessonProgress.countDocuments({
        userId: req.user.id,
        lessonId: { $in: lessons.map(l => l._id) },
        isCompleted: true
      })

      userProgress = {
        percent: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
      }

      // Get progress for each lesson
      const progressMap = new Map()
      const progressDocs = await LessonProgress.find({
        userId: req.user.id,
        lessonId: { $in: lessons.map(l => l._id) }
      })

      progressDocs.forEach(p => {
        progressMap.set(p.lessonId.toString(), p)
      })

      // Calculate status for each lesson
      lessonsData = lessons.map((lesson, index) => {
        const progress = progressMap.get(lesson._id.toString())
        let status = 'LOCKED'

        if (progress?.isCompleted) {
          status = 'COMPLETED'
        } else if (index === 0 || progressMap.get(lessons[index - 1]._id.toString())?.isCompleted) {
          // First lesson or previous lesson is completed
          status = progress ? 'IN_PROGRESS' : 'UNLOCKED'
        }

        return {
          id: lesson._id.toString(),
          orderIndex: lesson.orderIndex,
          title: lesson.title,
          type: lesson.type,
          status
        }
      })
    } else {
      // No user, all lessons are locked except first
      lessonsData = lessons.map((lesson, index) => ({
        id: lesson._id.toString(),
        orderIndex: lesson.orderIndex,
        title: lesson.title,
        type: lesson.type,
        status: index === 0 ? 'UNLOCKED' : 'LOCKED'
      }))
    }

    res.status(200).json(
      success({
        course: {
          id: course._id.toString(),
          title: course.title,
          description: course.description
        },
        userProgress,
        lessons: lessonsData
      })
    )
  } catch (err) {
    console.error('Get syllabus error:', err)
    res.status(500).json(error('Failed to get course syllabus', 'INTERNAL_ERROR'))
  }
}

/**
 * Create a new course (admin/instructor only)
 */
export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, difficulty, tags } = req.body

    if (!title || !description) {
      res.status(400).json(error('Title and description are required', 'VALIDATION_ERROR'))
      return
    }

    const course = await Course.create({
      title,
      description,
      difficulty: difficulty || 'BEGINNER',
      tags: tags || [],
      isPublished: false
    })

    res.status(201).json(success({ courseId: course._id.toString() }))
  } catch (err) {
    console.error('Create course error:', err)
    res.status(500).json(error('Failed to create course', 'INTERNAL_ERROR'))
  }
}

/**
 * Update a course (admin/instructor only)
 */
export const updateCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params
    const { title, description, difficulty, tags, isPublished } = req.body

    const course = await Course.findByIdAndUpdate(
      courseId,
      {
        ...(title && { title }),
        ...(description && { description }),
        ...(difficulty && { difficulty }),
        ...(tags && { tags }),
        ...(isPublished !== undefined && { isPublished })
      },
      { new: true }
    )

    if (!course) {
      res.status(404).json(error('Course not found', 'NOT_FOUND'))
      return
    }

    res.status(200).json(success({ courseId: course._id.toString() }))
  } catch (err) {
    console.error('Update course error:', err)
    res.status(500).json(error('Failed to update course', 'INTERNAL_ERROR'))
  }
}

/**
 * Delete a course (admin/instructor only)
 */
export const deleteCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params

    const course = await Course.findByIdAndDelete(courseId)

    if (!course) {
      res.status(404).json(error('Course not found', 'NOT_FOUND'))
      return
    }

    // Delete related data
    await Lesson.deleteMany({ courseId })
    await Enrollment.deleteMany({ courseId })

    res.status(200).json(success({ message: 'Course deleted successfully' }))
  } catch (err) {
    console.error('Delete course error:', err)
    res.status(500).json(error('Failed to delete course', 'INTERNAL_ERROR'))
  }
}
