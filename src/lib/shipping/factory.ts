import { ShippingService } from './base';
import { PathaoService } from './pathao';
import { RedXService } from './redx';
import { SteadfastService } from './steadfast';

export function createShippingProvider(provider: any): ShippingService {
  switch (provider.type) {
    case 'pathao':
      return new PathaoService(
        provider.pathaoApiKey || '',
        provider.pathaoApiSecret || '',
        provider.pathaoStoreId
      );
    case 'redx':
      return new RedXService(
        provider.redxApiKey || '',
        provider.redxStoreId
      );
    case 'steadfast':
      return new SteadfastService(
        provider.steadfastApiKey || '',
        provider.steadfastStoreId
      );
    default:
      throw new Error(`Unsupported provider type: ${provider.type}`);
  }
}
