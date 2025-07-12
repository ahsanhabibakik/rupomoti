import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
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
