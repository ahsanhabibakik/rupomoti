import { NextResponse } from 'next/server'
import { auth } from '@/app/auth';

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.role || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Placeholder response - stock history will be fully implemented after Prisma update
    return NextResponse.json({
      logs: [],
      total: 0,
      hasMore: false,
    })
  } catch (error) {
    console.error('Error fetching stock history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock history' },
      { status: 500 }
    )
  }
}
