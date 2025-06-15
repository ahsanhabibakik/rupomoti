'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const columns = [
  {
    accessorKey: 'code',
    header: 'Code',
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type')
      return type === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'
    },
  },
  {
    accessorKey: 'value',
    header: 'Value',
    cell: ({ row }) => {
      const type = row.getValue('type')
      const value = row.getValue('value')
      return type === 'PERCENTAGE' ? `${value}%` : `৳${value}`
    },
  },
  {
    accessorKey: 'minPurchase',
    header: 'Min. Purchase',
    cell: ({ row }) => {
      const value = row.getValue('minPurchase')
      return value ? `৳${value}` : 'No minimum'
    },
  },
  {
    accessorKey: 'usageLimit',
    header: 'Usage Limit',
    cell: ({ row }) => {
      const value = row.getValue('usageLimit')
      return value || 'Unlimited'
    },
  },
  {
    accessorKey: 'usedCount',
    header: 'Used',
  },
  {
    accessorKey: 'validUntil',
    header: 'Valid Until',
    cell: ({ row }) => {
      const date = row.getValue('validUntil')
      return date ? new Date(date).toLocaleDateString() : 'No expiry'
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status')
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {status}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const coupon = row.original
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusChange(coupon.id, coupon.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
          >
            {coupon.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(coupon.id)}
          >
            Delete
          </Button>
        </div>
      )
    },
  },
]

export default function CouponsPage() {
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)

  // TODO: Implement coupon management hooks
  const handleStatusChange = async (couponId: string, status: string) => {
    try {
      // TODO: Implement status change API call
      console.log('Changing coupon status:', couponId, status)
    } catch (error) {
      console.error('Error changing coupon status:', error)
    }
  }

  const handleDelete = async (couponId: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        // TODO: Implement delete API call
        console.log('Deleting coupon:', couponId)
      } catch (error) {
        console.error('Error deleting coupon:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  const filteredCoupons = coupons.filter((coupon: any) =>
    coupon.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Coupons</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Coupon
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search coupons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredCoupons}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Coupon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* TODO: Implement coupon creation form */}
            <p>Coupon creation form will be implemented here</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 