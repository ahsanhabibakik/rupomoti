import useSWR from 'swr'
import { showToast } from '@/lib/toast'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useProducts() {
  const { data, error, mutate } = useSWR('/api/products', fetcher)

  const createProduct = async (productData: any) => {
    return showToast.promise(
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to create product')
        mutate()
        return res.json()
      }),
      {
        loading: 'Creating product...',
        success: 'Product created successfully',
        error: 'Failed to create product',
      }
    )
  }

  const updateProduct = async (id: string, productData: any) => {
    return showToast.promise(
      fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to update product')
        mutate()
        return res.json()
      }),
      {
        loading: 'Updating product...',
        success: 'Product updated successfully',
        error: 'Failed to update product',
      }
    )
  }

  const deleteProduct = async (id: string) => {
    return showToast.promise(
      fetch(`/api/products/${id}`, {
        method: 'DELETE',
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to delete product')
        mutate()
      }),
      {
        loading: 'Deleting product...',
        success: 'Product deleted successfully',
        error: 'Failed to delete product',
      }
    )
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