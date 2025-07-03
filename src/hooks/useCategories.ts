import useSWR from 'swr'
import { showToast } from '@/lib/toast'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  parent?: Category
  children?: Category[]
  isActive: boolean
  sortOrder: number
  metaTitle?: string
  metaDescription?: string
  _count?: {
    products: number
  }
}

interface CategoriesResponse {
  categories: Category[];
  totalCount: number;
  totalPages: number;
}

export function useCategories({ page = 1, pageSize = 10, search = '' } = {}) {
  const searchParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    search,
  });

  const { data, error, mutate } = useSWR<CategoriesResponse>(`/api/categories?${searchParams}`, fetcher)

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
          const error = await res.json().catch(() => ({ error: 'Failed to delete category' }))
          throw new Error(error.error || 'Failed to delete category')
        }
        const result = await res.json()
        mutate() // Refresh the categories list
        return result
      }),
      {
        loading: 'Deleting category...',
        success: 'Category deleted successfully',
        error: 'Failed to delete category',
      }
    )
  }

  return {
    categories: data?.categories,
    totalCount: data?.totalCount,
    totalPages: data?.totalPages,
    isLoading: !error && !data,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  }
} 