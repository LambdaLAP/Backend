import { Request } from 'express'

/**
 * Query builder utility for pagination, filtering, and sorting
 */

export interface PaginationOptions {
  page?: number
  perPage?: number
  maxPerPage?: number
}

export interface SortOptions {
  sortBy?: string
  order?: 'asc' | 'desc'
}

export interface FilterOptions {
  [key: string]: any
}

/**
 * Extract pagination parameters from request
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
 * Extract sorting parameters from request
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
 * Extract filter parameters from request
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
 * Build MongoDB query from request parameters
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
