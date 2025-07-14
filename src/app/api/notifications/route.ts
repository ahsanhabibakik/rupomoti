import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth';



export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return mock notifications since we don't have a notifications table
    // In a real app, you'd have a notifications table in your database
    const notifications = [
      {
        id: '1',
        title: 'New Order Received',
        message: 'You have received a new order #12345',
        type: 'order',
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Product Stock Low',
        message: 'Product "Sample Product" is running low on stock',
        type: 'inventory',
        read: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '3',
        title: 'New Customer Registration',
        message: 'A new customer has registered on your store',
        type: 'customer',
        read: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { notificationId, read } = await request.json();
    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}