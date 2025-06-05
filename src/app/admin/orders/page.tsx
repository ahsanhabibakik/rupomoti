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
import { CalendarIcon, Loader2 } from 'lucide-react'
import { showToast } from '@/lib/toast'

interface Order {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string
    phone: string
  }
  total: number
  status: string
  paymentStatus: string
  createdAt: string
  steadfastInfo?: {
    trackingId?: string
    consignmentId?: string
    status?: string
    lastUpdate?: string
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

  const handleAction = async (orderId: string, action: string) => {
    try {
      setActionLoading(true)
      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      showToast.success('Order updated successfully')
      fetchOrders()
    } catch (error) {
      showToast.error('Failed to update order')
      console.error('Error updating order:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, status: string) => {
    await handleAction(orderId, 'update_status')
  }

  const handleCreateShipment = async (orderId: string) => {
    await handleAction(orderId, 'create_shipment')
  }

  const handleTrackShipment = async (orderId: string) => {
    await handleAction(orderId, 'track_shipment')
  }

  const handleCancelShipment = async (orderId: string) => {
    await handleAction(orderId, 'cancel_shipment')
  }

  return (
    <div className="space-y-4">
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
              <SelectItem value="">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.startDate ? (
                  filters.endDate ? (
                    <>
                      {format(filters.startDate, 'LLL dd, y')} -{' '}
                      {format(filters.endDate, 'LLL dd, y')}
                    </>
                  ) : (
                    format(filters.startDate, 'LLL dd, y')
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: filters.startDate || undefined,
                  to: filters.endDate || undefined,
                }}
                onSelect={(range) =>
                  setFilters({
                    ...filters,
                    startDate: range?.from || null,
                    endDate: range?.to || null,
                  })
                }
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
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
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer.name}</div>
                      <div className="text-sm text-gray-500">{order.customer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>৳{order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                      disabled={actionLoading}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : order.paymentStatus === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Order Details</DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-4">
                              {/* Order details content */}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {!order.steadfastInfo?.trackingId ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateShipment(order.id)}
                          disabled={actionLoading}
                        >
                          Create Shipment
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTrackShipment(order.id)}
                            disabled={actionLoading}
                          >
                            Track
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelShipment(order.id)}
                            disabled={actionLoading}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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