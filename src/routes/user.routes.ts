import { Router } from 'express'
import {
  getDashboard,
  getEnrollments,
  enrollInCourse,
  updateLessonProgress,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/user.controller'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import { apiLimiter } from '../middlewares/rateLimit.middleware'

const router = Router()

router.get('/dashboard', apiLimiter, authenticate, getDashboard)
router.get('/enrollments', apiLimiter, authenticate, getEnrollments)
router.post('/enrollments', apiLimiter, authenticate, enrollInCourse)
router.put('/progress/:lessonId', apiLimiter, authenticate, updateLessonProgress)

// Admin Routes
router.get('/', apiLimiter, authenticate, authorize('ADMIN'), getAllUsers)
router.post('/', apiLimiter, authenticate, authorize('ADMIN'), createUser)
router.get('/:id', apiLimiter, authenticate, authorize('ADMIN'), getUserById)
router.put('/:id', apiLimiter, authenticate, authorize('ADMIN'), updateUser)
router.delete('/:id', apiLimiter, authenticate, authorize('ADMIN'), deleteUser)

export default router
