'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { useCoupons } from '@/hooks/useCoupons'
import { CouponDialog } from '@/components/admin/CouponDialog'

export default function CouponsPage() {
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null)
  const { data: coupons, isLoading, error } = useCoupons()

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
        return type === 'percentage' ? 'Percentage' : 'Fixed Amount'
      },
    },
    {
      accessorKey: 'value',
      header: 'Value',
      cell: ({ row }) => {
        const value = row.getValue('value')
        const type = row.original.type
        return type === 'percentage'
          ? `${value}%`
          : new Intl.NumberFormat('bn-BD', {
              style: 'currency',
              currency: 'BDT'
            }).format(value)
      },
    },
    {
      accessorKey: 'usageCount',
      header: 'Usage',
      cell: ({ row }) => {
        const usageCount = row.getValue('usageCount')
        const usageLimit = row.original.usageLimit
        return usageLimit ? `${usageCount}/${usageLimit}` : usageCount
      },
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }) => {
        const date = new Date(row.getValue('startDate'))
        return date.toLocaleDateString('bn-BD')
      },
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }) => {
        const date = new Date(row.getValue('endDate'))
        return date.toLocaleDateString('bn-BD')
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const coupon = row.original

        const handleEdit = () => {
          setSelectedCoupon(coupon)
          setIsDialogOpen(true)
        }

        const handleDelete = async () => {
          if (window.confirm('Are you sure you want to delete this coupon?')) {
            await deleteCoupon(coupon.id)
          }
        }

        return (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              Edit
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
        <p className="text-destructive">Error loading coupons</p>
      </div>
    )
  }

  const filteredCoupons = coupons?.filter(coupon =>
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
        data={filteredCoupons || []}
      />

      <CouponDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        coupon={selectedCoupon}
        onClose={() => setSelectedCoupon(null)}
      />
    </div>
  )
} 