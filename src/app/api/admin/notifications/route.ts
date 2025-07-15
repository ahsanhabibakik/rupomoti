import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-node';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return empty notifications since we're using dynamic notifications
    // In a real app, you might want to fetch notifications from a database
    return NextResponse.json({ 
      notifications: [],
      unreadCount: 0 
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


