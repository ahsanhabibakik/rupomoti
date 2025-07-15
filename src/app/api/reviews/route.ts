import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth-node';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import Review from '@/models/Review';
import Product from '@/models/Product';
import User from '@/models/User';

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
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const mine = searchParams.get('mine');
    const status = searchParams.get('status') || 'APPROVED';
    if (mine === '1') {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const reviews = await Review.find({ userId: session.user.id })
        .populate('product', 'id name price images')
        .sort({ createdAt: -1 });
      return NextResponse.json(reviews);
    }
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    const reviews = await Review.find({ 
      productId, 
      status: status as 'PENDING' | 'APPROVED' | 'REJECTED' 
    })
      .populate('user', 'id name image')
      .sort({ createdAt: -1 });
    const mappedReviews = reviews.map(review => ({
      ...review.toObject(),
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
// Create or update a review
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    const body = await req.json();
    const validatedData = reviewSchema.parse(body);
    let userId: string | null = null;
    let anonymousToken: string | null = null;
    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      const cookieStore = cookies();
      anonymousToken = (await cookieStore).get('review_token')?.value;
      if (!anonymousToken) {
        anonymousToken = nanoid(32);
        (await cookieStore).set('review_token', anonymousToken, {
          maxAge: 365 * 24 * 60 * 60,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
      }
    }
    const existingReview = await Review.findOne({
      productId: validatedData.productId,
      ...(userId ? { userId } : { anonymousToken }),
    });
    let review;
    if (existingReview) {
      review = await Review.findByIdAndUpdate(
        existingReview._id,
        {
          rating: validatedData.rating,
          title: validatedData.title,
          comment: validatedData.comment,
          status: 'PENDING',
          moderatorId: null,
          moderatedAt: null,
          moderationNote: null,
          updatedAt: new Date(),
        },
        { new: true }
      ).populate('user', 'id name image');
    } else {
      review = await Review.create({
        productId: validatedData.productId,
        rating: validatedData.rating,
        title: validatedData.title,
        comment: validatedData.comment,
        userId,
        anonymousToken,
        status: 'PENDING',
      });
      review = await Review.findById(review._id).populate('user', 'id name image');
    }
    return NextResponse.json({
      review: {
        ...review.toObject(),
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
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    const session = await auth();
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
    const review = await Review.findOne({
      productId,
      ...(userId ? { userId } : { anonymousToken }),
    }).populate('user', 'id name image');
    if (!review) {
      return NextResponse.json({ review: null });
    }
    return NextResponse.json({
      review: {
        ...review.toObject(),
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