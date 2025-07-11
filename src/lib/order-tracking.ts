// Import Mongoose models to replace Prisma models


const prisma = new PrismaClient()

export interface TrackingInfo {
  consignmentId: string
  trackingCode: string
  status: string
  statusMessage: string
  currentLocation?: string
  estimatedDelivery?: Date
  events: TrackingEvent[]
  courierName: string
}

export interface TrackingEvent {
  timestamp: Date
  status: string
  location: string
  description: string
}

export interface CourierCreateShipmentParams {
  orderId: string
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  recipientCity: string
  recipientZone?: string
  recipientArea?: string
  weight?: number
  packageValue: number
  paymentMethod: 'COD' | 'PAID'
  codAmount?: number
  note?: string
}

export class OrderTrackingManager {
  /**
   * Create shipment with Steadfast Courier
   */
  static async createSteadfastShipment(params: CourierCreateShipmentParams) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: params.orderId },
        include: { items: { include: { product: true } } }
      })

      if (!order) {
        throw new Error('Order not found')
      }

      const steadfastApiKey = process.env.STEADFAST_API_KEY
      const steadfastSecretKey = process.env.STEADFAST_SECRET_KEY

      if (!steadfastApiKey || !steadfastSecretKey) {
        throw new Error('Steadfast API credentials not configured')
      }

      const shipmentData = {
        invoice: order.orderNumber,
        recipient_name: params.recipientName,
        recipient_phone: params.recipientPhone,
        recipient_address: params.recipientAddress,
        cod_amount: params.codAmount || 0,
        note: params.note || ''
      }

      const response = await fetch('https://portal.steadfast.com.bd/api/v1/create_consignment', {
        method: 'POST',
        headers: {
          'Api-Key': steadfastApiKey,
          'Secret-Key': steadfastSecretKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shipmentData)
      })

      const result = await response.json()

      if (result.status === 200) {
        // Update order with tracking information
        await prisma.order.update({
          where: { id: params.orderId },
          data: {
            courierName: 'Steadfast',
            courierConsignmentId: result.consignment.consignment_id,
            courierTrackingCode: result.consignment.tracking_code,
            courierStatus: 'CREATED',
            steadfastInfo: result.consignment,
            status: 'SHIPPED'
          }
        })

        return {
          success: true,
          consignmentId: result.consignment.consignment_id,
          trackingCode: result.consignment.tracking_code,
          courierInfo: result.consignment
        }
      } else {
        throw new Error(result.message || 'Failed to create shipment')
      }
    } catch (error) {
      console.error('Steadfast shipment creation failed:', error)
      throw error
    }
  }

  /**
   * Track Steadfast shipment
   */
  static async trackSteadfastShipment(consignmentId: string): Promise<TrackingInfo> {
    try {
      const steadfastApiKey = process.env.STEADFAST_API_KEY
      const steadfastSecretKey = process.env.STEADFAST_SECRET_KEY

      const response = await fetch(`https://portal.steadfast.com.bd/api/v1/status_by_cid/${consignmentId}`, {
        headers: {
          'Api-Key': steadfastApiKey!,
          'Secret-Key': steadfastSecretKey!
        }
      })

      const result = await response.json()

      if (result.status === 200) {
        const delivery = result.delivery_status

        return {
          consignmentId,
          trackingCode: delivery.tracking_code,
          status: delivery.current_status,
          statusMessage: delivery.current_status_message,
          currentLocation: delivery.current_location,
          estimatedDelivery: delivery.estimated_delivery ? new Date(delivery.estimated_delivery) : undefined,
          events: delivery.tracking_history?.map((event: any) => ({
            timestamp: new Date(event.time),
            status: event.status,
            location: event.location || '',
            description: event.message
          })) || [],
          courierName: 'Steadfast'
        }
      } else {
        throw new Error(result.message || 'Failed to track shipment')
      }
    } catch (error) {
      console.error('Steadfast tracking failed:', error)
      throw error
    }
  }

  /**
   * Track RedX shipment
   */
  static async trackRedXShipment(trackingCode: string): Promise<TrackingInfo> {
    try {
      const redxApiKey = process.env.REDX_API_KEY

      const response = await fetch(`https://openapi.redx.com.bd/v1.0.0-beta/parcel/track/${trackingCode}`, {
        headers: {
          'API-ACCESS-TOKEN': redxApiKey!
        }
      })

      const result = await response.json()

      if (result.success) {
        const tracking = result.tracking_data

        return {
          consignmentId: tracking.tracking_id,
          trackingCode,
          status: tracking.current_status,
          statusMessage: tracking.status_message,
          currentLocation: tracking.current_location?.name,
          events: tracking.tracking_history?.map((event: any) => ({
            timestamp: new Date(event.timestamp),
            status: event.status,
            location: event.location?.name || '',
            description: event.message
          })) || [],
          courierName: 'RedX'
        }
      } else {
        throw new Error(result.message || 'Failed to track shipment')
      }
    } catch (error) {
      console.error('RedX tracking failed:', error)
      throw error
    }
  }

  /**
   * Universal tracking method
   */
  static async trackOrder(orderId: string): Promise<TrackingInfo | null> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          courierName: true,
          courierConsignmentId: true,
          courierTrackingCode: true,
          courierStatus: true
        }
      })

      if (!order || !order.courierConsignmentId) {
        return null
      }

      switch (order.courierName?.toLowerCase()) {
        case 'steadfast':
          return await this.trackSteadfastShipment(order.courierConsignmentId)
        case 'redx':
          return await this.trackRedXShipment(order.courierTrackingCode!)
        case 'pathao':
          // Implement Pathao tracking
          return await this.trackPathaoShipment(order.courierConsignmentId)
        default:
          throw new Error('Unsupported courier service')
      }
    } catch (error) {
      console.error('Order tracking failed:', error)
      throw error
    }
  }

  /**
   * Track Pathao shipment (placeholder)
   */
  static async trackPathaoShipment(consignmentId: string): Promise<TrackingInfo> {
    // Implement Pathao API integration
    throw new Error('Pathao tracking not yet implemented')
  }

  /**
   * Bulk tracking for multiple orders
   */
  static async bulkTrackOrders(orderIds: string[]) {
    const results = []

    for (const orderId of orderIds) {
      try {
        const tracking = await this.trackOrder(orderId)
        results.push({ orderId, success: true, tracking })
      } catch (error) {
        results.push({ 
          orderId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    return results
  }

  /**
   * Update order status based on courier tracking
   */
  static async syncOrderStatus(orderId: string) {
    try {
      const tracking = await this.trackOrder(orderId)
      
      if (!tracking) {
        return null
      }

      let orderStatus = 'SHIPPED'
      
      // Map courier status to order status
      const lowerStatus = tracking.status.toLowerCase()
      if (lowerStatus.includes('delivered')) {
        orderStatus = 'DELIVERED'
      } else if (lowerStatus.includes('cancelled') || lowerStatus.includes('returned')) {
        orderStatus = 'RETURNED'
      } else if (lowerStatus.includes('transit') || lowerStatus.includes('pickup')) {
        orderStatus = 'SHIPPED'
      }

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: orderStatus as any,
          courierStatus: tracking.status,
          courierInfo: tracking as any
        }
      })

      return { orderId, newStatus: orderStatus, tracking }
    } catch (error) {
      console.error('Failed to sync order status:', error)
      throw error
    }
  }

  /**
   * Get tracking history for customer
   */
  static async getCustomerTrackingInfo(orderId: string, userId?: string) {
    try {
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          ...(userId && { userId })
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          courierName: true,
          courierTrackingCode: true,
          courierConsignmentId: true,
          deliveryAddress: true,
          createdAt: true
        }
      })

      if (!order) {
        throw new Error('Order not found')
      }

      const tracking = await this.trackOrder(orderId)

      return {
        order,
        tracking
      }
    } catch (error) {
      console.error('Failed to get customer tracking info:', error)
      throw error
    }
  }
}
