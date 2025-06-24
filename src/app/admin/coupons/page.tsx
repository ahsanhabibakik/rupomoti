'use client'

import { useState, useEffect } from 'react'
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
import { CouponDialog } from '@/components/admin/CouponDialog'
import { toast } from '@/lib/toast'

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

const STATUS_TABS = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Used', value: 'USED' },
  { label: 'Inactive', value: 'INACTIVE' },
]

export default function CouponsPage() {
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ACTIVE')
  const [editingCoupon, setEditingCoupon] = useState<any>(null)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/coupons')
      const data = await response.json()
      setCoupons(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching coupons:', error)
      setLoading(false)
    }
  }

  const handleStatusChange = async (couponId: string, status: string) => {
    try {
      const response = await fetch(`/api/coupons/${couponId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        fetchCoupons()
      } else {
        console.error('Error changing coupon status')
      }
    } catch (error) {
      console.error('Error changing coupon status:', error)
    }
  }

  const handleDelete = async (couponId: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        const response = await fetch(`/api/coupons/${couponId}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          fetchCoupons()
        } else {
          console.error('Error deleting coupon')
        }
      } catch (error) {
        console.error('Error deleting coupon:', error)
      }
    }
  }

  const handleAdd = () => {
    setEditingCoupon(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon)
    setIsDialogOpen(true)
  }

  // Filter coupons by status
  const filteredCoupons = coupons.filter((coupon: any) => {
    if (activeTab === 'EXPIRED') {
      return new Date(coupon.validUntil) < new Date() && coupon.status === 'ACTIVE'
    }
    if (activeTab === 'USED') {
      return coupon.usedCount > 0
    }
    return coupon.status === activeTab
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Coupons</h1>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Coupon
        </Button>
      </div>

      <div className="flex items-center gap-4">
        {STATUS_TABS.map(tab => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
        <Input
          placeholder="Search coupons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm ml-auto"
        />
      </div>

      <DataTable
        columns={columns.map(col =>
          col.id === 'actions'
            ? {
                ...col,
                cell: ({ row }: any) => {
                  const coupon = row.original
                  return (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(coupon)}
                      >
                        Edit
                      </Button>
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
              }
            : col
        )}
        data={filteredCoupons.filter((coupon: any) =>
          coupon.code.toLowerCase().includes(search.toLowerCase())
        )}
      />

      <CouponDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        coupon={editingCoupon}
        onClose={fetchCoupons}
      />
    </div>
  )
} 