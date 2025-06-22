import { ShippingService } from './base';

export class RedXService implements ShippingService {
  private baseUrl = process.env.REDX_API_URL || 'https://redx.com.bd/v1.0.0-beta';

  constructor(
    private apiKey: string,
    private storeId?: string
  ) {}

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'API-ACCESS-TOKEN': `Bearer ${this.apiKey}`
    };
  }

  async createParcel(parcelData: any) {
    const response = await fetch(`${this.baseUrl}/parcel`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        pickup_store_id: this.storeId,
        ...parcelData
      })
    });
    return response.json();
  }

  async getAreas() {
    const response = await fetch(`${this.baseUrl}/areas`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async calculateRate(params: any) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseUrl}/charge/charge_calculator?${query}`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async createOrder(orderData: any) {
    return this.createParcel(orderData);
  }
}
