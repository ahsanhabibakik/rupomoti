import {
  ShippingService,
  ShippingLocation,
  ShippingOrder,
  ShippingResult,
  ShippingStatus,
  ShippingRate
} from './base';

export class SteadfastService implements ShippingService {
  private readonly baseUrl = 'https://portal.packzy.com/api/v1';

  constructor(
    private readonly apiKey: string,
    private readonly secretKey: string
  ) {}

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': this.apiKey,
        'Secret-Key': this.secretKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Steadfast API request failed');
    }

    return response.json();
  }

  async getCities(): Promise<ShippingLocation[]> {
    const data = await this.request('/get-areas');
    return data.areas.map((area: any) => ({
      id: area.id.toString(),
      name: area.name,
      type: 'city',
    }));
  }

  async getZones(cityId: string): Promise<ShippingLocation[]> {
    const data = await this.request(`/get-zones/${cityId}`);
    return data.zones.map((zone: any) => ({
      id: zone.id.toString(),
      name: zone.name,
      type: 'zone',
      parentId: cityId,
    }));
  }

  async getAreas(zoneId: string): Promise<ShippingLocation[]> {
    const data = await this.request(`/get-areas/${zoneId}`);
    return data.areas.map((area: any) => ({
      id: area.id.toString(),
      name: area.name,
      type: 'area',
      parentId: zoneId,
    }));
  }

  async createOrder(order: ShippingOrder): Promise<ShippingResult> {
    const payload = {
      invoice: order.orderId,
      recipient_name: order.customerName,
      recipient_phone: order.customerPhone,
      alternative_phone: order.alternativePhone,
      recipient_email: order.customerEmail,
      recipient_address: order.shippingAddress,
      cod_amount: order.codAmount,
      note: order.note,
      item_description: order.items.map(item => `${item.name} (${item.quantity})`).join(', '),
      total_lot: order.items.reduce((acc, item) => acc + item.quantity, 0),
      delivery_type: order.deliveryType === 'express' ? 1 : 0,
    };

    const data = await this.request('/create_order', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      trackingId: data.tracking_code,
      providerOrderId: data.consignment_id,
      status: data.status,
      message: data.message || 'Order created successfully',
      provider: 'steadfast',
      deliveryCharge: data.delivery_charge,
      trackingUrl: `https://steadfast.com.bd/track/${data.tracking_code}`,
    };
  }

  async getOrderStatus(trackingId: string): Promise<ShippingStatus> {
    const data = await this.request(`/status_by_trackingcode/${trackingId}`);
    
    return {
      trackingId,
      status: data.delivery_status,
      lastUpdate: data.updated_at,
      lastMessage: data.tracking_message || data.status_message,
      location: data.current_location,
      deliveryAttempts: data.delivery_attempts,
    };
  }

  async cancelOrder(trackingId: string): Promise<{ success: boolean; message: string }> {
    const data = await this.request(`/cancel_order/${trackingId}`, {
      method: 'POST',
    });

    return {
      success: data.status === 'success',
      message: data.message || 'Order cancelled successfully',
    };
  }

  async calculateRate(params: {
    fromCity: string;
    toCity: string;
    toZone: string;
    weight: number;
    codAmount: number;
    deliveryType?: string;
  }): Promise<ShippingRate> {
    const data = await this.request('/calculate_charge', {
      method: 'POST',
      body: JSON.stringify({
        from_city: params.fromCity,
        to_city: params.toCity,
        to_zone: params.toZone,
        weight: params.weight,
        cod_amount: params.codAmount,
        delivery_type: params.deliveryType === 'express' ? 1 : 0,
      }),
    });

    return {
      rate: data.charge,
      currency: 'BDT',
      estimatedDays: data.estimated_days,
      provider: 'steadfast',
      deliveryType: params.deliveryType || 'regular',
    };
  }

  async checkFraud(params: {
    phone: string;
    address: string;
    amount: number;
  }): Promise<{
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    reasons?: string[];
  }> {
    const data = await this.request('/check_fraud', {
      method: 'POST',
      body: JSON.stringify({
        phone: params.phone,
        delivery_address: params.address,
        cod_amount: params.amount,
      }),
    });

    return {
      riskScore: data.risk_score,
      riskLevel: data.risk_level.toLowerCase(),
      reasons: data.risk_reasons,
    };
  }
}
