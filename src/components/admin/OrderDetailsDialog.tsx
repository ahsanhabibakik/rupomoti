'use client'

import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CourierSelector } from '@/components/admin/CourierSelector'

interface OrderDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: any
  onActionComplete: () => void;
}

export function OrderDetailsDialog({
  open,
  onOpenChange,
  order,
  onActionComplete
}: OrderDetailsDialogProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Order #{order.orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Order Status</p>
              <Badge
                variant={
                  order.status === 'DELIVERED'
                    ? 'success'
                    : order.status === 'CANCELLED'
                    ? 'destructive'
                    : 'default'
                }
              >
                {order.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <Badge
                variant={
                  order.paymentStatus === 'PAID'
                    ? 'success'
                    : order.paymentStatus === 'PENDING'
                    ? 'warning'
                    : 'destructive'
                }
              >
                {order.paymentStatus}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium">
                {format(new Date(order.createdAt), 'PPP')}
              </p>
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div>
            <h3 className="font-semibold mb-2">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{order.customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{order.customer.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{order.customer.phone}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Shipping Information */}
          <div>
            <h3 className="font-semibold mb-2">Shipping Information</h3>
            <p className="font-medium">{order.customer.address}, {order.customer.city}</p>
          </div>

          {order.courierName && (
            <>
              <Separator />
              {/* Courier Tracking Information */}
              <div>
                <h3 className="font-semibold mb-2">Tracking Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Tracking ID</p>
                    <p className="font-medium">{order.courierTrackingCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge>{order.courierStatus}</Badge>
                  </div>
                  {order.courierInfo?.lastUpdate && (
                    <div>
                      <p className="text-sm text-gray-500">Last Update</p>
                      <p className="font-medium">
                        {format(new Date(order.courierInfo.lastUpdate), 'PPP')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {order.status === 'CONFIRMED' && !order.courierConsignmentId && (
            <>
              <Separator />
              <CourierSelector order={order} onShipmentCreated={() => {
                onActionComplete();
                onOpenChange(false);
              }} />
            </>
          )}

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-2">Order Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      ৳{item.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ৳{(item.price * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Subtotal</p>
              <p className="font-medium">৳{order.subtotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Shipping</p>
              <p className="font-medium">৳{order.shipping.toFixed(2)}</p>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <p className="text-sm text-gray-500">Discount</p>
                <p className="font-medium text-red-600">
                  -৳{order.discount.toFixed(2)}
                </p>
              </div>
            )}
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Tax</p>
              <p className="font-medium">৳{order.tax.toFixed(2)}</p>
            </div>
            <Separator />
            <div className="flex justify-between">
              <p className="font-semibold">Total</p>
              <p className="font-semibold">৳{order.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 