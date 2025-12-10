import rateLimit from 'express-rate-limit'

/**
 * Rate limiting middleware for API endpoints
 *
 * Provides three tiers of rate limiting for different endpoint types:
 * - General API: 100 requests per 15 minutes
 * - Authentication: 5 requests per 15 minutes
 * - Code Execution: 20 requests per 15 minutes
 *
 * @module middlewares/rateLimit
 */

/**
 * General rate limiter for most API endpoints
 *
 * Limits each IP address to 100 requests per 15-minute window.
 * Returns rate limit information in RateLimit-* headers.
 *
 * @constant
 * @type {RateLimitRequestHandler}
 *
 * @example
 * // Usage in routes
 * router.get('/courses', apiLimiter, getCourses)
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
})

/**
 * Strict rate limiter for authentication endpoints
 *
 * Limits each IP address to 5 requests per 15-minute window to prevent
 * brute force attacks on login/register endpoints. Successful requests
 * are not counted against the limit.
 *
 * @constant
 * @type {RateLimitRequestHandler}
 *
 * @example
 * // Usage in auth routes
 * router.post('/login', authLimiter, login)
 * router.post('/register', authLimiter, register)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/register requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful requests
})

/**
 * Rate limiter for code execution endpoints
 *
 * Limits each IP address to 20 code execution requests per 15-minute window
 * to prevent abuse of computational resources.
 *
 * @constant
 * @type {RateLimitRequestHandler}
 *
 * @example
 * // Usage in execution routes
 * router.post('/run', executionLimiter, runCode)
 */
export const executionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 executions per windowMs
  message: {
    success: false,
    message: 'Too many code execution requests, please try again later',
    code: 'EXECUTION_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
})

export default {
  apiLimiter,
  authLimiter,
  executionLimiter
}
