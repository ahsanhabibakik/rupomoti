import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createReviewData } from '@/lib/actions/review-actions';
import { auth } from '@/lib/auth-node';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const formData = await request.formData();
    const productId = formData.get('productId') as string;
    const rating = parseInt(formData.get('rating') as string, 10);
    const comment = formData.get('comment') as string;
    const productSlug = formData.get('productSlug') as string;
    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const result = await createReviewData({ productId, rating, comment, userId: session.user.id });
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    if (productSlug) {
      revalidatePath(`/products/${productSlug}`);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in review-action POST:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
} 