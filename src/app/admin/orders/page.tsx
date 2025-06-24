'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'

interface Order {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string
    phone: string
    address: string
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
  steadfastInfo?: {
    trackingId?: string
    consignmentId?: string
    status?: string
    lastUpdate?: string
    lastMessage?: string
  }
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    status: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
  })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [processingOrder, setProcessingOrder] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      })

      if (filters.status) searchParams.append('status', filters.status)
      if (filters.startDate) searchParams.append('startDate', filters.startDate.toISOString())
      if (filters.endDate) searchParams.append('endDate', filters.endDate.toISOString())

      const response = await fetch(`/api/admin/orders?${searchParams}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setOrders(data.orders)
      setTotalPages(data.pages)
    } catch (error) {
      showToast.error('Failed to fetch orders')
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [page, filters])

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

  const handleCreateShipment = async (order: Order) => {
    await handleOrderAction(order.id, 'create_shipment')
  }

  const handleUpdateStatus = async (orderId: string, status: string) => {
    await handleOrderAction(orderId, 'update_status', { status })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'warning',
      PROCESSING: 'default',
      CONFIRMED: 'default',
      SHIPPED: 'info',
      DELIVERED: 'success',
      CANCELLED: 'destructive',
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'warning',
      PAID: 'success',
      FAILED: 'destructive',
      REFUNDED: 'default',
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex items-center gap-4">
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
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
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      #{order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{order.customer.name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div
                            key={index}
                            className="relative h-8 w-8 rounded-full border-2 border-background overflow-hidden"
                          >
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>৳{order.total.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Order #{order.orderNumber}</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="max-h-[60vh]">
                              <div className="space-y-6 p-1">
                                {/* Order Status */}
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Order Status</p>
                                    {getStatusBadge(order.status)}
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Payment Status</p>
                                    {getPaymentStatusBadge(order.paymentStatus)}
                                  </div>
                                </div>

                                <Separator />

                                {/* Customer Information */}
                                <div>
                                  <h3 className="font-medium mb-2">Customer Information</h3>
                                  <div className="grid gap-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Name</span>
                                      <span>{order.customer.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Phone</span>
                                      <span>{order.customer.phone}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Email</span>
                                      <span>{order.customer.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Address</span>
                                      <span className="text-right">{order.customer.address}</span>
                                    </div>
                                  </div>
                                </div>

                                <Separator />

                                {/* Order Items */}
                                <div>
                                  <h3 className="font-medium mb-2">Order Items</h3>
                                  <div className="space-y-4">
                                    {order.items.map((item, index) => (
                                      <div key={index} className="flex gap-4">
                                        <div className="relative h-16 w-16 rounded overflow-hidden flex-shrink-0">
                                          <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                        <div className="flex-1">
                                          <h4 className="font-medium">{item.name}</h4>
                                          <div className="text-sm text-muted-foreground">
                                            <span>৳{item.price.toLocaleString()}</span>
                                            <span className="mx-2">×</span>
                                            <span>{item.quantity}</span>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-medium">
                                            ৳{(item.price * item.quantity).toLocaleString()}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <Separator />

                                {/* Order Total */}
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>৳{order.total.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between font-medium">
                                    <span>Total</span>
                                    <span>৳{order.total.toLocaleString()}</span>
                                  </div>
                                </div>

                                {/* Steadfast Information */}
                                {order.steadfastInfo && (
                                  <>
                                    <Separator />
                                    <div>
                                      <h3 className="font-medium mb-2">Delivery Information</h3>
                                      <div className="grid gap-2 text-sm">
                                        {order.steadfastInfo.trackingId && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tracking ID</span>
                                            <span>{order.steadfastInfo.trackingId}</span>
                                          </div>
                                        )}
                                        {order.steadfastInfo.status && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Status</span>
                                            <span>{order.steadfastInfo.status}</span>
                                          </div>
                                        )}
                                        {order.steadfastInfo.lastUpdate && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Last Update</span>
                                            <span>
                                              {format(new Date(order.steadfastInfo.lastUpdate), 'PPP')}
                                            </span>
                                          </div>
                                        )}
                                        {order.steadfastInfo.lastMessage && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Latest Update</span>
                                            <span>{order.steadfastInfo.lastMessage}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </ScrollArea>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 mt-6 pt-6 border-t">
                              {order.status === 'PENDING' && (
                                <Button
                                  onClick={() => handleConfirmOrder(order)}
                                  disabled={processingOrder === order.id}
                                >
                                  {processingOrder === order.id ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Confirming...
                                    </>
                                  ) : (
                                    'Confirm Order'
                                  )}
                                </Button>
                              )}

                              {order.status === 'CONFIRMED' && !order.steadfastInfo?.trackingId && (
                                <Button
                                  onClick={() => handleCreateShipment(order)}
                                  disabled={processingOrder === order.id}
                                >
                                  {processingOrder === order.id ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Creating Shipment...
                                    </>
                                  ) : (
                                    <>
                                      <Package className="mr-2 h-4 w-4" />
                                      Create Shipment
                                    </>
                                  )}
                                </Button>
                              )}

                              {order.steadfastInfo?.trackingId && (
                                <Button variant="outline" asChild>
                                  <a
                                    href={`https://steadfast.com.bd/track/${order.steadfastInfo.trackingId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Truck className="mr-2 h-4 w-4" />
                                    Track on Steadfast
                                  </a>
                                </Button>
                              )}

                              <Select
                                value={order.status}
                                onValueChange={(value) => handleUpdateStatus(order.id, value)}
                                disabled={processingOrder === order.id}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PENDING">Pending</SelectItem>
                                  <SelectItem value="PROCESSING">Processing</SelectItem>
                                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  )
} 