export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { getUserModel } from '@/models/User';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import { AuditLogger } from '@/lib/audit-logger';
import AuditLog from '@/models/AuditLog';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await auth();
    if (
      !session ||
      !session.user ||
      !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customerIds } = await req.json();

    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { error: 'Customer IDs are required' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Bulk deleting ${customerIds.length} customers...`);

    // Get customer details for audit log
    const customersToDelete = await User.find({
      _id: { $in: customerIds }
    }).select('_id name email');

    // Delete customers (this should cascade to related records)
    const deleteResult = await User.deleteMany({
      _id: { $in: customerIds }
    });

    // Log the action
    await AuditLogger.log({
      action: 'BULK_DELETE_CUSTOMERS',
      userId: session.user.id,
      details: {
        deletedCustomers: customersToDelete,
        deletedCount: deleteResult.deletedCount
      }
    });

    console.log(`✅ Successfully deleted ${deleteResult.deletedCount} customers`);

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.deletedCount,
      message: `Successfully deleted ${deleteResult.deletedCount} customer(s)`
    });
  } catch (error) {
    console.error('❌ Failed to delete customers:', error);
    return NextResponse.json(
      { error: 'Failed to delete customers' },
      { status: 500 }
    );
  }
}