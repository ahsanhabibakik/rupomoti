'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCoupons } from '@/hooks/useCoupons'

const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters'),
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(0),
  minimumAmount: z.coerce.number().min(0).optional(),
  maximumDiscount: z.coerce.number().min(0).optional(),
  validFrom: z.string(),
  validUntil: z.string(),
  usageLimit: z.coerce.number().min(0).optional(),
})

type CouponFormValues = z.infer<typeof couponSchema>

interface CouponDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coupon?: any
  onClose: () => void
}

export function CouponDialog({ open, onOpenChange, coupon, onClose }: CouponDialogProps) {
  const { createCoupon, updateCoupon } = useCoupons()

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      type: 'percentage',
      value: 0,
      minimumAmount: '' as any,
      maximumDiscount: '' as any,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usageLimit: '' as any,
    },
  })

  useEffect(() => {
    if (coupon) {
      form.reset({
        ...coupon,
        minimumAmount: coupon.minimumAmount ?? '',
        maximumDiscount: coupon.maximumDiscount ?? '',
        usageLimit: coupon.usageLimit ?? '',
        validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
        validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
      })
    } else {
      form.reset({
        code: '',
        type: 'percentage',
        value: 0,
        minimumAmount: '' as any,
        maximumDiscount: '' as any,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        usageLimit: '' as any,
      })
    }
  }, [coupon, form])

  const onSubmit = async (data: CouponFormValues) => {
    try {
      if (coupon) {
        await updateCoupon(coupon.id, data)
      } else {
        await createCoupon(data)
      }
      onOpenChange(false)
      onClose()
    } catch (error) {
      console.error('Error submitting coupon:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{coupon ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle>
          <DialogDescription>
            {coupon ? 'Update the details of this coupon.' : 'Create a new coupon to offer discounts to your customers.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="WELCOME10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minimumAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Spend (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maximumDiscount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Discount (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid From</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Until</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="usageLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usage Limit (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false)
                  onClose()
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {coupon ? 'Update Coupon' : 'Create Coupon'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 