import { Router } from 'express'
import { register, login, me } from '../controllers/auth.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { authLimiter, apiLimiter } from '../middlewares/rateLimit.middleware'

const router = Router()

router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.get('/me', apiLimiter, authenticate, me)

export default router
