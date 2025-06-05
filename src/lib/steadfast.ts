import axios from 'axios';

const STEADFAST_API_URL = 'https://portal.packzy.com/api/v1';
const API_KEY = process.env.STEADFAST_API_KEY;
const SECRET_KEY = process.env.STEADFAST_SECRET_KEY;

if (!API_KEY || !SECRET_KEY) {
  console.error('❌ Steadfast API credentials not found in environment variables');
  throw new Error('Steadfast API credentials not found in environment variables');
}

const steadfastApi = axios.create({
  baseURL: STEADFAST_API_URL,
  headers: {
    'api-key': API_KEY,
    'secret-key': SECRET_KEY,
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for logging
steadfastApi.interceptors.response.use(
  (response) => {
    console.log(`✅ Steadfast API call successful: ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ Steadfast API call failed: ${error.config?.url}`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface SteadfastParcel {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city: string;
  recipient_zone: string;
  cod_amount: number;
  note?: string;
  item_description?: string;
  total_lot?: number;
  delivery_type?: number; // 0 = home delivery, 1 = point delivery
  alternative_phone?: string;
  recipient_email?: string;
}

export interface SteadfastResponse {
  success: boolean;
  message: string;
  consignment_id?: string;
  tracking_id?: string;
  error?: any;
}

// Check API connection
export async function checkSteadfastConnection(): Promise<boolean> {
  try {
    // Get current balance as a simple API test
    await steadfastApi.get('/get_balance');
    console.log('✅ Steadfast API connection successful');
    return true;
  } catch (error) {
    console.error('❌ Steadfast API connection failed:', error.response?.data || error.message);
    return false;
  }
}

// Check connection on module load
checkSteadfastConnection()
  .then((isConnected) => {
    if (!isConnected) {
      console.error('❌ Initial Steadfast API connection check failed');
    }
  })
  .catch((error) => {
    console.error('❌ Unexpected error during Steadfast API connection check:', error);
  });

export const steadfast = {
  async createParcel(parcelData: SteadfastParcel): Promise<SteadfastResponse> {
    try {
      console.log('📦 Creating parcel with Steadfast:', parcelData);
      const response = await steadfastApi.post('/create_order', parcelData);
      console.log('✅ Parcel created successfully:', response.data);
      return {
        success: true,
        message: 'Parcel created successfully',
        consignment_id: response.data.consignment.consignment_id,
        tracking_id: response.data.consignment.tracking_code,
      };
    } catch (error: any) {
      console.error('❌ Steadfast API Error:', error.response?.data || error.message);
      return {
        success: false,
        message: 'Failed to create parcel',
        error: error.response?.data || error.message,
      };
    }
  },

  async createBulkParcels(parcels: SteadfastParcel[]): Promise<SteadfastResponse> {
    try {
      console.log('📦 Creating bulk parcels with Steadfast:', parcels.length);
      const response = await steadfastApi.post('/create_order/bulk-order', {
        data: JSON.stringify(parcels),
      });
      console.log('✅ Bulk parcels created successfully:', response.data);
      return {
        success: true,
        message: 'Bulk parcels created successfully',
        ...response.data,
      };
    } catch (error: any) {
      console.error('❌ Steadfast Bulk API Error:', error.response?.data || error.message);
      return {
        success: false,
        message: 'Failed to create bulk parcels',
        error: error.response?.data || error.message,
      };
    }
  },

  async getDeliveryStatus(id: string, type: 'consignment' | 'invoice' | 'tracking' = 'consignment'): Promise<SteadfastResponse> {
    try {
      let endpoint = '';
      switch (type) {
        case 'consignment':
          endpoint = `/status_by_cid/${id}`;
          break;
        case 'invoice':
          endpoint = `/status_by_invoice/${id}`;
          break;
        case 'tracking':
          endpoint = `/status_by_trackingcode/${id}`;
          break;
      }

      console.log(`🔍 Getting delivery status for ${type} ID:`, id);
      const response = await steadfastApi.get(endpoint);
      console.log('✅ Delivery status retrieved:', response.data);
      return {
        success: true,
        message: 'Delivery status retrieved',
        ...response.data,
      };
    } catch (error: any) {
      console.error('❌ Steadfast Status Error:', error.response?.data || error.message);
      return {
        success: false,
        message: 'Failed to get delivery status',
        error: error.response?.data || error.message,
      };
    }
  },

  async getBalance(): Promise<SteadfastResponse> {
    try {
      console.log('💰 Getting current balance');
      const response = await steadfastApi.get('/get_balance');
      console.log('✅ Balance retrieved:', response.data);
      return {
        success: true,
        message: 'Balance retrieved successfully',
        ...response.data,
      };
    } catch (error: any) {
      console.error('❌ Steadfast Balance Error:', error.response?.data || error.message);
      return {
        success: false,
        message: 'Failed to get balance',
        error: error.response?.data || error.message,
      };
    }
  },
}; 