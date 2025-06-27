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
import { ScrollArea } from '@/components/ui/scroll-area'

interface OrderDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: any
  onActionComplete: () => void
}

export function OrderDetailsDialog({
  open,
  onOpenChange,
  order,
  onActionComplete,
}: OrderDetailsDialogProps) {
  if (!order) return null

  const subtotal = order.subtotal ?? 0
  const deliveryFee = order.deliveryFee ?? 0
  const discount = order.discount ?? 0
  const tax = order.tax ?? 0
  const total = order.total ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Order #{order.orderNumber}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
          <div className="space-y-6 py-4">
            {/* Order Status & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Status</p>
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
                <p className="text-sm text-gray-500 mb-1">Payment Status</p>
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
                <p className="text-sm text-gray-500 mb-1">Order Date</p>
                <p className="font-medium">
                  {format(new Date(order.createdAt), 'PPP')}
                </p>
              </div>
            </div>

            <Separator />

            {/* Customer & Shipping */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Customer</h3>
                <div className="text-sm">
                  <p><strong>Name:</strong> {order.customer.name}</p>
                  <p><strong>Email:</strong> {order.customer.email}</p>
                  <p><strong>Phone:</strong> {order.customer.phone}</p>
                </div>
                <Separator/>
                <h3 className="font-semibold text-lg">Shipping Address</h3>
                <p className="text-sm">{order.customer.address}, {order.customer.city}</p>
              </div>

              {/* Courier & Tracking */}
              <div className="space-y-4">
                {order.courierName ? (
                  <>
                    <h3 className="font-semibold text-lg">Tracking Info</h3>
                    <div className="text-sm space-y-1">
                      <p><strong>Courier:</strong> {order.courierName}</p>
                      <p><strong>Tracking ID:</strong> {order.courierTrackingCode}</p>
                      <p><strong>Status:</strong> <Badge variant="secondary">{order.courierStatus}</Badge></p>
                      {order.courierInfo?.lastUpdate && (
                        <p><strong>Last Update:</strong> {format(new Date(order.courierInfo.lastUpdate), 'PPP p')}</p>
                      )}
                    </div>
                  </>
                ) : order.status === 'CONFIRMED' && !order.courierConsignmentId && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Assign Courier</h3>
                    <CourierSelector order={order} onShipmentCreated={() => {
                      onActionComplete()
                      onOpenChange(false)
                    }} />
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Order Items</h3>
              <div className="border rounded-lg">
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
                        <TableCell className="font-medium">{item.product.name}</TableCell>
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
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="flex justify-end">
                <div className="w-full md:w-1/3 space-y-2">
                    <h3 className="font-semibold text-lg">Summary</h3>
                    <div className="flex justify-between text-sm">
                      <p className="text-gray-500">Subtotal</p>
                      <p className="font-medium">৳{subtotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between text-sm">
                      <p className="text-gray-500">Shipping</p>
                      <p className="font-medium">৳{deliveryFee.toFixed(2)}</p>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <p className="text-gray-500">Discount</p>
                        <p className="font-medium text-red-600">
                          -৳{discount.toFixed(2)}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <p className="text-gray-500">Tax</p>
                      <p className="font-medium">৳{tax.toFixed(2)}</p>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <p>Total</p>
                      <p>৳{total.toFixed(2)}</p>
                    </div>
                </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 