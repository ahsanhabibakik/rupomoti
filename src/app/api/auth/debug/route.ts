import { NextResponse } from 'next/server'
const { auth } = await import('@/app/auth');

export async function GET() {
  try {
    const session = await auth()
    return NextResponse.json({ 
      status: 'ok', 
      session: session ? { user: session.user } : null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Auth debug error:', error)
    return NextResponse.json({ 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
