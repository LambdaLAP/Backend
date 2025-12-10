import { Router } from 'express'
import {
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonsByCourse
} from '../controllers/lesson.controller'
import { authenticate, authorize } from '../middlewares/auth.middleware'

const router = Router()

// Public/authenticated routes
router.get('/:lessonId', authenticate, getLessonById)
router.get('/course/:courseId', getLessonsByCourse)

// Protected routes (admin/instructor only)
router.post('/', authenticate, authorize('ADMIN', 'INSTRUCTOR'), createLesson)
router.put('/:lessonId', authenticate, authorize('ADMIN', 'INSTRUCTOR'), updateLesson)
router.delete('/:lessonId', authenticate, authorize('ADMIN', 'INSTRUCTOR'), deleteLesson)

export default router
