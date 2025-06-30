import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface StockUpdateParams {
  productId: string
  changeAmount: number
  operation: 'increment' | 'decrement' | 'set'
  reason: string
  orderId?: string
  userId?: string
}

export interface InventoryAlert {
  productId: string
  productName: string
  currentStock: number
  minThreshold: number
  severity: 'low' | 'critical' | 'out_of_stock'
}

export class InventoryManager {
  /**
   * Update product stock with logging
   */
  static async updateStock({
    productId,
    changeAmount,
    operation,
    reason,
    orderId,
    userId
  }: StockUpdateParams) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { stock: true, name: true }
      })

      if (!product) {
        throw new Error('Product not found')
      }

      const previousStock = product.stock
      let newStock: number

      switch (operation) {
        case 'increment':
          newStock = previousStock + changeAmount
          break
        case 'decrement':
          newStock = Math.max(0, previousStock - changeAmount)
          break
        case 'set':
          newStock = changeAmount
          break
        default:
          throw new Error('Invalid operation')
      }

      // Update product stock and create log in a transaction
      const result = await prisma.$transaction([
        prisma.product.update({
          where: { id: productId },
          data: { stock: newStock }
        }),
        prisma.stockLog.create({
          data: {
            productId,
            previousStock,
            newStock,
            changeAmount: operation === 'set' ? (newStock - previousStock) : 
                         operation === 'increment' ? changeAmount : -changeAmount,
            operation,
            reason,
            orderId,
            userId
          }
        })
      ])

      // Check for low stock alerts
      await this.checkStockAlerts(productId, newStock)

      return {
        success: true,
        previousStock,
        newStock,
        product: result[0]
      }
    } catch (error) {
      console.error('Stock update failed:', error)
      throw new Error('Failed to update stock')
    }
  }

  /**
   * Reserve stock for an order (when order is placed but not yet confirmed)
   */
  static async reserveStock(orderItems: { productId: string; quantity: number }[], orderId: string) {
    const reservations = []

    for (const item of orderItems) {
      const result = await this.updateStock({
        productId: item.productId,
        changeAmount: item.quantity,
        operation: 'decrement',
        reason: `Stock reserved for order ${orderId}`,
        orderId
      })
      reservations.push(result)
    }

    return reservations
  }

  /**
   * Release reserved stock (when order is cancelled)
   */
  static async releaseStock(orderItems: { productId: string; quantity: number }[], orderId: string) {
    const releases = []

    for (const item of orderItems) {
      const result = await this.updateStock({
        productId: item.productId,
        changeAmount: item.quantity,
        operation: 'increment',
        reason: `Stock released from cancelled order ${orderId}`,
        orderId
      })
      releases.push(result)
    }

    return releases
  }

  /**
   * Get stock history for a product
   */
  static async getStockHistory(productId: string, limit = 50) {
    return await prisma.stockLog.findMany({
      where: { productId },
      include: {
        user: { select: { name: true, email: true } },
        order: { select: { orderNumber: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  /**
   * Get current inventory alerts
   */
  static async getInventoryAlerts(threshold = 10): Promise<InventoryAlert[]> {
    const products = await prisma.product.findMany({
      where: {
        stock: { lte: threshold },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        stock: true
      }
    })

    return products.map(product => ({
      productId: product.id,
      productName: product.name,
      currentStock: product.stock,
      minThreshold: threshold,
      severity: product.stock === 0 ? 'out_of_stock' : 
               product.stock <= 5 ? 'critical' : 'low'
    }))
  }

  /**
   * Check and trigger stock alerts
   */
  private static async checkStockAlerts(productId: string, currentStock: number) {
    const lowStockThreshold = 10
    const criticalStockThreshold = 5

    if (currentStock <= criticalStockThreshold) {
      // Trigger critical stock alert
      console.log(`CRITICAL STOCK ALERT: Product ${productId} has ${currentStock} items left`)
      // Here you could send notifications, emails, webhooks, etc.
    } else if (currentStock <= lowStockThreshold) {
      // Trigger low stock alert
      console.log(`LOW STOCK ALERT: Product ${productId} has ${currentStock} items left`)
    }
  }

  /**
   * Bulk stock update
   */
  static async bulkStockUpdate(updates: Array<{
    productId: string
    newStock: number
    reason: string
    userId?: string
  }>) {
    const results = []

    for (const update of updates) {
      try {
        const result = await this.updateStock({
          productId: update.productId,
          changeAmount: update.newStock,
          operation: 'set',
          reason: update.reason,
          userId: update.userId
        })
        results.push({ success: true, productId: update.productId, ...result })
      } catch (error) {
        results.push({ 
          success: false, 
          productId: update.productId, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    return results
  }

  /**
   * Get real-time stock status
   */
  static async getRealTimeStock(productIds: string[]) {
    return await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        name: true,
        stock: true,
        updatedAt: true
      }
    })
  }
}
