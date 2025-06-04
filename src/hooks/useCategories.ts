import { useState } from 'react'
import { showToast } from '@/lib/toast'

interface Category {
  id: string
  name: string
  description?: string
  image?: string
  slug: string
  parentId?: string
}

export function useCategories() {
  const [data, setData] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = async () => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/categories')
      const data = await response.json()
      setData(data)
    } catch (error) {
      showToast.error('Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (category: Omit<Category, 'id'>) => {
    return showToast.promise(
      // TODO: Replace with actual API call
      fetch('/api/categories', {
        method: 'POST',
        body: JSON.stringify(category),
      }).then(() => fetchCategories()),
      {
        loading: 'Creating category...',
        success: 'Category created successfully',
        error: 'Failed to create category',
      }
    )
  }

  const updateCategory = async (id: string, category: Partial<Category>) => {
    return showToast.promise(
      // TODO: Replace with actual API call
      fetch(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(category),
      }).then(() => fetchCategories()),
      {
        loading: 'Updating category...',
        success: 'Category updated successfully',
        error: 'Failed to update category',
      }
    )
  }

  const deleteCategory = async (id: string) => {
    return showToast.promise(
      // TODO: Replace with actual API call
      fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      }).then(() => fetchCategories()),
      {
        loading: 'Deleting category...',
        success: 'Category deleted successfully',
        error: 'Failed to delete category',
      }
    )
  }

  return {
    data,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
} 