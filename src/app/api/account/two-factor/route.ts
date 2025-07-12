import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/auth';


import { randomBytes } from 'crypto';

// Email service (you might want to use a proper email service like SendGrid, Nodemailer, etc.)
async function sendVerificationEmail(email: string, code: string) {
  // For now, we'll just log the code. In production, you'd send an actual email
  console.log(`2FA Code for ${email}: ${code}`);
  // TODO: Implement actual email sending
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        email: true,
        twoFactorEnabled: true,
        twoFactorMethod: true
      }
    });

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
    await connectDB();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, verificationCode } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        email: true,
        twoFactorEnabled: true,
        twoFactorSecret: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'enable') {
      // Generate a 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const secret = randomBytes(32).toString('hex');
      
      // Store the verification code temporarily (expires in 10 minutes)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorSecret: secret,
          twoFactorCode: code,
          twoFactorCodeExpires: expiresAt
        }
      });

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

      const userWithCode = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { 
          twoFactorCode: true,
          twoFactorCodeExpires: true
        }
      });

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
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorEnabled: true,
          twoFactorMethod: 'email',
          twoFactorCode: null,
          twoFactorCodeExpires: null
        }
      });

      return NextResponse.json({ 
        message: 'Two-factor authentication has been enabled successfully!',
        enabled: true
      });
    }

    if (action === 'disable') {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorEnabled: false,
          twoFactorMethod: null,
          twoFactorSecret: null,
          twoFactorCode: null,
          twoFactorCodeExpires: null
        }
      });

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
}