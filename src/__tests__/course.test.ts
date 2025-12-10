import request from 'supertest'
import app from '../app'
import { Course, Lesson } from '../models'

// Mock the database
jest.mock('../models', () => ({
  Course: {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn()
  },
  Lesson: {
    find: jest.fn(),
    countDocuments: jest.fn(),
    deleteMany: jest.fn()
  },
  LessonProgress: {
    countDocuments: jest.fn(),
    find: jest.fn()
  },
  Enrollment: {
    deleteMany: jest.fn()
  },
  Difficulty: {
    BEGINNER: 'BEGINNER',
    INTERMEDIATE: 'INTERMEDIATE',
    ADVANCED: 'ADVANCED'
  }
}))

describe('Course Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/v1/courses', () => {
    it('should return list of published courses', async () => {
      const mockCourses = [
        {
          _id: { toString: () => 'course1' },
          title: 'Python 101',
          description: 'Learn Python',
          difficulty: 'BEGINNER',
          tags: ['Python'],
          isPublished: true
        }
      ]

      ;(Course.find as jest.Mock).mockResolvedValue(mockCourses)
      ;(Lesson.countDocuments as jest.Mock).mockResolvedValue(10)

      const response = await request(app).get('/api/v1/courses')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success', true)
      expect(response.body.data).toBeInstanceOf(Array)
    })

    it('should filter courses by difficulty', async () => {
      ;(Course.find as jest.Mock).mockResolvedValue([])
      ;(Lesson.countDocuments as jest.Mock).mockResolvedValue(0)

      const response = await request(app).get('/api/v1/courses?difficulty=BEGINNER')

      expect(response.status).toBe(200)
      expect(Course.find).toHaveBeenCalledWith(expect.objectContaining({ difficulty: 'BEGINNER' }))
    })
  })

  describe('GET /api/v1/courses/:courseId', () => {
    it('should return course details', async () => {
      const mockCourse = {
        _id: { toString: () => 'course1' },
        title: 'Python 101',
        description: 'Learn Python',
        difficulty: 'BEGINNER',
        tags: ['Python'],
        isPublished: true
      }

      ;(Course.findById as jest.Mock).mockResolvedValue(mockCourse)
      ;(Lesson.countDocuments as jest.Mock).mockResolvedValue(10)

      const response = await request(app).get('/api/v1/courses/course1')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success', true)
      expect(response.body.data).toHaveProperty('title', 'Python 101')
    })

    it('should return 404 for non-existent course', async () => {
      ;(Course.findById as jest.Mock).mockResolvedValue(null)

      const response = await request(app).get('/api/v1/courses/nonexistent')

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('success', false)
    })
  })
})
