'use client'

import { useState } from 'react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';

interface ShipOrderResult {
  success: boolean;
  trackingCode?: string;
  error?: string;
}

export function useShipOrder() {
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = useSWRConfig();

  const shipOrder = async (orderId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(`Shipment Failed: ${data.error || 'Unknown error'}`);
        return false;
      }

      toast.success(`Order #${data.order.orderNumber} shipped successfully!`);
      mutate('/api/admin/orders'); // Revalidate orders data
      return true;
    } catch (error: any) {
      toast.error(`An unexpected error occurred: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { shipOrder, isLoading };
} 