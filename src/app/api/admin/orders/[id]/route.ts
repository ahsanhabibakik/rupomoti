import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth-config';

const updateOrderSchema = z.object({
  courierName: z.enum(['steadfast', 'redx', 'pathao', 'carrybee']).optional(),
  recipientCity: z.string().optional(),
  recipientZone: z.string().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']).optional(),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authConfig);
  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MANAGER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = updateOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', issues: validation.error.issues }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(updatedOrder);

  } catch (error) {
    console.error(`Error updating order ${id}:`, error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
} 