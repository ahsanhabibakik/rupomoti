import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import Product from '@/models/Product'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test basic environment
    const env = {
      NODE_ENV: process.env.NODE_ENV || 'undefined',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'undefined',
      hasDatabase: !!process.env.DATABASE_URL,
      runtime: process.env.NEXT_RUNTIME || 'undefined'
    }
    
    // Test if we can make internal API calls
    let apiTest = { success: false, error: null, productsFound: 0 }
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'https://rupomoti.com'
      const response = await fetch(`${baseUrl}/api/products-mongo?limit=1`, {
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const data = await response.json()
        apiTest = {
          success: true,
          error: null,
          productsFound: data.products?.length || 0
        }
      } else {
        apiTest = {
          success: false,
          error: `API returned ${response.status}: ${response.statusText}`,
          productsFound: 0
        }
      }
    } catch (apiError) {
      apiTest = {
        success: false,
        error: apiError instanceof Error ? apiError.message : 'Unknown API error',
        productsFound: 0
      }
    }
    
    // Test direct database access
    let dbTest = { success: false, error: null, productsFound: 0 }
    try {
      await dbConnect()
      const productCount = await Product.countDocuments({ status: 'ACTIVE' })
      
      dbTest = {
        success: true,
        error: null,
        productsFound: productCount
      }
    } catch (dbError) {
      dbTest = {
        success: false,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        productsFound: 0
      }
    }
    
    return NextResponse.json({
      message: 'Simple production test',
      environment: env,
      apiTest,
      databaseTest: dbTest,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
