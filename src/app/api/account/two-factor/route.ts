export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

import { randomBytes } from 'crypto';

// Email service (you might want to use a proper email service like SendGrid, Nodemailer, etc.)
async function sendVerificationEmail(email: string, code: string) {
  // For now, we'll just log the code. In production, you'd send an actual email
  console.log(`2FA Code for ${email}: ${code}`);
  // TODO: Implement actual email sending
}

export async function GET() {
  try {
    const { default: dbConnect } = await import('@/lib/mongoose');
    const { getUserModel } = await import('@/models/User');
    await dbConnect();
    const User = getUserModel();
    const { auth } = await import('@/lib/auth-node');
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(session.user.id)
      .select('+twoFactorEnabled +twoFactorMethod');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      enabled: user.twoFactorEnabled || false,
      method: user.twoFactorMethod || 'email'
    });
  } catch (error) {
    console.error('Error fetching 2FA status:', error);
    return NextResponse.json({ error: 'Failed to fetch 2FA status' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { default: dbConnect } = await import('@/lib/mongoose');
    const { getUserModel } = await import('@/models/User');
    await dbConnect();
    const User = getUserModel();
    const { auth } = await import('@/lib/auth-node');
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, verificationCode } = body;

    const user = await User.findById(session.user.id).select('+email +twoFactorEnabled +twoFactorSecret');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'enable') {
      // Generate a 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const secret = randomBytes(32).toString('hex');
      
      // Store the verification code temporarily (expires in 10 minutes)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      
      user.twoFactorSecret = secret;
      user.twoFactorCode = code;
      user.twoFactorCodeExpires = expiresAt;
      await user.save();

      // Send verification email
      await sendVerificationEmail(user.email!, code);

      return NextResponse.json({ 
        message: 'Verification code sent to your email. Please check your inbox.',
        step: 'verify'
      });
    }

    if (action === 'verify') {
      if (!verificationCode) {
        return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
      }

      const userWithCode = await User.findById(session.user.id)
        .select('+twoFactorCode +twoFactorCodeExpires');

      if (!userWithCode?.twoFactorCode || !userWithCode?.twoFactorCodeExpires) {
        return NextResponse.json({ error: 'No verification code found' }, { status: 400 });
      }

      if (new Date() > userWithCode.twoFactorCodeExpires) {
        return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 });
      }

      if (userWithCode.twoFactorCode !== verificationCode) {
        return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
      }

      // Enable 2FA
      userWithCode.twoFactorEnabled = true;
      userWithCode.twoFactorMethod = 'email';
      userWithCode.twoFactorCode = null;
      userWithCode.twoFactorCodeExpires = null;
      await userWithCode.save();

      return NextResponse.json({ 
        message: 'Two-factor authentication has been enabled successfully!',
        enabled: true
      });
    }

    if (action === 'disable') {
      user.twoFactorEnabled = false;
      user.twoFactorMethod = null;
      user.twoFactorSecret = null;
      user.twoFactorCode = null;
      user.twoFactorCodeExpires = null;
      await user.save();

      return NextResponse.json({ 
        message: 'Two-factor authentication has been disabled.',
        enabled: false
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing 2FA:', error);
    return NextResponse.json({ error: 'Failed to manage 2FA' }, { status: 500 });
  }
}