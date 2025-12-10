import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User, Role } from '../models'
import { success, error } from '../utils/jsend'
import { config } from '../config'
import { AuthRequest } from '../middlewares/auth.middleware'

/**
 * Register a new user account
 *
 * Creates a new user with hashed password and returns a JWT token for authentication.
 * The user is created with STUDENT role by default.
 *
 * @param req - Express request object containing email, password, and optional name in body
 * @param res - Express response object
 * @returns Promise<void> - Sends 201 with token and user data on success, 400/409/500 on error
 *
 * @example
 * // Request body
 * {
 *   "email": "user@example.com",
 *   "password": "password123",
 *   "name": "John Doe"
 * }
 *
 * @example
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "token": "jwt_token_string",
 *     "user": {
 *       "id": "user_id",
 *       "email": "user@example.com",
 *       "role": "STUDENT"
 *     }
 *   }
 * }
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body

    // Validation
    if (!email || !password) {
      res.status(400).json(error('Email and password are required', 'VALIDATION_ERROR'))
      return
    }

    if (password.length < 6) {
      res.status(400).json(error('Password must be at least 6 characters', 'VALIDATION_ERROR'))
      return
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      res.status(409).json(error('User already exists', 'CONFLICT'))
      return
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      role: Role.STUDENT,
      profileData: name ? { name } : null,
      stats: {
        streakDays: 0,
        totalXp: 0,
        lessonsCompleted: 0
      }
    })

    // Generate token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      },
      config.jwt.secret,
      { expiresIn: '7d' }
    )

    res.status(201).json(
      success({
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role
        }
      })
    )
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json(error('Registration failed', 'INTERNAL_ERROR'))
  }
}

/**
 * Authenticate user and generate JWT token
 *
 * Verifies user credentials and returns a JWT token for authentication.
 * Email is case-insensitive.
 *
 * @param req - Express request object containing email and password in body
 * @param res - Express response object
 * @returns Promise<void> - Sends 200 with token and user data on success, 400/401/500 on error
 *
 * @example
 * // Request body
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 *
 * @example
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "token": "jwt_token_string",
 *     "user": {
 *       "id": "user_id",
 *       "email": "user@example.com",
 *       "role": "STUDENT"
 *     }
 *   }
 * }
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      res.status(400).json(error('Email and password are required', 'VALIDATION_ERROR'))
      return
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      res.status(401).json(error('Invalid credentials', 'UNAUTHORIZED'))
      return
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      res.status(401).json(error('Invalid credentials', 'UNAUTHORIZED'))
      return
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      },
      config.jwt.secret,
      { expiresIn: '7d' }
    )

    res.status(200).json(
      success({
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role
        }
      })
    )
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json(error('Login failed', 'INTERNAL_ERROR'))
  }
}

/**
 * Get current authenticated user information
 *
 * Returns the profile data and statistics for the currently authenticated user.
 * Requires valid JWT token in Authorization header.
 *
 * @param req - AuthRequest object with authenticated user info
 * @param res - Express response object
 * @returns Promise<void> - Sends 200 with user data on success, 401/404/500 on error
 *
 * @example
 * // Request headers
 * {
 *   "Authorization": "Bearer jwt_token_string"
 * }
 *
 * @example
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": "user_id",
 *       "email": "user@example.com",
 *       "role": "STUDENT",
 *       "profileData": { "name": "John Doe" },
 *       "stats": {
 *         "streakDays": 3,
 *         "totalXp": 1250,
 *         "lessonsCompleted": 12
 *       }
 *     }
 *   }
 * }
 */
export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(error('Not authenticated', 'UNAUTHORIZED'))
      return
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      res.status(404).json(error('User not found', 'NOT_FOUND'))
      return
    }

    res.status(200).json(
      success({
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          profileData: user.profileData,
          stats: user.stats
        }
      })
    )
  } catch (err) {
    console.error('Me error:', err)
    res.status(500).json(error('Failed to get user', 'INTERNAL_ERROR'))
  }
}
