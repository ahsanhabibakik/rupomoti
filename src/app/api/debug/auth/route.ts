import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth';

export async function GET(req: Request) {
  try {
    await connectDB();
  try {
    const session = await getServerSession(authOptions)
    
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
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}} catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}