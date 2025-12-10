import { Router } from 'express'
import {
  getDashboard,
  getEnrollments,
  enrollInCourse,
  updateLessonProgress
} from '../controllers/user.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

router.get('/dashboard', authenticate, getDashboard)
router.get('/enrollments', authenticate, getEnrollments)
router.post('/enrollments', authenticate, enrollInCourse)
router.put('/progress/:lessonId', authenticate, updateLessonProgress)

export default router
