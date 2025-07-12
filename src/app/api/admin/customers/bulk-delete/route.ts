import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';


import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth';
import { AuditLogger } from '@/lib/audit-logger';

export async function POST(req: Request) {
  try {
    await connectDB();
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user ||
      !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customerIds } = await request.json();

    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { error: 'Customer IDs are required' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Bulk deleting ${customerIds.length} customers...`);

    // Get customer details for audit log
    const customersToDelete = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, name: true, email: true }
    });

    // Delete customers (this should cascade to related records)
    const deleteResult = await prisma.customer.deleteMany({
      where: { id: { in: customerIds } }
    });

    // Log the action
    await AuditLogger.log({
      action: 'BULK_DELETE_CUSTOMERS',
      userId: session.user.id,
      details: {
        deletedCustomers: customersToDelete,
        deletedCount: deleteResult.count
      }
    });

    console.log(`✅ Successfully deleted ${deleteResult.count} customers`);

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
      message: `Successfully deleted ${deleteResult.count} customer(s)`
    });
  } catch (error) {
    console.error('❌ Failed to delete customers:', error);
    return NextResponse.json(
      { error: 'Failed to delete customers' },
      { status: 500 }
    );
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
}