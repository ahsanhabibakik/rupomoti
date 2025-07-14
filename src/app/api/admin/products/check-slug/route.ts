import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAdminAccess } from '@/lib/admin-auth';
import { isSlugAvailable, validateSlug } from '@/lib/utils/slug';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { authorized } = await verifyAdminAccess();
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const excludeProductId = searchParams.get('excludeProductId');

    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
    }

    // Validate slug format
    if (!validateSlug(slug)) {
      return NextResponse.json({
        available: false,
        error: 'Invalid slug format. Slug must contain only lowercase letters, numbers, and hyphens.'
      });
    }

    const available = await isSlugAvailable(slug, excludeProductId || undefined);

    return NextResponse.json({ 
      available,
      slug,
      message: available 
        ? 'Slug is available' 
        : 'Slug is already taken'
    });
  } catch (error) {
    console.error('Failed to check slug availability:', error);
    return NextResponse.json({ error: 'Failed to check slug availability' }, { status: 500 });
  }
}