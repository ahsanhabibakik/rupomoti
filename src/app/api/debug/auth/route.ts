import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    
    console.log('Debug Auth - Session:', JSON.stringify(session, null, 2))
    
    return NextResponse.json({
      session: session,
      hasSession: !!session,
      hasUser: !!session?.user,
      hasUserId: !!session?.user?.id,
      userRole: session?.user?.role,
      isAdmin: session?.user?.isAdmin
    })
  } catch (error) {
    console.error('Debug Auth - Error:', error)
    return NextResponse.json({ 
      error: 'Error getting session', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
