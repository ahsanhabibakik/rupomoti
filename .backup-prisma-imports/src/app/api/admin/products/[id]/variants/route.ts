import { NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin-auth';
import { withMongoose, parseQueryParams, getPaginationParams } from '@/lib/mongoose-utils';


export const GET = withMongoose(async (req) => {
  try {
    const { authorized } = await verifyAdminAccess();
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const variants = await prisma.productVariant.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ variants });
  } catch (error) {
    console.error('Failed to fetch variants:', error);
    return NextResponse.json({ error: 'Failed to fetch variants' }, { status: 500 });
  }
}
