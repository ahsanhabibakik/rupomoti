import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAdminAccess } from '@/lib/admin-auth';


import { z } from 'zod';

const moderationSchema = z.object({
  reviewId: z.string(),
  action: z.enum(['approve', 'reject']),
  moderationNote: z.string().optional(),
});

// Get pending reviews for moderation
export async function GET(req: Request) {
  try {
    await connectDB();
    const { authorized } = await verifyAdminAccess();
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING';
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    const where: Record<string, unknown> = { status };
    if (productId) {
      where.productId = productId;
    }

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.review.count({ where }),
    ]);

    // Map reviews to include reviewer information
    const mappedReviews = reviews.map(review => ({
      ...review,
      reviewerName: review.user?.name || 'Anonymous User',
      reviewerEmail: review.user?.email || null,
      reviewerImage: review.user?.image || null,
      isAnonymous: !review.userId,
    }));

    return NextResponse.json({
      reviews: mappedReviews,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    });
  } catch (error) {
    console.error('Failed to fetch reviews for moderation:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// Moderate a review (approve/reject)
export async function POST(req: Request) {
  try {
    await connectDB();
    const { authorized, user } = await verifyAdminAccess();
    if (!authorized || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = moderationSchema.parse(body);

    const review = await prisma.review.findUnique({
      where: { id: validatedData.reviewId },
      include: {
        product: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const newStatus = validatedData.action === 'approve' ? 'APPROVED' : 'REJECTED';

    const updatedReview = await prisma.review.update({
      where: { id: validatedData.reviewId },
      data: {
        status: newStatus,
        moderatorId: user.id,
        moderatedAt: new Date(),
        moderationNote: validatedData.moderationNote,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      review: {
        ...updatedReview,
        reviewerName: updatedReview.user?.name || 'Anonymous User',
        reviewerEmail: updatedReview.user?.email || null,
        reviewerImage: updatedReview.user?.image || null,
        isAnonymous: !updatedReview.userId,
      },
      message: `Review ${validatedData.action === 'approve' ? 'approved' : 'rejected'} successfully`,
    });
  } catch (error) {
    console.error('Failed to moderate review:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid moderation data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to moderate review' }, { status: 500 });
  }
}

// Bulk moderation
export async function PUT(req: Request) {
  try {
    await connectDB();
    const { authorized, user } = await verifyAdminAccess();
    if (!authorized || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { reviewIds, action, moderationNote } = body;

    if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
      return NextResponse.json({ error: 'Review IDs are required' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

    const updatedReviews = await prisma.review.updateMany({
      where: {
        id: { in: reviewIds },
        status: 'PENDING', // Only update pending reviews
      },
      data: {
        status: newStatus,
        moderatorId: user.id,
        moderatedAt: new Date(),
        moderationNote,
      },
    });

    return NextResponse.json({
      count: updatedReviews.count,
      message: `${updatedReviews.count} reviews ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
    });
  } catch (error) {
    console.error('Failed to bulk moderate reviews:', error);
    return NextResponse.json({ error: 'Failed to moderate reviews' }, { status: 500 });
  }
}
