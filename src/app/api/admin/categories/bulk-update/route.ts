import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { auth } from '@/lib/auth-node';
import { AuditLogger } from '@/lib/audit-logger';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const session = await auth();
    
    // Check authentication and authorization
    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const { action, categoryIds } = body;

    // Validate input
    if (!action || !categoryIds?.length) {
      return NextResponse.json({ error: 'Invalid request. Action and category IDs are required.' }, { status: 400 });
    }

    // Check that action is valid
    if (!['activate', 'deactivate'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be activate or deactivate.' }, { status: 400 });
    }

    // Log the action for auditing
    await AuditLogger.log({
      userId: session.user.id,
      action: `BULK_${action.toUpperCase()}_CATEGORIES`,
      resource: 'categories',
      details: { categoryIds }
    });

    // Update categories
    const isActive = action === 'activate';
    
    const updatedCategories = await Category.updateMany(
      { _id: { $in: categoryIds } },
      { isActive }
    );

    return NextResponse.json({
      message: `Categories ${action}d successfully`,
      count: updatedCategories.modifiedCount
    });
  } catch (error) {
    console.error(`Error during bulk ${req.method} categories:`, error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}