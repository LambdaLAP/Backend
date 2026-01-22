import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import routes from './routes'
import { error } from './utils/jsend'

const app: Application = express()

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api', routes)

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json(error('Route not found', 'NOT_FOUND'))
})

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json(error('Internal server error', 'INTERNAL_ERROR', err.message))
})

export default app
