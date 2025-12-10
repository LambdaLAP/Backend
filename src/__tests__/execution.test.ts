import request from 'supertest'
import app from '../app'
import { Challenge, Submission } from '../models'

// Mock the database
jest.mock('../models', () => ({
  Challenge: {
    findById: jest.fn()
  },
  Submission: {
    create: jest.fn(),
    find: jest.fn()
  }
}))

describe('Execution Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/v1/execution/run', () => {
    it('should execute code successfully', async () => {
      const mockChallenge = {
        _id: { toString: () => 'challenge1' },
        title: 'Test Challenge',
        testCases: []
      }

      ;(Challenge.findById as jest.Mock).mockResolvedValue(mockChallenge)
      ;(Submission.create as jest.Mock).mockResolvedValue({})

      const response = await request(app).post('/api/v1/execution/run').send({
        challengeId: 'challenge1',
        code: 'print("Hello World")',
        language: 'python'
      })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success', true)
      expect(response.body.data).toHaveProperty('status')
      expect(response.body.data).toHaveProperty('stdout')
    })

    it('should handle empty code submission', async () => {
      const response = await request(app).post('/api/v1/execution/run').send({
        code: '   '
      })

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe('ERROR')
    })

    it('should require code parameter', async () => {
      const response = await request(app).post('/api/v1/execution/run').send({})

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('success', false)
    })
  })
})
