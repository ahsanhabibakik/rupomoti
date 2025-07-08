import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's email notification settings
    const settings = await prisma.userSetting.findMany({
      where: { 
        userId: session.user.id,
        key: { in: ['emailNotifications', 'orderUpdates', 'promotionalEmails', 'newsletter'] }
      }
    });

    // Convert to object format
    const emailSettings = {
      orderUpdates: true, // default
      promotionalEmails: false, // default  
      newsletter: false // default
    };

    settings.forEach(setting => {
      if (setting.key === 'emailNotifications') {
        Object.assign(emailSettings, setting.value as any);
      } else {
        emailSettings[setting.key as keyof typeof emailSettings] = setting.value as boolean;
      }
    });

    return NextResponse.json(emailSettings);
  } catch (error) {
    console.error('Error fetching email settings:', error);
    return NextResponse.json({ error: 'Failed to fetch email settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderUpdates, promotionalEmails, newsletter } = body;

    // Update or create email notification settings
    await prisma.userSetting.upsert({
      where: {
        userId_key: {
          userId: session.user.id,
          key: 'emailNotifications'
        }
      },
      update: {
        value: {
          orderUpdates: orderUpdates ?? true,
          promotionalEmails: promotionalEmails ?? false,
          newsletter: newsletter ?? false
        }
      },
      create: {
        userId: session.user.id,
        key: 'emailNotifications',
        value: {
          orderUpdates: orderUpdates ?? true,
          promotionalEmails: promotionalEmails ?? false,
          newsletter: newsletter ?? false
        }
      }
    });

    return NextResponse.json({ 
      message: 'Email notification settings updated successfully',
      settings: {
        orderUpdates: orderUpdates ?? true,
        promotionalEmails: promotionalEmails ?? false,
        newsletter: newsletter ?? false
      }
    });
  } catch (error) {
    console.error('Error updating email settings:', error);
    return NextResponse.json({ error: 'Failed to update email settings' }, { status: 500 });
  }
}
