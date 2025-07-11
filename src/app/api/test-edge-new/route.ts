import { NextResponse } from 'next/server'

// Edge Runtime configuration
export const runtime = 'edge'

export async function GET() {
  try {
    console.log('Testing Edge Runtime...')
    
    // Edge runtime test without database (since Mongoose doesn't work in edge runtime)
    const testData = {
      status: 'success',
      message: 'Edge runtime is working (database testing moved to Node.js runtime)',
      data: {
        runtime: 'edge',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        note: 'Database operations have been migrated to Mongoose and work in Node.js runtime'
      }
    }
    
    console.log('Edge: Test successful')
    
    return NextResponse.json(testData)
    
  } catch (error: unknown) {
    console.error('Edge Runtime Error:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Edge runtime test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      runtime: 'edge'
    }, { status: 500 })
  }
}
