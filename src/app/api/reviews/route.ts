import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(100).optional(),
  comment: z.string().min(1).max(1000).optional(),
});

// Get reviews for a product or user's reviews
export async function GET(req: NextRequest) {
  try {
    await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const mine = searchParams.get('mine'); // Get user's own reviews
    const status = searchParams.get('status') || 'APPROVED';

    // If requesting user's own reviews
    if (mine === '1') {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const reviews = await prisma.review.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json(reviews);
    }

    // Original logic for product reviews
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId,
        status: status as 'PENDING' | 'APPROVED' | 'REJECTED',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map reviews to include reviewer information
    const mappedReviews = reviews.map(review => ({
      ...review,
      reviewerName: review.user?.name || 'Anonymous User',
      reviewerImage: review.user?.image || null,
      isAnonymous: !review.userId,
    }));

    return NextResponse.json({ reviews: mappedReviews });
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}} catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}// Create or update a review
export async function POST(req: NextRequest) {
  try {
    await connectDB();
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const validatedData = reviewSchema.parse(body);

    let userId: string | null = null;
    let anonymousToken: string | null = null;

    // Get or create reviewer identifier
    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      // For anonymous users, get or create a persistent token
      const cookieStore = cookies();
      anonymousToken = (await cookieStore).get('review_token')?.value;
      
      if (!anonymousToken) {
        anonymousToken = nanoid(32);
        // Set cookie to expire in 1 year
        (await cookieStore).set('review_token', anonymousToken, {
          maxAge: 365 * 24 * 60 * 60, // 1 year
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
      }
    }

    // Check if a review already exists for this product and reviewer
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: validatedData.productId,
        ...(userId ? { userId } : { anonymousToken }),
      },
    });

    let review;
    if (existingReview) {
      // Update existing review (re-submit for moderation)
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating: validatedData.rating,
          title: validatedData.title,
          comment: validatedData.comment,
          status: 'PENDING', // Re-queue for approval
          moderatorId: null,
          moderatedAt: null,
          moderationNote: null,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    } else {
      // Create new review
      review = await prisma.review.create({
        data: {
          productId: validatedData.productId,
          rating: validatedData.rating,
          title: validatedData.title,
          comment: validatedData.comment,
          userId,
          anonymousToken,
          status: 'PENDING',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    }

    return NextResponse.json({
      review: {
        ...review,
        reviewerName: review.user?.name || 'Anonymous User',
        reviewerImage: review.user?.image || null,
        isAnonymous: !review.userId,
      },
      message: existingReview ? 'Review updated and submitted for approval' : 'Review submitted for approval',
    });
  } catch (error) {
    console.error('Failed to create/update review:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid review data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

// Get user's review for a specific product
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    let userId: string | null = null;
    let anonymousToken: string | null = null;

    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      const cookieStore = cookies();
      anonymousToken = (await cookieStore).get('review_token')?.value;
    }

    if (!userId && !anonymousToken) {
      return NextResponse.json({ review: null });
    }

    const review = await prisma.review.findFirst({
      where: {
        productId,
        ...(userId ? { userId } : { anonymousToken }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ review: null });
    }

    return NextResponse.json({
      review: {
        ...review,
        reviewerName: review.user?.name || 'Anonymous User',
        reviewerImage: review.user?.image || null,
        isAnonymous: !review.userId,
      },
    });
  } catch (error) {
    console.error('Failed to fetch user review:', error);
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 });
  }
}