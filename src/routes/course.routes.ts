import { Router } from 'express'
import {
  getCourses,
  getCourseById,
  getCourseSyllabus,
  createCourse,
  updateCourse,
  deleteCourse
} from '../controllers/course.controller'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import { apiLimiter } from '../middlewares/rateLimit.middleware'

const router = Router()

// Public routes
router.get('/', apiLimiter, getCourses)
router.get('/:courseId', apiLimiter, getCourseById)
router.get('/:courseId/syllabus', apiLimiter, authenticate, getCourseSyllabus)

// Protected routes (admin/instructor only)
router.post('/', apiLimiter, authenticate, authorize('ADMIN', 'INSTRUCTOR'), createCourse)
router.put('/:courseId', apiLimiter, authenticate, authorize('ADMIN', 'INSTRUCTOR'), updateCourse)
router.delete(
  '/:courseId',
  apiLimiter,
  authenticate,
  authorize('ADMIN', 'INSTRUCTOR'),
  deleteCourse
)

export default router
