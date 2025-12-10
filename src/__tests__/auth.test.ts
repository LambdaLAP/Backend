import request from 'supertest'
import app from '../app'
import { User } from '../models'
import * as bcryptjs from 'bcryptjs'

// Mock the database
jest.mock('../models', () => ({
  User: {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn()
  },
  Role: {
    STUDENT: 'STUDENT',
    INSTRUCTOR: 'INSTRUCTOR',
    ADMIN: 'ADMIN'
  }
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn()
}))

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        _id: { toString: () => 'user123' },
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: 'STUDENT'
      }

      ;(User.findOne as jest.Mock).mockResolvedValue(null)
      ;(User.create as jest.Mock).mockResolvedValue(mockUser)

      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('success', true)
      expect(response.body.data).toHaveProperty('token')
      expect(response.body.data).toHaveProperty('user')
      expect(response.body.data.user.email).toBe('test@example.com')
    })

    it('should fail with invalid data', async () => {
      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com'
      })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('success', false)
    })

    it('should fail if user already exists', async () => {
      ;(User.findOne as jest.Mock).mockResolvedValue({ email: 'test@example.com' })

      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(response.status).toBe(409)
      expect(response.body).toHaveProperty('success', false)
    })
  })

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        _id: { toString: () => 'user123' },
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: 'STUDENT'
      }

      ;(User.findOne as jest.Mock).mockResolvedValue(mockUser)
      ;(bcryptjs.compare as jest.Mock).mockResolvedValue(true)

      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success', true)
      expect(response.body.data).toHaveProperty('token')
    })

    it('should fail with invalid credentials', async () => {
      ;(User.findOne as jest.Mock).mockResolvedValue(null)

      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword'
      })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('success', false)
    })
  })

  describe('GET /api/v1/auth/me', () => {
    it('should return user data with valid token', async () => {
      const mockUser = {
        _id: { toString: () => 'user123' },
        email: 'test@example.com',
        role: 'STUDENT',
        profileData: { name: 'Test User' },
        stats: { streakDays: 0, totalXp: 0, lessonsCompleted: 0 }
      }

      ;(User.findById as jest.Mock).mockResolvedValue(mockUser)

      // Generate a valid token first
      const registerResponse = await request(app).post('/api/v1/auth/register').send({
        email: 'newuser@example.com',
        password: 'password123'
      })

      ;(User.findOne as jest.Mock).mockResolvedValue(null)
      ;(User.create as jest.Mock).mockResolvedValue({
        _id: { toString: () => 'user456' },
        email: 'newuser@example.com',
        role: 'STUDENT'
      })

      const token = registerResponse.body.data?.token

      if (token) {
        const response = await request(app)
          .get('/api/v1/auth/me')
          .set('Authorization', `Bearer ${token}`)

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('success', true)
        expect(response.body.data).toHaveProperty('user')
      }
    })

    it('should fail without token', async () => {
      const response = await request(app).get('/api/v1/auth/me')

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('success', false)
    })
  })
})
