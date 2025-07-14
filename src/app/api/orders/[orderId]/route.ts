import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';



import { StockManager } from '@/lib/stock-manager';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = params;
    const { status, restoreStock = false } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }

    // Get current order with items
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const oldStatus = currentOrder.status;

    // Handle stock restoration for cancelled orders
    if (status === 'CANCELED' && oldStatus !== 'CANCELED' && currentOrder.items.length > 0) {
      try {
        await StockManager.restoreStockForOrder(
          orderId,
          currentOrder.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        );
      } catch (stockError) {
        console.error('Failed to restore stock:', stockError);
        return NextResponse.json({ 
          error: 'Failed to restore stock for cancelled order',
          details: stockError instanceof Error ? stockError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // Handle manual stock restoration (if requested)
    if (restoreStock && currentOrder.items.length > 0) {
      try {
        await StockManager.restoreStockForOrder(
          orderId,
          currentOrder.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        );
      } catch (stockError) {
        console.error('Failed to manually restore stock:', stockError);
        return NextResponse.json({ 
          error: 'Failed to restore stock',
          details: stockError instanceof Error ? stockError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order status updated to ${status}${restoreStock || status === 'CANCELED' ? ' and stock restored' : ''}`
    });

  } catch (error) {
    console.error('Order status update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update order status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle other order operations like restore from trash, mark as fake, etc.
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = params;
    const { action, restore = false, markAsFake = false } = await request.json();

    if (!orderId || !action) {
      return NextResponse.json({ error: 'Order ID and action are required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let updateData: Record<string, unknown> = {};
    let message = '';

    switch (action) {
      case 'restore':
        if (restore) {
          updateData = { deletedAt: null };
          message = 'Order restored from trash';
        }
        break;
        
      case 'markAsFake':
        updateData = { isFakeOrder: markAsFake };
        message = markAsFake ? 'Order marked as fake' : 'Order unmarked as fake';
        
        // If marking as fake, also flag the user
        if (markAsFake && order.userId) {
          await prisma.user.update({
            where: { id: order.userId },
            data: { isFlagged: true }
          });
          message += ' and user flagged';
        }
        break;
        
      case 'delete':
        updateData = { deletedAt: new Date() };
        message = 'Order moved to trash';
        
        // Flag the user when order is trashed
        if (order.userId) {
          await prisma.user.update({
            where: { id: order.userId },
            data: { isFlagged: true }
          });
          message += ' and user flagged';
        }
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message
    });

  } catch (error) {
    console.error('Order operation error:', error);
    return NextResponse.json({ 
      error: 'Failed to perform order operation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
