import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { prisma } from '@/lib/prisma';

// GET: /api/reviews?productId=... or /api/reviews?mine=1
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = new URL(req.url!);
  const productId = url.searchParams.get('productId');
  const mine = url.searchParams.get('mine');
  if (productId) {
    // Get reviews for a product
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: { user: { select: { name: true, image: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reviews);
  } else if (mine) {
    // Get reviews by current user
    const reviews = await prisma.review.findMany({
      where: { userId: session.user.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reviews);
  }
  return NextResponse.json([]);
}

// POST: add review
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { productId, rating, comment } = await req.json();
  if (!productId || !rating) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  // Check if user purchased and delivered
  const order = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      status: 'DELIVERED',
      items: { some: { productId } },
    },
  });
  if (!order) return NextResponse.json({ error: 'You can only review products you have received.' }, { status: 403 });
  // Check if already reviewed
  const existing = await prisma.review.findFirst({ where: { userId: session.user.id, productId } });
  if (existing) return NextResponse.json({ error: 'You already reviewed this product.' }, { status: 409 });
  const review = await prisma.review.create({
    data: { userId: session.user.id, productId, rating, comment },
  });
  return NextResponse.json(review);
}

// PUT: edit review
export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id, rating, comment } = await req.json();
  if (!id || !rating) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const review = await prisma.review.update({
    where: { id, userId: session.user.id },
    data: { rating, comment },
  });
  return NextResponse.json(review);
}

// DELETE: delete review
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await prisma.review.delete({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
} 