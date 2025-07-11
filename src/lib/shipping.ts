// Import Mongoose models to replace Prisma models


const prisma = new PrismaClient()

export interface ShippingProvider {
  name: string
  trackingUrl: string
  apiKey?: string
}

export const SHIPPING_PROVIDERS: Record<string, ShippingProvider> = {
  fedex: {
    name: 'FedEx',
    trackingUrl: 'https://www.fedex.com/fedextrack/?tracknumber='
  },
  ups: {
    name: 'UPS',
    trackingUrl: 'https://www.ups.com/track?tracknum='
  },
  dhl: {
    name: 'DHL',
    trackingUrl: 'https://www.dhl.com/track?trackingNumber='
  },
  usps: {
    name: 'USPS',
    trackingUrl: 'https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1='
  }
}

export class ShippingManager {
  /**
   * Add tracking number to order
   */
  static async addTrackingToOrder(orderId: string, trackingNumber: string, provider: string) {
    try {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          trackingNumber,
          shippingProvider: provider,
          status: 'SHIPPED'
        }
      })

      // Send tracking email to customer
      console.log(`Order ${orderId} shipped with tracking: ${trackingNumber}`)
      
      return order
    } catch (error) {
      console.error('Failed to add tracking:', error)
      throw new Error('Failed to add tracking number')
    }
  }

  /**
   * Get tracking URL for order
   */
  static getTrackingUrl(trackingNumber: string, provider: string): string {
    const providerInfo = SHIPPING_PROVIDERS[provider.toLowerCase()]
    if (!providerInfo) {
      return ''
    }
    return providerInfo.trackingUrl + trackingNumber
  }

  /**
   * Get shipping status
   */
  static async getShippingStatus(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        trackingNumber: true,
        shippingProvider: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!order) {
      throw new Error('Order not found')
    }

    let trackingUrl = ''
    if (order.trackingNumber && order.shippingProvider) {
      trackingUrl = this.getTrackingUrl(order.trackingNumber, order.shippingProvider)
    }

    return {
      ...order,
      trackingUrl,
      providerName: order.shippingProvider ? 
        SHIPPING_PROVIDERS[order.shippingProvider.toLowerCase()]?.name || order.shippingProvider : 
        null
    }
  }

  /**
   * Update shipping status
   */
  static async updateShippingStatus(orderId: string, status: string) {
    try {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: status as any,
          updatedAt: new Date()
        }
      })

      console.log(`Order ${orderId} status updated to: ${status}`)
      return order
    } catch (error) {
      console.error('Failed to update shipping status:', error)
      throw new Error('Failed to update shipping status')
    }
  }
}
