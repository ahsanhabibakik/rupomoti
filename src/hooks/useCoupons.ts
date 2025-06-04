import useSWR from 'swr'
import { showToast } from '@/lib/toast'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useCoupons() {
  const { data, error, mutate } = useSWR('/api/coupons', fetcher)

  const createCoupon = async (couponData: any) => {
    return showToast.promise(
      fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponData),
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to create coupon')
        mutate()
        return res.json()
      }),
      {
        loading: 'Creating coupon...',
        success: 'Coupon created successfully',
        error: 'Failed to create coupon',
      }
    )
  }

  const updateCoupon = async (id: string, couponData: any) => {
    return showToast.promise(
      fetch(`/api/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponData),
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to update coupon')
        mutate()
        return res.json()
      }),
      {
        loading: 'Updating coupon...',
        success: 'Coupon updated successfully',
        error: 'Failed to update coupon',
      }
    )
  }

  const deleteCoupon = async (id: string) => {
    return showToast.promise(
      fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to delete coupon')
        mutate()
      }),
      {
        loading: 'Deleting coupon...',
        success: 'Coupon deleted successfully',
        error: 'Failed to delete coupon',
      }
    )
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