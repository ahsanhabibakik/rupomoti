'use client';

import { Badge, BadgeProps } from '@/components/ui/badge';
import { OrderStatus, PaymentStatus } from '@/types/mongoose-types';

interface StatusBadgeProps extends BadgeProps {
  status: OrderStatus | PaymentStatus;
}

const statusMap: Record<OrderStatus | PaymentStatus, { label: string; variant: BadgeProps['variant'] }> = {
  // Order Statuses
  PENDING: { label: 'Pending', variant: 'warning' },
  CONFIRMED: { label: 'Confirmed', variant: 'info' },
  PROCESSING: { label: 'Processing', variant: 'warning' },
  SHIPPED: { label: 'Shipped', variant: 'processing' },
  DELIVERED: { label: 'Delivered', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  REFUNDED: { label: 'Refunded', variant: 'secondary' },
  
  // Payment Statuses
  PAID: { label: 'Paid', variant: 'success' },
  FAILED: { label: 'Failed', variant: 'destructive' }
};

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const { label, variant } = statusMap[status] || { label: 'Unknown', variant: 'default' };

  return (
    <Badge variant={variant} className={className} {...props}>
      {label}
    </Badge>
  );
} 