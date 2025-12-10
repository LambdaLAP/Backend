/**
 * Database connection utility using Mongoose
 */

import mongoose from 'mongoose'
import config from '../config'

// Connection state
let isConnected = false

/**
 * Connect to MongoDB database
 */
export const connect = async (): Promise<void> => {
  if (isConnected) {
    return
  }

  try {
    const connection = await mongoose.connect(config.database.url)
    isConnected = connection.connections[0].readyState === 1
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

/**
 * Disconnect from database
 */
export const disconnect = async (): Promise<void> => {
  if (!isConnected) {
    return
  }

  try {
    await mongoose.disconnect()
    isConnected = false
    console.log('MongoDB disconnected successfully')
  } catch (error) {
    console.error('MongoDB disconnection error:', error)
    throw error
  }
}

/**
 * Get connection status
 */
export const getConnectionStatus = (): boolean => {
  return isConnected
}

export default {
  connect,
  disconnect,
  getConnectionStatus
}
