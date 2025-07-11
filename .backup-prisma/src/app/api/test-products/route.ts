import { NextResponse } from 'next/server'

// Simple test API to check if products are being returned correctly
export async function GET() {
  try {
    // Test the products-mongo endpoint
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/products-mongo?limit=5`, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Failed to fetch products',
        status: response.status,
        statusText: response.statusText 
      }, { status: 500 })
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      products: data.products?.length || 0,
      totalProducts: data.totalProducts || 0,
      sample: data.products?.[0] || null,
      env: {
        nodeEnv: process.env.NODE_ENV,
        nextauthUrl: process.env.NEXTAUTH_URL,
        hasDb: !!process.env.DATABASE_URL
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'API test failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
