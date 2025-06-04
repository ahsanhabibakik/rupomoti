import useSWR from 'swr'
import { showToast } from '@/lib/toast'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useOrders() {
  const { data, error, mutate } = useSWR('/api/orders', fetcher)

  const updateOrderStatus = async (id: string, status: string) => {
    return showToast.promise(
      fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to update order status')
        mutate()
        return res.json()
      }),
      {
        loading: 'Updating order status...',
        success: 'Order status updated successfully',
        error: 'Failed to update order status',
      }
    )
  }

  const deleteOrder = async (id: string) => {
    return showToast.promise(
      fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to delete order')
        mutate()
      }),
      {
        loading: 'Deleting order...',
        success: 'Order deleted successfully',
        error: 'Failed to delete order',
      }
    )
  }

  return {
    data,
    isLoading: !error && !data,
    error,
    updateOrderStatus,
    deleteOrder,
  }
} 