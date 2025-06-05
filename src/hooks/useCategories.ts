import useSWR from 'swr'
import { showToast } from '@/lib/toast'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  slug: string
  _count?: {
    products: number
  }
}

export function useCategories() {
  const { data, error, mutate } = useSWR<Category[]>('/api/categories', fetcher)

  const createCategory = async (categoryData: Omit<Category, 'id' | 'slug'>) => {
    return showToast.promise(
      fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      }).then(async (res) => {
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.message || 'Failed to create category')
        }
        mutate() // Refresh the categories list
        return res.json()
      }),
      {
        loading: 'Creating category...',
        success: 'Category created successfully',
        error: 'Failed to create category',
      }
    )
  }

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    return showToast.promise(
      fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...categoryData }),
      }).then(async (res) => {
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.message || 'Failed to update category')
        }
        mutate() // Refresh the categories list
        return res.json()
      }),
      {
        loading: 'Updating category...',
        success: 'Category updated successfully',
        error: 'Failed to update category',
      }
    )
  }

  const deleteCategory = async (id: string) => {
    return showToast.promise(
      fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      }).then(async (res) => {
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.message || 'Failed to delete category')
        }
        mutate() // Refresh the categories list
      }),
      {
        loading: 'Deleting category...',
        success: 'Category deleted successfully',
        error: 'Failed to delete category',
      }
    )
  }

  return {
    data,
    isLoading: !error && !data,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  }
} 