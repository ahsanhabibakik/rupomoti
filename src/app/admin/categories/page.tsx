'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { useCategories } from '@/hooks/useCategories'
import { CategoryDialog } from '@/components/admin/CategoryDialog'

function CategoryActions({ category }: { category: any }) {
  const { deleteCategory } = useCategories()

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await deleteCategory(category.id)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        Edit
      </Button>
      <Button variant="destructive" size="sm" onClick={handleDelete}>
        Delete
      </Button>
    </div>
  )
}

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: '_count.products',
    header: 'Products',
  },
  {
    id: 'actions',
    cell: ({ row }) => <CategoryActions category={row.original} />,
  },
]

export default function CategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { data: categories, isLoading, error } = useCategories()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Error loading categories</p>
      </div>
    )
  }

  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredCategories || []}
      />

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  )
} 