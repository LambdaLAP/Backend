import { Router } from 'express'
import healthRoutes from './health.routes'

const router = Router()

router.use('/v1', healthRoutes)

export default router
