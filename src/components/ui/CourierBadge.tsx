'use client'

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import React from 'react';
import { Truck } from 'lucide-react';

const courierBadgeVariants = cva('flex items-center gap-1.5', {
  variants: {
    courier: {
      default: 'border-transparent bg-gray-500 text-gray-100 hover:bg-gray-500/80',
      pathao: 'border-transparent bg-pathao-light text-pathao-dark',
      redx: 'border-transparent bg-redx text-white',
      carrybee: 'border-transparent bg-carrybee text-carrybee-dark',
      steadfast: 'border-transparent bg-steadfast-green text-white',
    },
  },
  defaultVariants: {
    courier: 'default',
  },
});

export interface CourierBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  courierName: string | null | undefined;
  trackingId?: string | null | undefined;
}

function getCourierVariant(courierName: string | null | undefined): VariantProps<typeof courierBadgeVariants>['courier'] {
    if (!courierName) return 'default';
    const lowerCaseName = courierName.toLowerCase();
    if (lowerCaseName.includes('pathao')) return 'pathao';
    if (lowerCaseName.includes('redx')) return 'redx';
    if (lowerCaseName.includes('carrybee')) return 'carrybee';
    if (lowerCaseName.includes('steadfast')) return 'steadfast';
    return 'default';
}

function CourierBadge({ className, courierName, trackingId, ...props }: CourierBadgeProps) {
  if (!courierName) {
    return (
      <Badge variant="outline" className={cn("text-muted-foreground font-normal", className)}>
        Not Assigned
      </Badge>
    )
  }
  
  const variant = getCourierVariant(courierName);
  
  return (
    <div className="flex flex-col items-start gap-1">
      <Badge className={cn(courierBadgeVariants({ courier: variant }), className)} {...props}>
        <Truck className="h-3.5 w-3.5" />
        <span>{courierName}</span>
      </Badge>
      {trackingId && (
        <span className="text-xs text-muted-foreground font-mono pl-1">{trackingId}</span>
      )}
    </div>
  );
}

export { CourierBadge, courierBadgeVariants }; 