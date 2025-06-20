'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { showToast } from '@/lib/toast'
import { formatPrice } from '@/lib/utils'

interface Coupon {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
  value: number
  minimumAmount?: number
  maximumDiscount?: number
  usageLimit?: number
  usedCount: number
  isActive: boolean
  validFrom: string
  validUntil: string
  createdAt: string
}

interface CouponFormData {
  code: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
  value: number
  minimumAmount: number | undefined
  maximumDiscount: number | undefined
  usageLimit: number | undefined
  validFrom: string
  validUntil: string
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    type: 'PERCENTAGE',
    value: 0,
    minimumAmount: undefined,
    maximumDiscount: undefined,
    usageLimit: undefined,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/coupons')
      if (response.ok) {
        const data = await response.json()
        setCoupons(data)
      } else {
        throw new Error('Failed to fetch coupons')
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
      showToast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'PERCENTAGE',
      value: 0,
      minimumAmount: undefined,
      maximumDiscount: undefined,
      usageLimit: undefined,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
    setEditingCoupon(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minimumAmount: coupon.minimumAmount || undefined,
      maximumDiscount: coupon.maximumDiscount || undefined,
      usageLimit: coupon.usageLimit || undefined,
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
    })
    setEditingCoupon(coupon)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.code.trim()) {
      showToast.error('Coupon code is required')
      return
    }

    if (formData.value <= 0) {
      showToast.error('Coupon value must be greater than 0')
      return
    }

    if (formData.type === 'PERCENTAGE' && formData.value > 100) {
      showToast.error('Percentage discount cannot exceed 100%')
      return
    }

    setIsSubmitting(true)

    try {
      const url = '/api/coupons'
      const method = editingCoupon ? 'PUT' : 'POST'
      const payload = editingCoupon 
        ? { id: editingCoupon.id, ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        showToast.success(
          `Coupon ${editingCoupon ? 'updated' : 'created'} successfully!`
        )
        setIsDialogOpen(false)
        resetForm()
        fetchCoupons()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save coupon')
      }
    } catch (error: any) {
      console.error('Error saving coupon:', error)
      showToast.error(error.message || 'Failed to save coupon')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/coupons', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: couponId,
          isActive: !currentStatus,
        }),
      })

      if (response.ok) {
        showToast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
        fetchCoupons()
      } else {
        throw new Error('Failed to update coupon status')
      }
    } catch (error) {
      console.error('Error updating coupon status:', error)
      showToast.error('Failed to update coupon status')
    }
  }

  const deleteCoupon = async (couponId: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/coupons?id=${couponId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showToast.success('Coupon deleted successfully')
        fetchCoupons()
      } else {
        throw new Error('Failed to delete coupon')
      }
    } catch (error) {
      console.error('Error deleting coupon:', error)
      showToast.error('Failed to delete coupon')
    }
  }

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'PERCENTAGE':
        return 'Percentage'
      case 'FIXED_AMOUNT':
        return 'Fixed Amount'
      case 'FREE_SHIPPING':
        return 'Free Shipping'
      default:
        return type
    }
  }

  const getValueDisplay = (coupon: Coupon) => {
    switch (coupon.type) {
      case 'PERCENTAGE':
        return `${coupon.value}%`
      case 'FIXED_AMOUNT':
        return formatPrice(coupon.value)
      case 'FREE_SHIPPING':
        return 'Free Shipping'
      default:
        return coupon.value.toString()
    }
  }

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="text-gray-600">Manage discount coupons and promotional codes</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Coupon
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coupon Management</CardTitle>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search coupons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Min. Amount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium">{coupon.code}</TableCell>
                    <TableCell>{getTypeDisplay(coupon.type)}</TableCell>
                    <TableCell>{getValueDisplay(coupon)}</TableCell>
                    <TableCell>
                      {coupon.minimumAmount ? formatPrice(coupon.minimumAmount) : 'No minimum'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{coupon.usedCount} / {coupon.usageLimit || '∞'}</div>
                        {coupon.usageLimit && (
                          <div className="text-gray-500">
                            {Math.round((coupon.usedCount / coupon.usageLimit) * 100)}% used
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(coupon.validFrom).toLocaleDateString()}</div>
                        <div className="text-gray-500">to {new Date(coupon.validUntil).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleCouponStatus(coupon.id, coupon.isActive)}
                          title={coupon.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {coupon.isActive ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(coupon)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCoupon(coupon.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredCoupons.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {search ? 'No coupons found matching your search.' : 'No coupons created yet.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Coupon Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SAVE20"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Discount Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                    <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type !== 'FREE_SHIPPING' && (
                <div>
                  <Label htmlFor="value">
                    {formData.type === 'PERCENTAGE' ? 'Discount Percentage *' : 'Discount Amount (৳) *'}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    placeholder={formData.type === 'PERCENTAGE' ? '20' : '100'}
                    disabled={isSubmitting}
                    required
                    min="0"
                    max={formData.type === 'PERCENTAGE' ? '100' : undefined}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="minimumAmount">Minimum Order Amount (৳)</Label>
                <Input
                  id="minimumAmount"
                  type="number"
                  value={formData.minimumAmount || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    minimumAmount: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  placeholder="500"
                  disabled={isSubmitting}
                  min="0"
                />
              </div>

              {formData.type === 'PERCENTAGE' && (
                <div>
                  <Label htmlFor="maximumDiscount">Maximum Discount Amount (৳)</Label>
                  <Input
                    id="maximumDiscount"
                    type="number"
                    value={formData.maximumDiscount || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      maximumDiscount: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    placeholder="200"
                    disabled={isSubmitting}
                    min="0"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    usageLimit: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  placeholder="100"
                  disabled={isSubmitting}
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="validFrom">Valid From *</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div>
                <Label htmlFor="validUntil">Valid Until *</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (editingCoupon ? 'Update Coupon' : 'Create Coupon')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 