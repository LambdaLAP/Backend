import { Router } from 'express'
import { runCode, getSubmissions, submitChallenge } from '../controllers/execution.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { executionLimiter, apiLimiter } from '../middlewares/rateLimit.middleware'

const router = Router()

router.post('/run', executionLimiter, runCode)
router.post('/submit', executionLimiter, authenticate, submitChallenge)
router.get('/submissions', apiLimiter, authenticate, getSubmissions)

export default router
