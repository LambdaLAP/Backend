import { Router } from 'express'
import {
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getChallengesByLesson
} from '../controllers/challenge.controller'
import { authenticate, authorize } from '../middlewares/auth.middleware'

const router = Router()

// Public routes
router.get('/:challengeId', getChallengeById)
router.get('/lesson/:lessonId', getChallengesByLesson)

// Protected routes (admin/instructor only)
router.post('/', authenticate, authorize('ADMIN', 'INSTRUCTOR'), createChallenge)
router.put('/:challengeId', authenticate, authorize('ADMIN', 'INSTRUCTOR'), updateChallenge)
router.delete('/:challengeId', authenticate, authorize('ADMIN', 'INSTRUCTOR'), deleteChallenge)

export default router
