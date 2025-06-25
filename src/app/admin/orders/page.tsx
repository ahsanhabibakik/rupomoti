'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, Package, Truck, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { showToast } from '@/lib/toast'
import { Badge, badgeVariants } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import { CourierSelector } from '@/components/admin/CourierSelector'
import { cn } from '@/lib/utils'
import { OrderDetailsDialog } from '@/components/admin/OrderDetailsDialog'

interface Order {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string
    phone: string
    address: string
    city?: string
  }
  total: number
  status: string
  paymentStatus: string
  createdAt: string
  items: Array<{
    name: string
    price: number
    quantity: number
    image: string
  }>
  courierName?: string
  courierConsignmentId?: string
  courierTrackingCode?: string
  courierStatus?: string
  courierInfo?: any
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [filters, setFilters] = useState({
    status: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
  })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [processingOrder, setProcessingOrder] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const searchParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      })

      if (filters.status && filters.status !== 'all-orders') searchParams.append('status', filters.status)
      if (filters.startDate) searchParams.append('startDate', filters.startDate.toISOString())
      if (filters.endDate) searchParams.append('endDate', filters.endDate.toISOString())

      const response = await fetch(`/api/admin/orders?${searchParams}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setOrders(data.orders)
      setTotalPages(data.totalPages)
      setTotalCount(data.totalCount)
    } catch (error) {
      showToast.error('Failed to fetch orders')
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [page, filters, pageSize])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleOrderAction = async (orderId: string, action: string, data?: any) => {
    try {
      setProcessingOrder(orderId)
      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action, ...data }),
      })

      const responseData = await response.json()
      if (!response.ok) throw new Error(responseData.error)

      showToast.success('Order updated successfully')
      fetchOrders()
    } catch (error: any) {
      showToast.error(error.message || 'Failed to update order')
      console.error('Error updating order:', error)
    } finally {
      setProcessingOrder(null)
    }
  }

  const handleConfirmOrder = async (order: Order) => {
    await handleOrderAction(order.id, 'confirm_order')
  }

  const handleUpdateStatus = async (orderId: string, status: string) => {
    await handleOrderAction(orderId, 'update_status', { status })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'outline',
      PROCESSING: 'default',
      CONFIRMED: 'default',
      SHIPPED: 'secondary',
      DELIVERED: 'default',
      CANCELLED: 'destructive',
    } as const
    const variantKey = status as keyof typeof variants;
    return (
      <div className={cn(badgeVariants({ variant: variants[variantKey] || 'default' }))}>
        {status}
      </div>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'outline',
      PAID: 'default',
      FAILED: 'destructive',
      REFUNDED: 'secondary',
    } as const
    const variantKey = status as keyof typeof variants;
    return (
      <div className={cn(badgeVariants({ variant: variants[variantKey] || 'default' }))}>
        {status}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex items-center gap-4">
          <Select
            value={filters.status}
            onValueChange={(value: string) => {
              setFilters({ ...filters, status: value })
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-orders">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.startDate && filters.endDate ? (
                  `${format(filters.startDate, 'LLL dd, y')} - ${format(filters.endDate, 'LLL dd, y')}`
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.startDate || undefined}
                selected={{
                  from: filters.startDate || undefined,
                  to: filters.endDate || undefined,
                }}
                onSelect={(range: any) => {
                  setFilters({
                    ...filters,
                    startDate: range?.from || null,
                    endDate: range?.to || null,
                  })
                  setPage(1);
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Courier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : orders.map((order) => (
                  <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                  <TableCell>{order.customer.name}</TableCell>
                  <TableCell>৳{order.total.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                    <TableCell>
                    {order.courierName || '-'}
                    </TableCell>
                  <TableCell>{format(new Date(order.createdAt), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                              View Details
                            </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Order #{selectedOrder.orderNumber}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] p-4">
              <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Customer Information</h3>
                    <p>{selectedOrder.customer.name}</p>
                    <p>{selectedOrder.customer.phone}</p>
                    <p>{selectedOrder.customer.address}</p>
            </div>
                  <Separator/>
                  {selectedOrder.status === 'CONFIRMED' && !selectedOrder.courierConsignmentId ? (
                      <CourierSelector 
                          order={selectedOrder} 
                          onShipmentCreated={() => {
                              fetchOrders();
                              setSelectedOrder(null);
                          }} 
                      />
                  ) : selectedOrder.courierName ? (
                      <div>
                          <h3 className="font-semibold mb-2">Courier Information</h3>
                          <p><strong>Courier:</strong> {selectedOrder.courierName}</p>
                          <p><strong>Tracking:</strong> {selectedOrder.courierTrackingCode || 'N/A'}</p>
                          <p><strong>Status:</strong> {selectedOrder.courierStatus || 'N/A'}</p>
              </div>
                  ) : null }
                  <Separator/>
                  {/* Item details and totals */}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 