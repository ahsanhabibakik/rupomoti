export interface ShippingService {
  createOrder(order: any): Promise<{ trackingId: string; [key: string]: any }>;
  getAreas(): Promise<any[]>;
  calculateRate(params: any): Promise<{ rate: number; [key: string]: any }>;
}
