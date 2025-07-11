/**
 * Utilities for working with Mongoose models in API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { isValidObjectId } from 'mongoose'
import dbConnect from './dbConnect'

/**
 * Type for API route handlers
 */
export type ApiHandler = (req: NextRequest, params?: { [key: string]: string }) => Promise<NextResponse>

/**
 * Wrapper for API routes to handle database connection and errors
 */
export function withMongoose(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, params?: { [key: string]: string }) => {
    try {
      // Connect to database
      await dbConnect()
      
      // Execute the handler
      return await handler(req, params)
    } catch (error) {
      console.error('API error:', error)
      
      // Handle specific error types
      if (error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json(
          { error: 'Validation error', details: formatValidationError(error) },
          { status: 400 }
        )
      }
      
      if (error instanceof mongoose.Error.CastError) {
        return NextResponse.json(
          { error: 'Invalid ID format' },
          { status: 400 }
        )
      }
      
      // Generic error response
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Format mongoose validation errors
 */
function formatValidationError(error: mongoose.Error.ValidationError) {
  const formattedErrors: Record<string, string> = {}
  
  for (const field in error.errors) {
    formattedErrors[field] = error.errors[field].message
  }
  
  return formattedErrors
}

/**
 * Validate MongoDB ObjectId
 */
export function validateObjectId(id: string) {
  if (!isValidObjectId(id)) {
    throw new Error('Invalid ID format')
  }
  return id
}

/**
 * Parse query parameters
 */
export function parseQueryParams(url: string) {
  const parsedUrl = new URL(url)
  const params = parsedUrl.searchParams
  
  // Helper to convert string values to appropriate types
  const convertValue = (value: string) => {
    // Convert boolean strings
    if (value === 'true') return true
    if (value === 'false') return false
    
    // Convert numeric strings
    if (/^\d+$/.test(value)) return parseInt(value, 10)
    if (/^\d+\.\d+$/.test(value)) return parseFloat(value)
    
    // Return original string
    return value
  }
  
  // Build query object
  const queryObj: Record<string, any> = {}
  params.forEach((value, key) => {
    queryObj[key] = convertValue(value)
  })
  
  return queryObj
}

/**
 * Create pagination parameters
 */
export function getPaginationParams(url: string) {
  const parsedUrl = new URL(url)
  const params = parsedUrl.searchParams
  
  const page = Math.max(1, parseInt(params.get('page') || '1', 10))
  const limit = Math.min(50, parseInt(params.get('limit') || '10', 10))
  const skip = (page - 1) * limit
  
  return { page, limit, skip }
}
