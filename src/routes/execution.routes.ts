import { Router } from 'express'
import { runCode, getSubmissions } from '../controllers/execution.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

router.post('/run', runCode)
router.get('/submissions', authenticate, getSubmissions)

export default router
