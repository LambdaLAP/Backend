import { Request, Response } from 'express'
import { success } from '../utils/jsend'

/**
 * Health check controller
 */
export const healthCheck = (_req: Request, res: Response) => {
  res.status(200).json(
    success({
      status: 'healthy',
      timestamp: new Date().toISOString()
    })
  )
}
