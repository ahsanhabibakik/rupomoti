import useSWR from 'swr'
import { toast } from '@/components/ui/use-toast'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useOrders() {
  const { data, error, mutate } = useSWR('/api/orders', fetcher)

  const updateOrder = async (id: string, orderData: any) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...orderData }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order')
      }

      const updatedOrder = await response.json()
      mutate()
      toast({
        title: 'Success',
        description: 'Order updated successfully',
      })
      return updatedOrder
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order',
        variant: 'destructive',
      })
      throw error
    }
  }

  const deleteOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/orders?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete order')
      }

      mutate()
      toast({
        title: 'Success',
        description: 'Order deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete order',
        variant: 'destructive',
      })
      throw error
    }
  }

  return {
    data,
    isLoading: !error && !data,
    error,
    updateOrder,
    deleteOrder,
  }
} 