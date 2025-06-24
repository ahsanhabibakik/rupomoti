import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
  const exists = await prisma.wishlistItem.findFirst({ where: { userId: session.user.id, productId } });
  if (exists) return NextResponse.json({ error: 'Already in wishlist' }, { status: 409 });
  const item = await prisma.wishlistItem.create({ data: { userId: session.user.id, productId } });
  return NextResponse.json(item);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
  await prisma.wishlistItem.deleteMany({ where: { userId: session.user.id, productId } });
  return NextResponse.json({ success: true });
} 