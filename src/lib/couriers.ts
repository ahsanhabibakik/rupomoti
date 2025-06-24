import { steadfast, SteadfastParcel } from './steadfast'

export type CourierName = 'Steadfast' | 'RedX' | 'Pathao' | 'CarryBee'

export interface CourierShipmentResult {
  success: boolean
  message: string
  consignmentId?: string
  trackingId?: string
  raw?: any
}

export async function createShipment(order: any, courier: CourierName): Promise<CourierShipmentResult> {
  switch (courier) {
    case 'Steadfast': {
      const parcel: SteadfastParcel = {
        invoice: order.orderNumber,
        recipient_name: order.recipientName,
        recipient_phone: order.recipientPhone,
        recipient_address: order.deliveryAddress,
        recipient_city: order.recipientCity,
        recipient_zone: order.recipientZone,
        cod_amount: order.total,
        note: order.orderNote || '',
        item_description: order.items.map((item: any) => `${item.name} (${item.quantity})`).join(', '),
        recipient_email: order.recipientEmail || undefined,
      }
      const result = await steadfast.createParcel(parcel)
      return {
        success: result.success,
        message: result.message,
        consignmentId: result.consignment_id,
        trackingId: result.tracking_id,
        raw: result,
      }
    }
    case 'RedX':
      // TODO: Implement RedX integration
      return { success: false, message: 'RedX integration not implemented yet' }
    case 'Pathao':
      // TODO: Implement Pathao integration
      return { success: false, message: 'Pathao integration not implemented yet' }
    case 'CarryBee':
      // TODO: Implement CarryBee integration
      return { success: false, message: 'CarryBee integration not implemented yet' }
    default:
      return { success: false, message: 'Unknown courier' }
  }
} 