import { Router } from 'express'
import {
  getDashboard,
  getEnrollments,
  enrollInCourse,
  updateLessonProgress
} from '../controllers/user.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { apiLimiter } from '../middlewares/rateLimit.middleware'

const router = Router()

router.get('/dashboard', apiLimiter, authenticate, getDashboard)
router.get('/enrollments', apiLimiter, authenticate, getEnrollments)
router.post('/enrollments', apiLimiter, authenticate, enrollInCourse)
router.put('/progress/:lessonId', apiLimiter, authenticate, updateLessonProgress)

export default router
