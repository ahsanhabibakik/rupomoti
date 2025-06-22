import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const providers = await prisma.shippingProvider.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      isActive: true,
      pathaoStoreId: true,
      redxStoreId: true,
      createdAt: true,
      updatedAt: true
    }
  });
  return NextResponse.json(providers);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const provider = await prisma.shippingProvider.create({
      data: {
        name: data.name,
        type: data.type,
        isActive: data.isActive,
        pathaoApiKey: data.type === 'pathao' ? data.apiKey : undefined,
        pathaoApiSecret: data.type === 'pathao' ? data.apiSecret : undefined,
        pathaoStoreId: data.type === 'pathao' ? data.storeId : undefined,
        redxApiKey: data.type === 'redx' ? data.apiKey : undefined,
        redxStoreId: data.type === 'redx' ? data.storeId : undefined
      }
    });
    return NextResponse.json(provider);
  } catch (error) {
    console.error('Error creating shipping provider:', error);
    return NextResponse.json(
      { error: 'Failed to create shipping provider' },
      { status: 500 }
    );
  }
}
