export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-node';
import { connectDB } from '@/lib/db';
import Address from '@/models/Address';

export async function GET() {
  try {
    
    await connectDB();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await Address.find({ userId: session.user.id }).sort({ createdAt: -1 });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    
    await connectDB();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, street, city, state, postalCode, country } = body;

    if (!name || !phone || !street || !city || !state || !postalCode || !country) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const address = await Address.create({
      name,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      userId: session.user.id,
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    
    await connectDB();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, phone, street, city, state, postalCode, country } = body;

    if (!id || !name || !phone || !street || !city || !state || !postalCode || !country) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Verify the address belongs to the user
    const existingAddress = await Address.findOne({ _id: id, userId: session.user.id });

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    const address = await Address.findByIdAndUpdate(id, {
      name,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
    }, { new: true });

    return NextResponse.json(address);
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    
    await connectDB();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    // Verify the address belongs to the user
    const existingAddress = await Address.findOne({ _id: id, userId: session.user.id });

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    await Address.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
} 