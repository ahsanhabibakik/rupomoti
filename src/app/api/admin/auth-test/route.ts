import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth-node';


export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ 
        authenticated: false, 
        error: 'No session found' 
      }, { status: 401 });
    }

    const hasPermission = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        isAdmin: session.user.isAdmin,
      },
      hasMediaPermission: hasPermission
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
