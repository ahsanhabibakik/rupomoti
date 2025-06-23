import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generateMissingSKUs } from '@/lib/utils/sku';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { count } = await generateMissingSKUs();

    return NextResponse.json({
      message: `Successfully generated SKUs for ${count} products`,
      count
    });
  } catch (error) {
    console.error('Error generating SKUs:', error);
    return NextResponse.json(
      { error: 'Failed to generate SKUs' },
      { status: 500 }
    );
  }
} 