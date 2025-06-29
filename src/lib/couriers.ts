export type CourierId = 'steadfast' | 'pathao' | 'redx' | 'carrybee';

export interface Courier {
  id: CourierId;
  name: string;
  createOrderUrl: string;
  tokenUrl?: string; // For OAuth providers
  trackingUrl?: (trackingId: string) => string;
}

export const COURIERS: Courier[] = [
  {
    id: 'steadfast',
    name: 'Steadfast',
    createOrderUrl: 'https://portal.packzy.com/api/v1/create_order',
    trackingUrl: (id) => `https://steadfast.com.bd/track/${id}`,
  },
  {
    id: 'pathao',
    name: 'Pathao',
    // Note: Using production URL. Sandbox token URL is different.
    tokenUrl: 'https://api-hermes.pathao.com/aladdin/api/v1/issue-token',
    createOrderUrl: 'https://api-hermes.pathao.com/aladdin/api/v1/orders',
    trackingUrl: (id) => `https://pathao.com/track/${id}`,
  },
  {
    id: 'redx',
    name: 'RedX',
    createOrderUrl: 'https://openapi.redx.com.bd/v1.0.0-beta/parcel',
    trackingUrl: (id) => `https://redx.com.bd/track?trackingId=${id}`,
  },
  {
    id: 'carrybee',
    name: 'CarryBee',
    tokenUrl: 'https://developers.carrybee.com/api/login',
    createOrderUrl: 'https://developers.carrybee.com/api/orders',
    trackingUrl: (id) => `https://carrybee.com/track/${id}`,
  },
]; 