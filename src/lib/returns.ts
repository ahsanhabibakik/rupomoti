import { PrismaClient } from '@prisma/client'
import { InventoryManager } from './inventory'

const prisma = new PrismaClient()

export interface ReturnRequest {
  orderId: string
  productId: string
  quantity: number
  reason: string
  condition: 'new' | 'used' | 'damaged'
  customerNotes?: string
}

export class ReturnsManager {
  /**
   * Create a return request
   */
  static async createReturnRequest({
    orderId,
    productId,
    quantity,
    reason,
    condition,
    customerNotes
  }: ReturnRequest) {
    try {
      // Check if order exists and is eligible for return
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            where: { productId }
          }
        }
      })

      if (!order) {
        throw new Error('Order not found')
      }

      const orderItem = order.items[0]
      if (!orderItem) {
        throw new Error('Product not found in order')
      }

      if (quantity > orderItem.quantity) {
        throw new Error('Cannot return more items than ordered')
      }

      // Create return request
      const returnRequest = await prisma.returnRequest.create({
        data: {
          orderId,
          productId,
          quantity,
          reason,
          condition,
          customerNotes,
          status: 'PENDING',
          requestDate: new Date()
        }
      })

      console.log(`Return request created: ${returnRequest.id}`)
      return returnRequest

    } catch (error) {
      console.error('Failed to create return request:', error)
      throw new Error('Failed to create return request')
    }
  }

  /**
   * Approve return request
   */
  static async approveReturn(returnId: string, adminNotes?: string) {
    try {
      const returnRequest = await prisma.returnRequest.update({
        where: { id: returnId },
        data: {
          status: 'APPROVED',
          adminNotes,
          approvedDate: new Date()
        },
        include: {
          product: true,
          order: true
        }
      })

      console.log(`Return approved: ${returnId}`)
      return returnRequest

    } catch (error) {
      console.error('Failed to approve return:', error)
      throw new Error('Failed to approve return')
    }
  }

  /**
   * Process return (when item is received back)
   */
  static async processReturn(returnId: string, actualCondition: string) {
    try {
      const returnRequest = await prisma.returnRequest.findUnique({
        where: { id: returnId },
        include: {
          product: true,
          order: true
        }
      })

      if (!returnRequest) {
        throw new Error('Return request not found')
      }

      if (returnRequest.status !== 'APPROVED') {
        throw new Error('Return must be approved first')
      }

      // Update return status
      const updatedReturn = await prisma.returnRequest.update({
        where: { id: returnId },
        data: {
          status: 'COMPLETED',
          actualCondition,
          completedDate: new Date()
        }
      })

      // Add stock back if item is in good condition
      if (actualCondition === 'new' || actualCondition === 'used') {
        await InventoryManager.updateStock({
          productId: returnRequest.productId,
          changeAmount: returnRequest.quantity,
          operation: 'increment',
          reason: `Return processed - ${returnId}`,
          orderId: returnRequest.orderId
        })
      }

      // Calculate refund amount
      const orderItem = await prisma.orderItem.findFirst({
        where: {
          orderId: returnRequest.orderId,
          productId: returnRequest.productId
        }
      })

      const refundAmount = orderItem ? orderItem.price * returnRequest.quantity : 0

      console.log(`Return processed: ${returnId}, Refund: $${refundAmount}`)
      return { ...updatedReturn, refundAmount }

    } catch (error) {
      console.error('Failed to process return:', error)
      throw new Error('Failed to process return')
    }
  }

  /**
   * Get return requests for an order
   */
  static async getOrderReturns(orderId: string) {
    return await prisma.returnRequest.findMany({
      where: { orderId },
      include: {
        product: {
          select: { name: true, price: true }
        }
      },
      orderBy: { requestDate: 'desc' }
    })
  }

  /**
   * Get all return requests (for admin)
   */
  static async getAllReturns(status?: string) {
    const where = status ? { status } : {}
    
    return await prisma.returnRequest.findMany({
      where,
      include: {
        product: {
          select: { name: true, price: true }
        },
        order: {
          select: { orderNumber: true, user: { select: { name: true, email: true } } }
        }
      },
      orderBy: { requestDate: 'desc' }
    })
  }

  /**
   * Check if order is eligible for return
   */
  static async checkReturnEligibility(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { 
        status: true, 
        createdAt: true,
        items: {
          include: {
            product: { select: { name: true } }
          }
        }
      }
    })

    if (!order) {
      return { eligible: false, reason: 'Order not found' }
    }

    if (order.status !== 'DELIVERED') {
      return { eligible: false, reason: 'Order must be delivered first' }
    }

    // Check if within return window (30 days)
    const daysSinceDelivery = Math.floor(
      (new Date().getTime() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceDelivery > 30) {
      return { eligible: false, reason: 'Return window has expired (30 days)' }
    }

    return { 
      eligible: true, 
      daysRemaining: 30 - daysSinceDelivery,
      items: order.items
    }
  }
}
