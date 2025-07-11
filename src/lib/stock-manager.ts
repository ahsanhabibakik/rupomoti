// Import Mongoose models to replace Prisma models


const prisma = new PrismaClient();

interface StockUpdateData {
  productId: string;
  quantity: number;
  operation: 'increment' | 'decrement' | 'set';
  reason?: string;
  userId?: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
}

export class StockManager {
  /**
   * Update stock for a single product
   */
  static async updateProductStock(data: StockUpdateData) {
    const { productId, quantity, operation, reason = 'Manual update', userId } = data;

    try {
      // Get current product
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        throw new Error('Product not found');
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
      }

      // Update product stock
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: { 
          stock: newStock,
          updatedAt: new Date()
        }
      });

      // Log the change
      try {
        await prisma.stockLog.create({
          data: {
            productId,
            previousStock: product.stock,
            newStock,
            changeAmount: newStock - product.stock,
            operation,
            reason,
            userId: userId || null,
          }
        });
      } catch (logError) {
        console.warn('Could not log stock change:', logError);
      }

      return {
        success: true,
        product: updatedProduct,
        previousStock: product.stock,
        newStock
      };
    } catch (error) {
      console.error('Stock update error:', error);
      throw error;
    }
  }

  /**
   * Reserve stock when order is placed
   */
  static async reserveStockForOrder(orderId: string, items: OrderItem[]) {
    const transaction = await prisma.$transaction(async (tx) => {
      const results = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`);
        }

        const newStock = product.stock - item.quantity;

        await tx.product.update({
          where: { id: item.productId },
          data: { 
            stock: newStock,
            updatedAt: new Date()
          }
        });

        // Log stock reservation
        try {
          await tx.stockLog.create({
            data: {
              productId: item.productId,
              previousStock: product.stock,
              newStock,
              changeAmount: -item.quantity,
              operation: 'decrement',
              reason: `Stock reserved for order ${orderId}`,
              orderId,
            }
          });
        } catch (logError) {
          console.warn('Could not log stock reservation:', logError);
        }

        results.push({
          productId: item.productId,
          previousStock: product.stock,
          newStock,
          quantity: item.quantity
        });
      }

      return results;
    });

    return transaction;
  }

  /**
   * Restore stock when order is cancelled
   */
  static async restoreStockForOrder(orderId: string, items: OrderItem[]) {
    const transaction = await prisma.$transaction(async (tx) => {
      const results = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          console.warn(`Product ${item.productId} not found during stock restoration`);
          continue;
        }

        const newStock = product.stock + item.quantity;

        await tx.product.update({
          where: { id: item.productId },
          data: { 
            stock: newStock,
            updatedAt: new Date()
          }
        });

        // Log stock restoration
        try {
          await tx.stockLog.create({
            data: {
              productId: item.productId,
              previousStock: product.stock,
              newStock,
              changeAmount: item.quantity,
              operation: 'increment',
              reason: `Stock restored from cancelled order ${orderId}`,
              orderId,
            }
          });
        } catch (logError) {
          console.warn('Could not log stock restoration:', logError);
        }

        results.push({
          productId: item.productId,
          previousStock: product.stock,
          newStock,
          quantity: item.quantity
        });
      }

      return results;
    });

    return transaction;
  }

  /**
   * Check if products are in stock
   */
  static async checkStockAvailability(items: OrderItem[]) {
    const checks = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, stock: true }
      });

      if (!product) {
        checks.push({
          productId: item.productId,
          available: false,
          reason: 'Product not found',
          requestedQuantity: item.quantity,
          availableStock: 0
        });
        continue;
      }

      const available = product.stock >= item.quantity;
      checks.push({
        productId: item.productId,
        productName: product.name,
        available,
        reason: available ? 'In stock' : 'Insufficient stock',
        requestedQuantity: item.quantity,
        availableStock: product.stock
      });
    }

    return {
      allAvailable: checks.every(check => check.available),
      checks
    };
  }

  /**
   * Get low stock products
   */
  static async getLowStockProducts(threshold: number = 10) {
    return await prisma.product.findMany({
      where: {
        stock: {
          lte: threshold,
          gt: 0
        }
      },
      orderBy: {
        stock: 'asc'
      }
    });
  }

  /**
   * Get out of stock products
   */
  static async getOutOfStockProducts() {
    return await prisma.product.findMany({
      where: {
        stock: 0
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  }

  /**
   * Get stock history for a product
   */
  static async getStockHistory(productId: string, limit: number = 50) {
    try {
      return await prisma.stockLog.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      });
    } catch (error) {
      console.warn('Stock history not available:', error);
      return [];
    }
  }
}
