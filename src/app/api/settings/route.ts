import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const settings = await prisma.userSetting.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const updates = await req.json();
  const promises = Object.entries(updates).map(([key, value]) =>
    prisma.userSetting.upsert({
      where: { userId_key: { userId: session.user.id, key } },
      update: { value },
      create: { userId: session.user.id, key, value },
    })
  );
  await Promise.all(promises);
  return NextResponse.json({ success: true });
} 