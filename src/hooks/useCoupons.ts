import useSWR from 'swr'
import { showToast } from '@/lib/toast'

const fetcher = async (url: string) => {
  const res = await fetch(url)

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    // Attach extra info to the error object.
    error.info = await res.json()
    error.status = res.status
    throw error
  }

  return res.json()
}

export function useCoupons(searchParams?: string) {
  const apiUrl = `/api/coupons${searchParams ? `?${searchParams}` : ''}`
  const { data, error, mutate, isLoading } = useSWR(apiUrl, fetcher)

  const createCoupon = async (couponData: any) => {
    return showToast.promise(
      fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponData),
      }).then(async (res) => {
        if (!res.ok) {
          const errorBody = await res.json().catch(() => ({ error: 'An unknown error occurred' }));
          const errorMessage = errorBody.error ? (Array.isArray(errorBody.error) ? errorBody.error.map(e => e.message).join(', ') : errorBody.error) : 'Failed to create coupon';
          const error = new Error(errorMessage);
          error.info = errorBody;
          throw error;
        }
        mutate() // Re-fetch data after creation
        return res.json()
      }),
      {
        loading: 'Creating coupon...',
        success: 'Coupon created successfully!',
        error: (err) => err.message || 'Failed to create coupon',
      }
    )
  }

  const updateCoupon = async (id: string, couponData: any) => {
    return showToast.promise(
      fetch('/api/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...couponData }),
      }).then(async (res) => {
        if (!res.ok) {
          const errorBody = await res.json().catch(() => ({ error: 'An unknown error occurred' }));
          const errorMessage = errorBody.error ? (Array.isArray(errorBody.error) ? errorBody.error.map(e => e.message).join(', ') : errorBody.error) : 'Failed to update coupon';
          const error = new Error(errorMessage);
          error.info = errorBody;
          throw error;
        }
        mutate() // Re-fetch data after update
        return res.json()
      }),
      {
        loading: 'Updating coupon...',
        success: 'Coupon updated successfully!',
        error: (err) => err.message || 'Failed to update coupon',
      }
    )
  }

  const deleteCoupon = async (id: string) => {
    return showToast.promise(
      fetch(`/api/coupons?id=${id}`, {
        method: 'DELETE',
      }).then(async (res) => {
        if (!res.ok) {
          const errorBody = await res.json().catch(() => ({ error: 'An unknown error occurred' }));
          const errorMessage = errorBody.error || 'Failed to delete coupon';
          const error = new Error(errorMessage);
          error.info = errorBody;
          throw error;
        }
        mutate() // Re-fetch data after deletion
      }),
      {
        loading: 'Deleting coupon...',
        success: 'Coupon deleted successfully!',
        error: (err) => err.message || 'Failed to delete coupon',
      }
    )
  }

  return {
    coupons: data,
    isLoading,
    error,
    mutate,
    createCoupon,
    updateCoupon,
    deleteCoupon,
  }
} 