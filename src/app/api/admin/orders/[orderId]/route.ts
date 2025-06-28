import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { auth } from '@/app/auth';
import { prisma } from "@/lib/prisma";
import { Prisma, PaymentStatus, OrderStatus } from '@prisma/client';

const patchBodySchema = z.object({
  recipientName: z.string().min(1, "Name is required").optional(),
  recipientPhone: z.string().min(1, "Phone is required").optional(),
  deliveryAddress: z.string().min(1, "Address is required").optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  courierName: z.string().optional().nullable(),
  trackingId: z.string().optional().nullable(),
  note: z.string().optional(),
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
    const order = await prisma.order.findUnique({
        where: { id: params.orderId },
        include: { user: true }
    });

    if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Handle different actions
    if (body.restore) {
      // Restore order from trash
      await prisma.order.update({
          where: { id: params.orderId },
          data: { deletedAt: null },
      });
      return NextResponse.json({ success: true, message: 'Order restored successfully.' });
    }

    if (body.markAsFake !== undefined) {
      // Mark order as fake and optionally flag the user
      const updateData: any = { isFakeOrder: body.markAsFake };
      
      await prisma.order.update({
          where: { id: params.orderId },
          data: updateData,
      });

      // If marking as fake and user exists, flag the user
      if (body.markAsFake && order.userId) {
        await prisma.user.update({
          where: { id: order.userId },
          data: { isFlagged: true }
        });
      }

      const message = body.markAsFake ? 'Order marked as fake and user flagged.' : 'Order unmarked as fake.';
      return NextResponse.json({ success: true, message });
    }

    // Default restore behavior for backward compatibility
    await prisma.order.update({
        where: { id: params.orderId },
        data: { deletedAt: null },
    });

    return NextResponse.json({ success: true, message: 'Order restored successfully.' });
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