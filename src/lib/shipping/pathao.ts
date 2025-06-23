import {
  ShippingService,
  ShippingLocation,
  ShippingOrder,
  ShippingResult,
  ShippingStatus,
  ShippingRate
} from './base';

export class PathaoService implements ShippingService {
  private readonly baseUrl = 'https://api-hermes.pathao.com/aladdin/api/v1';
  private accessToken?: string;

  constructor(
    private readonly apiKey: string,
    private readonly apiSecret: string,
    private readonly storeId: string
  ) {}

  private async getAccessToken() {
    if (this.accessToken) return this.accessToken;

    const response = await fetch(`${this.baseUrl}/issue-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.apiKey,
        client_secret: this.apiSecret,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get Pathao access token');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    return this.accessToken;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = await this.getAccessToken();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Pathao API request failed');
    }

    return response.json();
  }

  async getCities(): Promise<ShippingLocation[]> {
    const data = await this.request('/city-list');
    return data.data.map((city: any) => ({
      id: city.city_id.toString(),
      name: city.city_name,
      type: 'city',
    }));
  }

  async getZones(cityId: string): Promise<ShippingLocation[]> {
    const data = await this.request(`/cities/${cityId}/zone-list`);
    return data.data.map((zone: any) => ({
      id: zone.zone_id.toString(),
      name: zone.zone_name,
      type: 'zone',
      parentId: cityId,
    }));
  }

  async getAreas(zoneId: string): Promise<ShippingLocation[]> {
    const data = await this.request(`/zones/${zoneId}/area-list`);
    return data.data.map((area: any) => ({
      id: area.area_id.toString(),
      name: area.area_name,
      type: 'area',
      parentId: zoneId,
    }));
  }

  async createOrder(order: ShippingOrder): Promise<ShippingResult> {
    const payload = {
      store_id: this.storeId,
      merchant_order_id: order.orderId,
      recipient_name: order.customerName,
      recipient_phone: order.customerPhone,
      recipient_address: order.shippingAddress,
      recipient_city: order.city,
      recipient_zone: order.zone,
      recipient_area: order.area,
      amount_to_collect: order.codAmount,
      item_type: 'Parcel',
      special_instruction: order.note || '',
      item_quantity: order.items.reduce((acc, item) => acc + item.quantity, 0),
      item_weight: order.items.reduce((acc, item) => acc + (item.weight || 0.5) * item.quantity, 0),
      delivery_type: order.deliveryType || 'normal',
    };

    const data = await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      trackingId: data.consignment_id,
      providerOrderId: data.order_id,
      status: data.order_status,
      message: 'Order created successfully',
      provider: 'pathao',
      deliveryCharge: data.delivery_fee,
      estimatedDeliveryDate: data.estimated_delivery_date,
      trackingUrl: `https://pathao.com/tracking/${data.consignment_id}`,
    };
  }

  async getOrderStatus(trackingId: string): Promise<ShippingStatus> {
    const data = await this.request(`/orders/${trackingId}/info`);
    
    return {
      trackingId,
      status: data.order_status,
      lastUpdate: data.updated_at,
      lastMessage: data.status_message || data.order_status,
      location: data.current_location,
      deliveryAttempts: data.delivery_attempts,
    };
  }

  async cancelOrder(trackingId: string): Promise<{ success: boolean; message: string }> {
    const data = await this.request(`/orders/${trackingId}/cancel`, {
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
    const data = await this.request('/merchant/price-plan', {
      method: 'POST',
      body: JSON.stringify({
        store_id: this.storeId,
        item_type: 'Parcel',
        delivery_type: params.deliveryType || 'normal',
        item_weight: params.weight,
        recipient_city: params.toCity,
        recipient_zone: params.toZone,
        amount_to_collect: params.codAmount,
      }),
    });

    return {
      rate: data.price,
      currency: 'BDT',
      estimatedDays: data.estimated_delivery_days,
      provider: 'pathao',
      deliveryType: params.deliveryType || 'normal',
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
    const data = await this.request('/risk/check', {
      method: 'POST',
      body: JSON.stringify({
        phone: params.phone,
        address: params.address,
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