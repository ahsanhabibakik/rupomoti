import useSWR from 'swr'
import { toast } from '@/components/ui/use-toast'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useProducts() {
  const { data, error, mutate } = useSWR('/api/products', fetcher)

  const createProduct = async (productData: any) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error('Failed to create product')
      }

      const newProduct = await response.json()
      mutate()
      toast({
        title: 'Success',
        description: 'Product created successfully',
      })
      return newProduct
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create product',
        variant: 'destructive',
      })
      throw error
    }
  }

  const updateProduct = async (id: string, productData: any) => {
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...productData }),
      })

      if (!response.ok) {
        throw new Error('Failed to update product')
      }

      const updatedProduct = await response.json()
      mutate()
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      })
      return updatedProduct
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      })
      throw error
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      mutate()
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      })
      throw error
    }
  }

  return {
    data,
    isLoading: !error && !data,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
  }
} 