import request from 'supertest'
import app from '../app'

describe('Health Check Endpoint', () => {
  describe('GET /api/v1/health', () => {
    it('should return 200 status code', async () => {
      const response = await request(app).get('/api/v1/health')
      expect(response.status).toBe(200)
    })

    it('should return success response with JSend format', async () => {
      const response = await request(app).get('/api/v1/health')
      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
    })

    it('should return health status and timestamp', async () => {
      const response = await request(app).get('/api/v1/health')
      expect(response.body.data).toHaveProperty('status', 'healthy')
      expect(response.body.data).toHaveProperty('timestamp')
      expect(response.body.data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })
})
