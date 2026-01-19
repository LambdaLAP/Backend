import mongoose from 'mongoose'
import app from './app'
import { config } from './config'

mongoose
  .connect(config.database.url)
  .then(() => {
    console.log('Connected to MongoDB')
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`)
    })
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err)
  })
