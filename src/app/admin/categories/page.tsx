'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import Image from 'next/image'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { useCategories, Category } from '@/hooks/useCategories'
import { CategoryDialog } from '@/components/admin/CategoryDialog'

function CategoryActions({
  category,
  onEdit,
}: {
  category: Category
  onEdit: () => void
}) {
  const { deleteCategory } = useCategories()

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await deleteCategory(category.id)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onEdit}>
        Edit
      </Button>
      <Button variant="destructive" size="sm" onClick={handleDelete}>
        Delete
      </Button>
    </div>
  )
}

export default function CategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [search, setSearch] = useState('')
  const { data: categories, isLoading, error } = useCategories()

  const handleOpenDialog = (category: Category | null) => {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'image',
      header: 'Image',
      cell: ({ row }) => {
        const imageUrl = row.original.image
        return imageUrl ? (
          <a href={imageUrl} target="_blank" rel="noopener noreferrer">
            <Image
              src={imageUrl}
              alt={row.original.name ?? ''}
              width={40}
              height={40}
              className="rounded object-cover"
            />
          </a>
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
            No img
          </div>
        )
      },
    },
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
      cell: ({ row }) => (
        <CategoryActions
          category={row.original}
          onEdit={() => handleOpenDialog(row.original)}
        />
      ),
    },
  ]

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
        <Button onClick={() => handleOpenDialog(null)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <DataTable columns={columns} data={filteredCategories || []} />

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={open => {
          if (!open) {
            setEditingCategory(null)
          }
          setIsDialogOpen(open)
        }}
        category={editingCategory}
        categories={categories}
      />
    </div>
  )
} 