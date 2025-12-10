import { Router } from 'express'
import {
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonsByCourse
} from '../controllers/lesson.controller'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import { apiLimiter } from '../middlewares/rateLimit.middleware'

const router = Router()

// Public/authenticated routes
router.get('/:lessonId', apiLimiter, authenticate, getLessonById)
router.get('/course/:courseId', apiLimiter, getLessonsByCourse)

// Protected routes (admin/instructor only)
router.post('/', apiLimiter, authenticate, authorize('ADMIN', 'INSTRUCTOR'), createLesson)
router.put('/:lessonId', apiLimiter, authenticate, authorize('ADMIN', 'INSTRUCTOR'), updateLesson)
router.delete(
  '/:lessonId',
  apiLimiter,
  authenticate,
  authorize('ADMIN', 'INSTRUCTOR'),
  deleteLesson
)

export default router
