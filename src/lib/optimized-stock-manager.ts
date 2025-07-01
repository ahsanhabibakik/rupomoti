import { PrismaClient } from '@prisma/client';

// We don't need to instantiate prisma here since we use transactions
// const prisma = new PrismaClient();

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Product {
  id: string;
  name: string;
  stock: number;
}

interface CustomerData {
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  deliveryAddress: string;
  recipientCity?: string;
  recipientZone?: string;
  userId?: string;
}

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

export class OptimizedStockManager {
  /**
   * Ultra-fast stock reservation for order creation
   * Combines stock check and reservation in a single operation
   */
  static async reserveStockForOrderFast(orderId: string, items: OrderItem[], tx: TransactionClient) {
    // Get all products in one query
    const productIds = items.map(item => item.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, stock: true }
    });

    // Create lookup map with proper typing
    const productMap = new Map<string, Product>(products.map((p: Product) => [p.id, p]));

    // Validate stock availability
    const stockIssues = [];
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        stockIssues.push(`Product ${item.productId} not found`);
      } else if (product.stock < item.quantity) {
        stockIssues.push(`${product.name}: need ${item.quantity}, only ${product.stock} available`);
      }
    }

    if (stockIssues.length > 0) {
      throw new Error(`Stock validation failed: ${stockIssues.join(', ')}`);
    }

    // Prepare batch updates and logs
    const stockUpdates = [];
    const stockLogs = [];

    for (const item of items) {
      const product = productMap.get(item.productId)!;
      const newStock = product.stock - item.quantity;

      // Stock update
      stockUpdates.push(
        tx.product.update({
          where: { id: item.productId },
          data: { 
            stock: newStock,
            updatedAt: new Date()
          }
        })
      );

      // Stock log data
      stockLogs.push({
        productId: item.productId,
        previousStock: product.stock,
        newStock,
        changeAmount: -item.quantity,
        operation: 'decrement' as const,
        reason: `Reserved for order ${orderId}`,
        orderId,
      });
    }

    // Execute all stock updates in parallel
    await Promise.all(stockUpdates);

    // Create stock logs in batch (non-blocking for performance)
    if (stockLogs.length > 0) {
      try {
        await tx.stockLog.createMany({
          data: stockLogs
        });
      } catch (logError) {
        console.warn('Stock logging failed (non-critical):', logError);
      }
    }

    return {
      success: true,
      reservedItems: items.map(item => {
        const product = productMap.get(item.productId)!;
        return {
          productId: item.productId,
          productName: product.name,
          previousStock: product.stock,
          newStock: product.stock - item.quantity,
          reservedQuantity: item.quantity
        };
      })
    };
  }

  /**
   * Fast order number generation with collision avoidance
   */
  static generateFastOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const counter = Math.floor(Math.random() * 99).toString().padStart(2, '0');
    return `ORD-${timestamp}${random}${counter}`;
  }

  /**
   * Batch customer lookup/create with minimal queries
   */
  static async getOrCreateCustomerFast(customerData: CustomerData, tx: TransactionClient) {
    const { recipientName, recipientPhone, recipientEmail, deliveryAddress, recipientCity, recipientZone, userId } = customerData;

    // Try to find existing customer
    let customer = await tx.customer.findUnique({
      where: { phone: recipientPhone },
      select: { id: true, name: true, phone: true, email: true, address: true, userId: true }
    });

    if (!customer) {
      // Create new customer
      customer = await tx.customer.create({
        data: {
          name: recipientName,
          phone: recipientPhone,
          email: recipientEmail || '',
          address: deliveryAddress,
          city: recipientCity || '',
          zone: recipientZone || '',
          userId: userId || undefined
        },
        select: { id: true, name: true, phone: true, email: true, address: true, userId: true }
      });
    } else {
      // Update customer with latest info (only if different)
      const needsUpdate = 
        customer.name !== recipientName ||
        customer.email !== (recipientEmail || '') ||
        customer.address !== deliveryAddress;

      if (needsUpdate) {
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: {
            name: recipientName,
            email: recipientEmail || '',
            address: deliveryAddress,
            city: recipientCity || '',
            zone: recipientZone || '',
            userId: userId || customer.userId
          },
          select: { id: true, name: true, phone: true, email: true, address: true, userId: true }
        });
      }
    }

    return customer;
  }
}
