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

const router = Router()

// Public routes
router.get('/', getCourses)
router.get('/:courseId', getCourseById)
router.get('/:courseId/syllabus', authenticate, getCourseSyllabus)

// Protected routes (admin/instructor only)
router.post('/', authenticate, authorize('ADMIN', 'INSTRUCTOR'), createCourse)
router.put('/:courseId', authenticate, authorize('ADMIN', 'INSTRUCTOR'), updateCourse)
router.delete('/:courseId', authenticate, authorize('ADMIN', 'INSTRUCTOR'), deleteCourse)

export default router
