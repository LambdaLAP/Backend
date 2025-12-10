import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User, Role } from '../models'
import { success, error } from '../utils/jsend'
import { config } from '../config'
import { AuthRequest } from '../middlewares/auth.middleware'

/**
 * Register a new user
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
 * Login user
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
 * Get current user
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
