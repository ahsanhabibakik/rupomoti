'use client'

import React, { useState } from 'react'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, Package, Eye, Edit, Truck } from 'lucide-react'
import { showToast } from '@/lib/toast'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { OrderDetailsDialog } from '@/components/admin/OrderDetailsDialog'
import { CourierAssignmentForm } from '@/components/admin/CourierAssignmentForm'
import { ShipNowButton } from '@/components/admin/ShipNowButton'
import { Order } from '@prisma/client'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
});

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: null as Date | null,
    endDate: null as Date | null,
  })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: '10',
  });
  if (filters.status && filters.status !== 'all') searchParams.set('status', filters.status);
  if (filters.startDate) searchParams.set('startDate', filters.startDate.toISOString());
  if (filters.endDate) searchParams.set('endDate', filters.endDate.toISOString());

  const { data, error, isLoading, mutate } = useSWR(`/api/admin/orders?${searchParams.toString()}`, fetcher, {
    revalidateOnFocus: false,
  });
  
  const orders: Order[] = data?.orders || [];
  const totalPages = data?.totalPages || 1;

  if (error) {
    showToast.error(error.message);
  }

  return (
    <div className="space-y-6 admin-content">
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
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
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
                selected={{ from: filters.startDate!, to: filters.endDate! }}
                onSelect={(range) => {
                  setFilters({ ...filters, startDate: range?.from || null, endDate: range?.to || null });
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
              <TableHead>Courier</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">No orders found.</p>
                    </TableCell>
                </TableRow>
            ) : (
              orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-medium">#{order.orderNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(order.createdAt), 'dd MMM yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{order.customer.name}</div>
                    <div className="text-sm text-muted-foreground">{order.customer.phone}</div>
                  </TableCell>
                  <TableCell>৳{order.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'CANCELLED' ? 'destructive' : 'default'}>
                        {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.courierName ? (
                        <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            <span>{order.courierName}</span>
                        </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not Assigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                          <Eye className="mr-2 h-4 w-4" /> View
                       </Button>
                      
                      {!['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status) && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="mr-2 h-4 w-4" /> Assign
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <CourierAssignmentForm order={order} onSuccess={() => mutate()} />
                          </DialogContent>
                        </Dialog>
                      )}

                      <ShipNowButton order={order} onShipmentSuccess={() => mutate()} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedOrder && (
        <OrderDetailsDialog 
          order={selectedOrder} 
          open={!!selectedOrder}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSelectedOrder(null);
            }
          }}
          onActionComplete={() => {
            setSelectedOrder(null);
            mutate();
          }} 
        />
      )}

      <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
             Showing page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
              <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isLoading} variant="outline">Previous</Button>
              <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || isLoading} variant="outline">Next</Button>
          </div>
      </div>
    </div>
  )
} 