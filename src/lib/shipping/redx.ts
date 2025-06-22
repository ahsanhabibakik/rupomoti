import {
  ShippingService,
  ShippingLocation,
  ShippingOrder,
  ShippingResult,
  ShippingStatus,
  ShippingRate
} from './base';

export class RedXService implements ShippingService {
  private readonly baseUrl = 'https://api.redx.com.bd';

  constructor(
    private readonly accessToken: string,
    private readonly storeId: string
  ) {}

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'API-ACCESS-TOKEN': `Bearer ${this.accessToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'RedX API request failed');
    }

    return response.json();
  }

  async getCities(): Promise<ShippingLocation[]> {
    const data = await this.request('/areas?type=district');
    return data.areas.map((area: any) => ({
      id: area.id.toString(),
      name: area.name,
      type: 'city',
    }));
  }

  async getZones(cityId: string): Promise<ShippingLocation[]> {
    const data = await this.request(`/areas?district_id=${cityId}`);
    return data.areas.map((zone: any) => ({
      id: zone.id.toString(),
      name: zone.name,
      type: 'zone',
      parentId: cityId,
    }));
  }

  async getAreas(zoneId: string): Promise<ShippingLocation[]> {
    const data = await this.request(`/areas?zone_id=${zoneId}`);
    return data.areas.map((area: any) => ({
      id: area.id.toString(),
      name: area.name,
      type: 'area',
      parentId: zoneId,
    }));
  }

  async createOrder(order: ShippingOrder): Promise<ShippingResult> {
    const payload = {
      store_id: this.storeId,
      merchant_order_id: order.orderId,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      customer_address: order.shippingAddress,
      area_id: order.area,
      delivery_type: order.deliveryType || 'regular',
      parcel_weight: order.items.reduce((acc, item) => acc + (item.weight || 0.5) * item.quantity, 0),
      value: order.codAmount,
      payment_method: 'COD',
      merchant_note: order.note,
      special_instruction: order.note,
    };

    const data = await this.request('/parcel', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      trackingId: data.tracking_id,
      providerOrderId: data.parcel_id,
      status: data.status,
      message: data.message || 'Order created successfully',
      provider: 'redx',
      deliveryCharge: data.delivery_fee,
      trackingUrl: `https://redx.com.bd/track/${data.tracking_id}`,
    };
  }

  async getOrderStatus(trackingId: string): Promise<ShippingStatus> {
    const data = await this.request(`/parcel/track/${trackingId}`);
    
    return {
      trackingId,
      status: data.status,
      lastUpdate: data.last_update,
      lastMessage: data.status_message,
      location: data.current_location,
      deliveryAttempts: data.delivery_attempts,
    };
  }

  async cancelOrder(trackingId: string): Promise<{ success: boolean; message: string }> {
    const data = await this.request(`/parcels/${trackingId}/cancel`, {
      method: 'PATCH',
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
    const data = await this.request('/charge/charge_calculator', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        delivery_area_id: params.toZone,
        pickup_area_id: params.fromCity,
        cash_collection_amount: params.codAmount.toString(),
        weight: params.weight.toString(),
        delivery_type: params.deliveryType || 'regular',
      }).toString(),
    });

    return {
      rate: data.total_charge,
      currency: 'BDT',
      estimatedDays: data.estimated_delivery_days,
      provider: 'redx',
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
    const data = await this.request('/fraud/check', {
      method: 'POST',
      body: JSON.stringify({
        customer_phone: params.phone,
        delivery_address: params.address,
        cod_amount: params.amount,
      }),
    });

    return {
      riskScore: data.risk_score,
      riskLevel: data.risk_level.toLowerCase(),
      reasons: data.risk_factors,
    };
  }
}
