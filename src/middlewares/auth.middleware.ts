import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { error } from '../utils/jsend'
import { User } from '../models'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
  }
}

/**
 * Middleware to authenticate JWT token
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json(error('No token provided', 'UNAUTHORIZED'))
      return
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string
        email: string
        role: string
      }

      // Verify user still exists
      const user = await User.findById(decoded.id)
      if (!user) {
        res.status(401).json(error('User not found', 'UNAUTHORIZED'))
        return
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      }

      next()
    } catch {
      res.status(401).json(error('Invalid token', 'UNAUTHORIZED'))
    }
  } catch {
    res.status(500).json(error('Authentication error', 'INTERNAL_ERROR'))
  }
}

/**
 * Middleware to check if user has required role
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(error('Not authenticated', 'UNAUTHORIZED'))
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json(error('Insufficient permissions', 'FORBIDDEN'))
      return
    }

    next()
  }
}
