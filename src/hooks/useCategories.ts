import useSWR from 'swr'
import { toast } from '@/components/ui/use-toast'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useCategories() {
  const { data, error, mutate } = useSWR('/api/categories', fetcher)

  const createCategory = async (categoryData: any) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      })

      if (!response.ok) {
        throw new Error('Failed to create category')
      }

      const newCategory = await response.json()
      mutate()
      toast({
        title: 'Success',
        description: 'Category created successfully',
      })
      return newCategory
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create category',
        variant: 'destructive',
      })
      throw error
    }
  }

  const updateCategory = async (id: string, categoryData: any) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...categoryData }),
      })

      if (!response.ok) {
        throw new Error('Failed to update category')
      }

      const updatedCategory = await response.json()
      mutate()
      toast({
        title: 'Success',
        description: 'Category updated successfully',
      })
      return updatedCategory
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update category',
        variant: 'destructive',
      })
      throw error
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete category')
      }

      mutate()
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      })
      throw error
    }
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