import { Request } from 'express'

/**
 * Query builder utility for pagination, filtering, and sorting
 *
 * Provides helper functions to extract and parse query parameters for
 * building database queries with pagination, filtering, and sorting support.
 *
 * @module utils/queryBuilder
 */

/**
 * Pagination configuration options
 *
 * @interface PaginationOptions
 * @property {number} [page] - Default page number (1-based)
 * @property {number} [perPage] - Default items per page
 * @property {number} [maxPerPage] - Maximum allowed items per page
 */
export interface PaginationOptions {
  page?: number
  perPage?: number
  maxPerPage?: number
}

/**
 * Sorting configuration options
 *
 * @interface SortOptions
 * @property {string} [sortBy] - Field name to sort by
 * @property {'asc' | 'desc'} [order] - Sort direction
 */
export interface SortOptions {
  sortBy?: string
  order?: 'asc' | 'desc'
}

/**
 * Generic filter options object
 *
 * @interface FilterOptions
 */
export interface FilterOptions {
  [key: string]: any
}

/**
 * Extract and validate pagination parameters from request query
 *
 * Parses page and perPage query parameters with validation and defaults.
 * Ensures values are within acceptable ranges.
 *
 * @param req - Express request object
 * @param defaults - Optional default pagination values
 * @returns Object with page, perPage, skip, and limit values
 *
 * @example
 * const pagination = getPagination(req, { page: 1, perPage: 20, maxPerPage: 100 })
 * // Returns: { page: 1, perPage: 20, skip: 0, limit: 20 }
 */
export const getPagination = (req: Request, defaults?: PaginationOptions) => {
  const page = Math.max(1, parseInt(req.query.page as string) || defaults?.page || 1)
  const maxPerPage = defaults?.maxPerPage || 100
  const perPage = Math.min(
    maxPerPage,
    Math.max(1, parseInt(req.query.perPage as string) || defaults?.perPage || 20)
  )

  const skip = (page - 1) * perPage
  const limit = perPage

  return {
    page,
    perPage,
    skip,
    limit
  }
}

/**
 * Extract and validate sorting parameters from request query
 *
 * Parses sortBy/sort and order query parameters. Validates that the sort field
 * is in the allowed fields list. Returns MongoDB-compatible sort object.
 *
 * @param req - Express request object
 * @param allowedFields - Array of field names that are allowed for sorting
 * @param defaults - Optional default sort configuration
 * @returns MongoDB sort object or empty object if invalid
 *
 * @example
 * const sort = getSort(req, ['createdAt', 'title'], { sortBy: 'createdAt', order: 'desc' })
 * // Returns: { createdAt: -1 }
 */
export const getSort = (req: Request, allowedFields: string[] = [], defaults?: SortOptions) => {
  const sortBy = (req.query.sortBy as string) || (req.query.sort as string) || defaults?.sortBy
  const order = ((req.query.order as string) || defaults?.order || 'asc').toLowerCase()

  if (!sortBy || !allowedFields.includes(sortBy)) {
    return {}
  }

  return {
    [sortBy]: order === 'desc' ? -1 : 1
  }
}

/**
 * Extract filter parameters from request query
 *
 * Extracts specified query parameters as filters. Only includes fields
 * that are in the allowed fields list and have non-empty values.
 *
 * @param req - Express request object
 * @param allowedFields - Array of field names that are allowed for filtering
 * @returns Object with filter key-value pairs
 *
 * @example
 * // Request: GET /api?status=active&role=admin
 * const filters = getFilters(req, ['status', 'role'])
 * // Returns: { status: 'active', role: 'admin' }
 */
export const getFilters = (req: Request, allowedFields: string[] = []) => {
  const filters: FilterOptions = {}

  allowedFields.forEach(field => {
    const value = req.query[field]
    if (value !== undefined && value !== null && value !== '') {
      filters[field] = value
    }
  })

  return filters
}

/**
 * Build complete MongoDB query from request parameters
 *
 * Combines pagination, sorting, and filtering into a single query builder result.
 * Provides a convenient way to extract all query parameters at once.
 *
 * @param req - Express request object
 * @param options - Configuration object with defaults and allowed fields
 * @param options.paginationDefaults - Default pagination values
 * @param options.sortDefaults - Default sort configuration
 * @param options.allowedSortFields - Fields allowed for sorting
 * @param options.allowedFilterFields - Fields allowed for filtering
 * @returns Object with filters, sort, pagination, skip, and limit
 *
 * @example
 * const query = buildQuery(req, {
 *   paginationDefaults: { page: 1, perPage: 20 },
 *   sortDefaults: { sortBy: 'createdAt', order: 'desc' },
 *   allowedSortFields: ['createdAt', 'title'],
 *   allowedFilterFields: ['status', 'difficulty']
 * })
 * // Use query.filters, query.sort, query.skip, query.limit with database
 */
export const buildQuery = (
  req: Request,
  options: {
    paginationDefaults?: PaginationOptions
    sortDefaults?: SortOptions
    allowedSortFields?: string[]
    allowedFilterFields?: string[]
  } = {}
) => {
  const pagination = getPagination(req, options.paginationDefaults)
  const sort = getSort(req, options.allowedSortFields, options.sortDefaults)
  const filters = getFilters(req, options.allowedFilterFields)

  return {
    filters,
    sort,
    pagination,
    skip: pagination.skip,
    limit: pagination.limit
  }
}

/**
 * Format pagination response
 */
export const formatPaginationResponse = <T>(
  data: T[],
  total: number,
  page: number,
  perPage: number
) => {
  return {
    data,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
      hasMore: page * perPage < total
    }
  }
}

/**
 * Parse date range from query
 */
export const getDateRange = (req: Request, field: string = 'createdAt') => {
  const from = req.query[`${field}From`] as string
  const to = req.query[`${field}To`] as string

  if (!from && !to) return null

  const range: any = {}

  if (from) {
    range.$gte = new Date(from)
  }

  if (to) {
    range.$lte = new Date(to)
  }

  return { [field]: range }
}

/**
 * Parse search query with text matching
 */
export const getSearchQuery = (req: Request, fields: string[]) => {
  const query = req.query.q as string

  if (!query || fields.length === 0) return {}

  return {
    $or: fields.map(field => ({
      [field]: { $regex: query, $options: 'i' }
    }))
  }
}

/**
 * Combine multiple query filters
 */
export const combineFilters = (...filters: FilterOptions[]) => {
  const combined: FilterOptions = {}

  filters.forEach(filter => {
    Object.assign(combined, filter)
  })

  return combined
}

export default {
  getPagination,
  getSort,
  getFilters,
  buildQuery,
  formatPaginationResponse,
  getDateRange,
  getSearchQuery,
  combineFilters
}
