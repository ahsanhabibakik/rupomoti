import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';



const prisma = new PrismaClient();

// Update product stock
export async function PATCH(req: Request) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { productId, quantity, operation } = await req.json();
    if (!productId || typeof quantity !== 'number') {
      return NextResponse.json({ error: 'Product ID and quantity are required' }, { status: 400 });
    }
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    let newStock = product.stock;
    switch (operation) {
      case 'decrement':
        newStock = Math.max(0, product.stock - quantity);
        break;
      case 'increment':
        newStock = product.stock + quantity;
        break;
      case 'set':
        newStock = Math.max(0, quantity);
        break;
      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { 
        stock: newStock,
        updatedAt: new Date()
      }
    });
    await prisma.stockLog.create({
      data: {
        productId,
        previousStock: product.stock,
        newStock,
        changeAmount: newStock - product.stock,
        operation,
        reason: `Stock ${operation} via API`,
        userId: session.user.id,
      }
    }).catch(() => {
      console.log('Stock log table not found, skipping log');
    });
    return NextResponse.json({
      success: true,
      product: updatedProduct,
      previousStock: product.stock,
      newStock
    });
  } catch (error) {
    console.error('Stock update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update stock',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
// Bulk stock update
export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { updates } = await req.json(); // Array of {productId, quantity, operation}
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'Updates array is required' }, { status: 400 });
    }
    const results = [];
    for (const update of updates) {
      try {
        const { productId, quantity, operation } = update;
        const product = await prisma.product.findUnique({
          where: { id: productId }
        });
        if (!product) {
          results.push({ productId, success: false, error: 'Product not found' });
          continue;
        }
        let newStock = product.stock;
        switch (operation) {
          case 'decrement':
            newStock = Math.max(0, product.stock - quantity);
            break;
          case 'increment':
            newStock = product.stock + quantity;
            break;
          case 'set':
            newStock = Math.max(0, quantity);
            break;
          default:
            results.push({ productId, success: false, error: 'Invalid operation' });
            continue;
        }
        const updatedProduct = await prisma.product.update({
          where: { id: productId },
          data: { 
            stock: newStock,
            updatedAt: new Date()
          }
        });
        await prisma.stockLog.create({
          data: {
            productId,
            previousStock: product.stock,
            newStock,
            changeAmount: newStock - product.stock,
            operation,
            reason: `Bulk stock ${operation}`,
            userId: session.user.id,
          }
        }).catch(() => {
          console.log('Stock log table not found, skipping log');
        });
        results.push({ 
          productId, 
          success: true, 
          previousStock: product.stock, 
          newStock,
          product: updatedProduct
        });
      } catch (error) {
        results.push({ 
          productId: update.productId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    return NextResponse.json({
      success: true,
      results,
      totalUpdates: updates.length,
      successCount: results.filter(r => r.success).length,
      failureCount: results.filter(r => !r.success).length
    });
  } catch (error) {
    console.error('Bulk stock update error:', error);
    return NextResponse.json({ 
      error: 'Failed to perform bulk stock update',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
