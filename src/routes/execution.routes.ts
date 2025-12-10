import { Router } from 'express'
import { runCode, getSubmissions } from '../controllers/execution.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { executionLimiter, apiLimiter } from '../middlewares/rateLimit.middleware'

const router = Router()

router.post('/run', executionLimiter, runCode)
router.get('/submissions', apiLimiter, authenticate, getSubmissions)

export default router
