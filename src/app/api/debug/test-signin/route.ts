import { NextRequest, NextResponse } from 'next/server'
import { signIn } from 'next-auth/react'

export const POST = withMongoose(async (req) => {
  try {
    const { email, password } = await request.json()
    
    console.log('Testing signin with:', { email, password: '***' })
    
    // This won't work in a server component, but let's create a test
    return NextResponse.json({
      message: 'This endpoint is for testing only. Use the actual signin process.',
      testCredentials: {
        email: 'admin@rupomoti.com',
        password: 'admin123'
      }
    })
  } catch (error) {
    console.error('Test signin error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
