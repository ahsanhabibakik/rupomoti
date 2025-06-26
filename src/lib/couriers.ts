export const COURIERS = [
  {
    id: 'steadfast',
    name: 'Steadfast',
    apiUrl: 'https://portal.packzy.com/api/v1/create_order',
  },
  {
    id: 'redx',
    name: 'RedX',
    apiUrl: 'https://sandbox.redx.com.bd/v1.0.0-beta/parcel',
  },
  {
    id: 'pathao',
    name: 'Pathao',
    apiUrl: 'https://courier-api-sandbox.pathao.com/aladdin/api/v1/orders',
    tokenUrl: 'https://courier-api-sandbox.pathao.com/aladdin/api/v1/issue-token',
  },
  {
    id: 'carrybee',
    name: 'CarryBee',
    apiUrl: 'https://api.carrybee.io/v1/shipments',
  },
] as const;

export type Courier = (typeof COURIERS)[number];
export type CourierId = Courier['id']; 