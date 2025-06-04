'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { useOrders } from '@/hooks/useOrders'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OrderDetailsDialog } from '@/components/admin/OrderDetailsDialog'

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const { data: orders, isLoading, error, updateOrder, deleteOrder } = useOrders()

  const columns = [
    {
      accessorKey: 'orderNumber',
      header: 'Order Number',
    },
    {
      accessorKey: 'customer.name',
      header: 'Customer',
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => {
        const total = parseFloat(row.getValue('total'))
        const formatted = new Intl.NumberFormat('bn-BD', {
          style: 'currency',
          currency: 'BDT'
        }).format(total)
        return formatted
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const order = row.original

        return (
          <Select
            defaultValue={order.status}
            onValueChange={(status) => updateOrder(order.id, { status })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'))
        return date.toLocaleDateString('bn-BD')
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const order = row.original

        const handleDelete = async () => {
          if (window.confirm('Are you sure you want to delete this order?')) {
            await deleteOrder(order.id)
          }
        }

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedOrder(order)
                setIsDetailsOpen(true)
              }}
            >
              View Details
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        )
      },
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Error loading orders</p>
      </div>
    )
  }

  const filteredOrders = orders?.filter(order =>
    order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    order.customer.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredOrders || []}
      />

      <OrderDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        order={selectedOrder}
      />
    </div>
  )
} 