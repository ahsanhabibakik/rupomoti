import { NextResponse } from 'next/server';

import { hash, compare } from 'bcryptjs';
import { auth } from '@/lib/auth-node';

export async function PUT(req: Request) {
  try {
    const { default: dbConnect } = await import('@/lib/mongoose');
    const { getUserModel } = await import('@/models/User');
    await dbConnect();
    const User = getUserModel();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' }, 
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' }, 
        { status: 400 }
      );
    }

    // Get user with password
    const user = await User.findById(session.user.id).select('+password');

    if (!user || !user.password) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isCurrentPasswordValid = await compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Hash new password
    const hashedNewPassword = await hash(newPassword, 12);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}