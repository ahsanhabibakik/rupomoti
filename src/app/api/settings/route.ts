import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await prisma.userSetting.findUnique({
      where: { userId: session.user.id }
    });

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.userSetting.create({
        data: {
          userId: session.user.id,
          emailNotifications: {
            orderUpdates: true,
            promotionalEmails: false,
            newsletter: false
          },
          smsNotifications: {
            orderUpdates: true,
            promotionalSms: false
          },
          privacySettings: {
            profileVisibility: 'public',
            showEmail: false,
            showPhone: false
          }
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { emailNotifications, smsNotifications, privacySettings } = body;

    let settings = await prisma.userSetting.findUnique({
      where: { userId: session.user.id }
    });

    if (settings) {
      // Update existing settings
      settings = await prisma.userSetting.update({
        where: { userId: session.user.id },
        data: {
          emailNotifications: emailNotifications || settings.emailNotifications,
          smsNotifications: smsNotifications || settings.smsNotifications,
          privacySettings: privacySettings || settings.privacySettings
        }
      });
    } else {
      // Create new settings
      settings = await prisma.userSetting.create({
        data: {
          userId: session.user.id,
          emailNotifications: emailNotifications || {
            orderUpdates: true,
            promotionalEmails: false,
            newsletter: false
          },
          smsNotifications: smsNotifications || {
            orderUpdates: true,
            promotionalSms: false
          },
          privacySettings: privacySettings || {
            profileVisibility: 'public',
            showEmail: false,
            showPhone: false
          }
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
} 