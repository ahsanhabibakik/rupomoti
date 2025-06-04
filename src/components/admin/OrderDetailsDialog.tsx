'use client'

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

interface OrderDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: any // Replace with proper type
}

export function OrderDetailsDialog({ open, onOpenChange, order }: OrderDetailsDialogProps) {
  if (!order) return null

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details - {order.orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Customer Information</h3>
              <p>Name: {order.customer.name}</p>
              <p>Email: {order.customer.email || 'N/A'}</p>
              <p>Phone: {order.customer.phone}</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Order Information</h3>
              <p>Date: {new Date(order.createdAt).toLocaleDateString('bn-BD')}</p>
              <p>Status: <Badge className={statusColors[order.status]}>{order.status}</Badge></p>
              <p>Total: {new Intl.NumberFormat('bn-BD', {
                style: 'currency',
                currency: 'BDT'
              }).format(order.total)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Shipping Information</h3>
            <p>{order.shippingInfo.address}</p>
            <p>{order.shippingInfo.city}, {order.shippingInfo.postalCode}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Order Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell>{new Intl.NumberFormat('bn-BD', {
                      style: 'currency',
                      currency: 'BDT'
                    }).format(item.price)}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{new Intl.NumberFormat('bn-BD', {
                      style: 'currency',
                      currency: 'BDT'
                    }).format(item.price * item.quantity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {order.paymentInfo && (
            <div className="space-y-2">
              <h3 className="font-semibold">Payment Information</h3>
              <p>Method: {order.paymentInfo.method}</p>
              <p>Status: {order.paymentInfo.status}</p>
              {order.paymentInfo.transactionId && (
                <p>Transaction ID: {order.paymentInfo.transactionId}</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 