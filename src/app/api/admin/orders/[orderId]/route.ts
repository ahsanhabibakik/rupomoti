import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
const { auth } = await import('@/app/auth');


// Define OrderStatus type to replace Prisma import
const OrderStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};
// Define PaymentStatus type to replace Prisma import
const PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};


const patchBodySchema = z.object({
  recipientName: z.string().min(1, "Name is required").optional(),
  recipientPhone: z.string().min(1, "Phone is required").optional(),
  deliveryAddress: z.string().min(1, "Address is required").optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  courierName: z.string().optional().nullable(),
  trackingId: z.string().optional().nullable(),
  note: z.string().optional(),
  restore: z.boolean().optional(),
  markAsFake: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = patchBodySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', issues: validation.error.issues }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
        where: { id: params.orderId },
        include: { user: true }
    });

    if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updates = validation.data;
    const { note, restore, markAsFake, ...updateData } = updates;

    // Handle special actions
    if (restore) {
      await prisma.order.update({
          where: { id: params.orderId },
          data: { deletedAt: null },
      });
      return NextResponse.json({ success: true, message: 'Order restored successfully.' });
    }

    if (markAsFake !== undefined) {
      const updatedOrder = await prisma.$transaction(async (tx) => {
        // Update order
        const order = await tx.order.update({
          where: { id: params.orderId },
          data: { isFakeOrder: markAsFake },
        });

        // If marking as fake and user exists, flag the user
        if (markAsFake && order.userId) {
          await tx.user.update({
            where: { id: order.userId },
            data: { isFlagged: true }
          });
        }

        // Create audit log
        if (session.user.id) {
          await tx.auditLog.create({
            data: {
              model: 'Order',
              recordId: params.orderId,
              userId: session.user.id,
              action: 'UPDATE',
              field: 'isFakeOrder',
              oldValue: String(order.isFakeOrder),
              newValue: String(markAsFake),
            }
          });
        }

        return order;
      });

      const message = markAsFake ? 'Order marked as fake and user flagged.' : 'Order unmarked as fake.';
      return NextResponse.json(updatedOrder);
    }

    // Handle regular order updates
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const originalOrder = await tx.order.findUnique({
        where: { id: params.orderId },
      });

      if (!originalOrder) {
        throw new Error("Order not found");
      }

      const auditLogs: Prisma.AuditLogCreateManyInput[] = [];
      const userId = session.user.id;

      // Create audit logs for changes
      for (const key in updateData) {
        const typedKey = key as keyof typeof updateData;
        const oldValue = originalOrder[typedKey];
        const newValue = updateData[typedKey];
        if (oldValue !== newValue && userId) {
          auditLogs.push({
            model: 'Order',
            recordId: params.orderId,
            userId,
            action: 'UPDATE',
            field: key,
            oldValue: String(oldValue ?? ''),
            newValue: String(newValue ?? ''),
          });
        }
      }
      
      if (note && userId) {
        auditLogs.push({
            model: 'Order',
            recordId: params.orderId,
            userId,
            action: 'NOTE',
            field: 'note',
            oldValue: '',
            newValue: note,
        })
      }

      if (auditLogs.length > 0) {
        await tx.auditLog.createMany({
          data: auditLogs,
        });
      }

      if (Object.keys(updateData).length === 0) {
        return originalOrder;
      }
      
      const updated = await tx.order.update({
        where: { id: params.orderId },
        data: updateData,
      });
      
      return updated;
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      select: { userId: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: params.orderId },
        data: { deletedAt: new Date() },
      });

      if (order.userId) {
        await tx.user.update({
          where: { id: order.userId },
          data: { isFlagged: true },
        });
      }
    });

    return NextResponse.json({ success: true, message: 'Order moved to trash.' });
  } catch (error) {
    console.error('Failed to delete order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
} 