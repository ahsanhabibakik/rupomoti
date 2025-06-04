import useSWR from 'swr'
import { toast } from '@/components/ui/use-toast'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useCoupons() {
  const { data, error, mutate } = useSWR('/api/coupons', fetcher)

  const createCoupon = async (couponData: any) => {
    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(couponData),
      })

      if (!response.ok) {
        throw new Error('Failed to create coupon')
      }

      const newCoupon = await response.json()
      mutate()
      toast({
        title: 'Success',
        description: 'Coupon created successfully',
      })
      return newCoupon
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create coupon',
        variant: 'destructive',
      })
      throw error
    }
  }

  const updateCoupon = async (id: string, couponData: any) => {
    try {
      const response = await fetch('/api/coupons', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...couponData }),
      })

      if (!response.ok) {
        throw new Error('Failed to update coupon')
      }

      const updatedCoupon = await response.json()
      mutate()
      toast({
        title: 'Success',
        description: 'Coupon updated successfully',
      })
      return updatedCoupon
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update coupon',
        variant: 'destructive',
      })
      throw error
    }
  }

  const deleteCoupon = async (id: string) => {
    try {
      const response = await fetch(`/api/coupons?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete coupon')
      }

      mutate()
      toast({
        title: 'Success',
        description: 'Coupon deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete coupon',
        variant: 'destructive',
      })
      throw error
    }
  }

  return {
    data,
    isLoading: !error && !data,
    error,
    createCoupon,
    updateCoupon,
    deleteCoupon,
  }
} 