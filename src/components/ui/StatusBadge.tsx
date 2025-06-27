'use client';

import { Badge, BadgeProps } from '@/components/ui/badge';
import { OrderStatus, PaymentStatus } from '@prisma/client';

interface StatusBadgeProps extends BadgeProps {
  status: OrderStatus | PaymentStatus;
}

const statusMap: Record<OrderStatus | PaymentStatus, { label: string; variant: BadgeProps['variant'] }> = {
  // Order Statuses
  PENDING: { label: 'Pending', variant: 'warning' },
  CONFIRMED: { label: 'Confirmed', variant: 'info' },
  SHIPPED: { label: 'Shipped', variant: 'processing' },
  DELIVERED: { label: 'Delivered', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  
  // Payment Statuses
  PAID: { label: 'Paid', variant: 'success' },
  UNPAID: { label: 'Unpaid', variant: 'destructive' },
  // Assuming PENDING is shared
};

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const { label, variant } = statusMap[status] || { label: 'Unknown', variant: 'default' };

  return (
    <Badge variant={variant} className={className} {...props}>
      {label}
    </Badge>
  );
} 