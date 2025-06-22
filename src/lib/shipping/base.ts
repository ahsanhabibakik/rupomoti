export interface ShippingLocation {
  id: string;
  name: string;
  type: 'city' | 'zone' | 'area';
  parentId?: string;
}

export interface ShippingRate {
  rate: number;
  currency: string;
  estimatedDays: number;
  provider: string;
  deliveryType: string;
}

export interface ShippingOrder {
  orderId: string;
  customerName: string;
  customerPhone: string;
  alternativePhone?: string;
  customerEmail?: string;
  shippingAddress: string;
  city: string;
  zone: string;
  area?: string;
  codAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    weight?: number;
    price: number;
  }>;
  note?: string;
  deliveryType?: string;
}

export interface ShippingResult {
  trackingId: string;
  providerOrderId: string;
  status: string;
  message: string;
  provider: string;
  deliveryCharge?: number;
  estimatedDeliveryDate?: string;
  trackingUrl?: string;
}

export interface ShippingStatus {
  trackingId: string;
  status: string;
  lastUpdate: string;
  lastMessage: string;
  location?: string;
  deliveryAttempts?: number;
}

export interface ShippingService {
  // Location APIs
  getCities(): Promise<ShippingLocation[]>;
  getZones(cityId: string): Promise<ShippingLocation[]>;
  getAreas(zoneId: string): Promise<ShippingLocation[]>;

  // Order APIs
  createOrder(order: ShippingOrder): Promise<ShippingResult>;
  getOrderStatus(trackingId: string): Promise<ShippingStatus>;
  cancelOrder(trackingId: string): Promise<{ success: boolean; message: string }>;

  // Rate calculation
  calculateRate(params: {
    fromCity: string;
    toCity: string;
    toZone: string;
    weight: number;
    codAmount: number;
    deliveryType?: string;
  }): Promise<ShippingRate>;

  // Fraud check (if available)
  checkFraud?(params: {
    phone: string;
    address: string;
    amount: number;
  }): Promise<{
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    reasons?: string[];
  }>;
}
