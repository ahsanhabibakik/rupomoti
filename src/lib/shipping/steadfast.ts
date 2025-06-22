import { ShippingService } from './base';

export class SteadfastService implements ShippingService {
  private baseUrl = process.env.STEADFAST_API_URL || 'https://api.steadfast.com.bd';

  constructor(
    private apiKey: string,
    private storeId?: string
  ) {}

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  async createOrder(orderData: any) {
    const response = await fetch(`${this.baseUrl}/api/v1/orders`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        store_id: this.storeId,
        ...orderData
      })
    });
    return response.json();
  }

  async getAreas() {
    const response = await fetch(`${this.baseUrl}/api/v1/areas`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async calculateRate(params: any) {
    const response = await fetch(`${this.baseUrl}/api/v1/rates`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params)
    });
    return response.json();
  }
}
