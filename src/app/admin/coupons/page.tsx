'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { CouponDialog } from '@/components/admin/CouponDialog'
import { useCoupons } from '@/hooks/useCoupons'
import { CouponTableSkeleton } from '@/components/admin/CouponTableSkeleton'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'

import { type Coupon } from '@prisma/client'

type CouponTableRow = {
  original: Coupon
  getValue: (key: string) => any
}

export default function CouponsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { coupons, isLoading, error, mutate } = useCoupons(searchParams?.toString() || '')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null)
  
  const searchTerm = searchParams?.get('q') || ''
  const [localSearch, setLocalSearch] = useState(searchTerm)
  const debouncedSearch = useDebounce(localSearch, 500)

  const createQueryString = useCallback(
    (paramsToUpdate: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams?.toString() || '')
      Object.entries(paramsToUpdate).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      return params.toString()
    },
    [searchParams]
  )
  
  useEffect(() => {
    router.push(`${pathname}?${createQueryString({ q: debouncedSearch || null })}`, { scroll: false })
  }, [debouncedSearch, router, pathname, createQueryString])

  const handleOpenDialog = (coupon: any = null) => {
    setSelectedCoupon(coupon)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedCoupon(null)
    mutate() // Re-fetch coupons
  }
  
  const status = searchParams?.get('status') || 'ACTIVE';
  const type = searchParams?.get('type') || 'all';

  const columns = useMemo(() => [
    { accessorKey: 'code', header: 'Code' },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }: { row: CouponTableRow }) => {
        const type = row.getValue('type');
        return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      }
  },
  {
    accessorKey: 'value',
    header: 'Value',
    cell: ({ row }: { row: CouponTableRow }) => {
        const type = row.original.type;
        const value = row.getValue('value');
        return type === 'percentage' ? `${value}%` : `৳${value}`;
      }
    },
    {
      accessorKey: 'minimumAmount',
      header: 'Min. Spend',
      cell: ({ row }) => row.original.minimumAmount ? `৳${row.original.minimumAmount}` : 'N/A'
  },
  {
    accessorKey: 'usageLimit',
    header: 'Usage Limit',
      cell: ({ row }) => row.original.usageLimit ?? 'Unlimited'
    },
    { accessorKey: 'usedCount', header: 'Used' },
  {
    accessorKey: 'validUntil',
    header: 'Valid Until',
      cell: ({ row }) => new Date(row.original.validUntil).toLocaleDateString()
  },
  {
      accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
        const isActive = row.getValue('isActive');
        return <Badge variant={isActive ? 'success' : 'destructive'}>{isActive ? 'Active' : 'Inactive'}</Badge>;
      }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const coupon = row.original
      return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleOpenDialog(coupon)}>
              Edit
          </Button>
            <Button variant="destructive" size="sm" onClick={() => console.log('delete', coupon.id)}>
            Delete
          </Button>
        </div>
      )
    },
  },
  ], []);

  const activeFiltersCount = [
    searchParams.get('type') && searchParams.get('type') !== 'all',
  ].filter(Boolean).length;

  if (isLoading && !coupons) {
    return <CouponTableSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Coupons</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Coupon
        </Button>
      </div>

      <Tabs value={status} onValueChange={(value) => router.push(`${pathname}?${createQueryString({ status: value })}`, { scroll: false })}>
        <TabsList>
          <TabsTrigger value="ACTIVE">Active</TabsTrigger>
          <TabsTrigger value="INACTIVE">Inactive</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by coupon code..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="max-w-sm"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Filter
              {activeFiltersCount > 0 && <Badge variant="secondary">{activeFiltersCount}</Badge>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Filters</h4>
                <p className="text-sm text-muted-foreground">
                  Refine your coupon list.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={type}
                    onValueChange={(value) => router.push(`${pathname}?${createQueryString({ type: value === 'all' ? null : value })}`, { scroll: false })}
                  >
                    <SelectTrigger id="type" className="col-span-2 h-8">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {isLoading ? (
        <CouponTableSkeleton />
      ) : error ? (
        <div className="text-red-500">Failed to load coupons.</div>
      ) : (
        <DataTable columns={columns} data={coupons || []} />
      )}

      <CouponDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onClose={handleCloseDialog}
        coupon={selectedCoupon}
      />
    </div>
  )
} 