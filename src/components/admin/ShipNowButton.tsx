'use client'

import { useShipOrder } from '@/hooks/useShipOrder';
import { Button } from '@/components/ui/button';
import { Loader2, Rocket, Truck } from 'lucide-react';
// Import Mongoose models to replace Prisma models
import Order from '@/models/Order';


interface ShipNowButtonProps {
  order: Order;
  onShipmentSuccess?: () => void;
}

export function ShipNowButton({ order, onShipmentSuccess }: ShipNowButtonProps) {
  const { shipOrder, isLoading } = useShipOrder();

  const handleShip = async () => {
    const success = await shipOrder(order.id);
    if (success && onShipmentSuccess) {
      onShipmentSuccess();
    }
  };
  
  const isShipped = order.status === 'SHIPPED' || order.status === 'DELIVERED';

  if (order.status === 'SHIPPED' || order.status === 'DELIVERED' || order.status === 'CANCELLED') {
    return null;
  }

  return (
    <Button
      onClick={handleShip}
      disabled={isLoading || !order.courierName}
      size="sm"
      variant="default"
      aria-label={`Ship order ${order.orderNumber}`}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Truck className="mr-2 h-4 w-4" />
      )}
      Ship Now
    </Button>
  );
} 