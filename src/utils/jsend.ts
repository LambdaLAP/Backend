/**
 * JSend response wrapper
 * Provides standardized API response format
 */

export interface JSendSuccess<T = unknown> {
  success: true
  data: T
}

export interface JSendError {
  success: false
  message: string
  code?: string
  details?: unknown
}

export type JSendResponse<T = unknown> = JSendSuccess<T> | JSendError

/**
 * Creates a success response
 */
export const success = <T>(data: T): JSendSuccess<T> => {
  return {
    success: true,
    data
  }
}

/**
 * Creates an error response
 */
export const error = (message: string, code?: string, details?: unknown): JSendError => {
  const response: JSendError = {
    success: false,
    message
  }
  if (code) response.code = code
  if (details) response.details = details
  return response
}

export default {
  success,
  error
}
