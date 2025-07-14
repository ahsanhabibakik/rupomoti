import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/app/auth';



export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const paymentMethods = await prisma.userPaymentMethod.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json({ error: 'Failed to fetch payment methods' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { type, provider, cardNumber, expiryMonth, expiryYear, cardholderName, isDefault } = body;
    if (!type || !provider || !cardNumber || !expiryMonth || !expiryYear || !cardholderName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    // Mask the card number for security
    const last4 = cardNumber.slice(-4);
    const maskedCardNumber = `**** **** **** ${last4}`;
    const paymentMethod = await prisma.userPaymentMethod.create({
      data: {
        type,
        provider,
        cardNumber: maskedCardNumber,
        last4,
        expiryMonth,
        expiryYear,
        cardholderName,
        isDefault: isDefault || false,
        userId: session.user.id
      }
    });
    return NextResponse.json(paymentMethod);
  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json({ error: 'Failed to create payment method' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { id, type, provider, cardNumber, expiryMonth, expiryYear, cardholderName, isDefault } = body;
    if (!id || !type || !provider || !cardNumber || !expiryMonth || !expiryYear || !cardholderName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    // Verify the payment method belongs to the user
    const existingPaymentMethod = await prisma.userPaymentMethod.findFirst({
      where: { id, userId: session.user.id }
    });

    if (!existingPaymentMethod) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
    }

    // Mask the card number for security
    const last4 = cardNumber.slice(-4);
    const maskedCardNumber = `**** **** **** ${last4}`;

    const paymentMethod = await prisma.userPaymentMethod.update({
      where: { id },
      data: {
        type,
        provider,
        cardNumber: maskedCardNumber,
        last4,
        expiryMonth,
        expiryYear,
        cardholderName,
        isDefault: isDefault || false
      }
    });

    return NextResponse.json(paymentMethod);
  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json({ error: 'Failed to update payment method' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Payment method ID is required' }, { status: 400 });
    }

    // Verify the payment method belongs to the user
    const existingPaymentMethod = await prisma.userPaymentMethod.findFirst({
      where: { id, userId: session.user.id }
    });

    if (!existingPaymentMethod) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
    }

    await prisma.userPaymentMethod.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json({ error: 'Failed to delete payment method' }, { status: 500 });
  }
} 