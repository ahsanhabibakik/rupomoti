import { ShippingService } from './base';
import { PathaoService } from './pathao';
import { RedXService } from './redx';
import { SteadfastService } from './steadfast';

export type ShippingProvider = {
  id: string;
  name: string;
  code: string;
  type: 'pathao' | 'redx' | 'steadfast';
  credentials: {
    apiKey: string;
    apiSecret?: string;
    secretKey?: string;
    storeId?: string;
    [key: string]: any;
  };
  isActive: boolean;
};

export function createShippingService(provider: ShippingProvider): ShippingService {
  if (!provider.isActive) {
    throw new Error(`Provider ${provider.name} is not active`);
  }

  switch (provider.type) {
    case 'pathao':
      return new PathaoService(
        provider.credentials.apiKey,
        provider.credentials.apiSecret || '',
        provider.credentials.storeId || ''
      );
    case 'redx':
      return new RedXService(
        provider.credentials.apiKey,
        provider.credentials.storeId || ''
      );
    case 'steadfast':
      return new SteadfastService(
        provider.credentials.apiKey,
        provider.credentials.secretKey || ''
      );
    default:
      throw new Error(`Unsupported provider type: ${provider.type}`);
  }
}

// Re-export for backward compatibility
export { createShippingService as createShippingProvider }
