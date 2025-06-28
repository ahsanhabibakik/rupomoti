import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/app/auth';
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
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { orderId } = params;
    if (!orderId) {
      return new NextResponse("Order ID is required", { status: 400 });
    }

    const body = await request.json();
    const validation = patchBodySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', issues: validation.error.issues }, { status: 400 });
    }
    
    const updates = validation.data;
    const { note, ...updateData } = updates;

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const originalOrder = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!originalOrder) {
        throw Object.assign(new Error("Order not found"), { status: 404 });
      }

      const auditLogs: Prisma.AuditLogCreateManyInput[] = [];
      const userId = session.user.id;

      for (const key in updateData) {
        const typedKey = key as keyof typeof updateData;
        const oldValue = originalOrder[typedKey];
        const newValue = updateData[typedKey];
        if (oldValue !== newValue) {
          auditLogs.push({
            model: 'Order',
            recordId: orderId,
            userId,
            action: 'UPDATE',
            field: key,
            oldValue: String(oldValue ?? ''),
            newValue: String(newValue ?? ''),
          });
        }
      }
      
      if (note) {
        auditLogs.push({
            model: 'Order',
            recordId: orderId,
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
        where: { id: orderId },
        data: updateData,
      });
      
      return updated;
    });

    return NextResponse.json(updatedOrder);

  } catch (error: unknown) {
    console.error("Error updating order:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', issues: error.issues }, { status: 400 });
    }
    // For custom errors with a status property
    if (error && typeof error === 'object' && 'status' in error) {
      const httpError = error as { status: number; message: string };
      return new NextResponse(httpError.message, { status: httpError.status });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { orderId } = params;
    if (!orderId) {
      return new NextResponse("Order ID is required", { status: 400 });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { deletedAt: new Date() },
    });

    return new NextResponse(null, { status: 204 }); // No Content
    
  } catch (error: unknown) {
    console.error("[ORDER_DELETE]", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return new NextResponse("Order not found", { status: 404 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 