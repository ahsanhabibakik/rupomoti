'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { showToast } from '@/lib/toast'
import { Loader2 } from 'lucide-react'

interface Category {
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

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
  categories?: Category[]
  onSuccess?: () => void
}

interface FormData {
  name: string
  slug: string
  description: string
  image: string
  parentId: string
  isActive: boolean
  sortOrder: number
  metaTitle: string
  metaDescription: string
}

interface FormErrors {
  name?: string
  slug?: string
  description?: string
  parentId?: string
  sortOrder?: string
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  categories = [],
  onSuccess
}: CategoryDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    image: '',
    parentId: '',
    isActive: true,
    sortOrder: 0,
    metaTitle: '',
    metaDescription: ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!category

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Load category data when editing
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        image: category.image || '',
        parentId: category.parentId || '',
        isActive: category.isActive ?? true,
        sortOrder: category.sortOrder || 0,
        metaTitle: category.metaTitle || '',
        metaDescription: category.metaDescription || ''
      })
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        image: '',
        parentId: '',
        isActive: true,
        sortOrder: 0,
        metaTitle: '',
        metaDescription: ''
      })
    }
    setErrors({})
  }, [category, open])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Category slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
    }

    if (formData.parentId === category?.id) {
      newErrors.parentId = 'Category cannot be its own parent'
    }

    if (formData.sortOrder < 0) {
      newErrors.sortOrder = 'Sort order must be a positive number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-generate slug when name changes (only for new categories)
    if (field === 'name' && !isEditing && typeof value === 'string') {
      const newSlug = generateSlug(value)
      setFormData(prev => ({
        ...prev,
        slug: newSlug
      }))
    }

    // Clear errors when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const url = '/api/categories'
      const method = isEditing ? 'PUT' : 'POST'
      
      const payload = isEditing 
        ? { id: category?.id, ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${isEditing ? 'update' : 'create'} category`)
      }

      showToast.success(
        `Category ${isEditing ? 'updated' : 'created'} successfully!`
      )

      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} category:`, error)
      showToast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} category`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter out current category and its children from parent options
  const getParentOptions = () => {
    if (!isEditing) return categories

    const filterDescendants = (cats: Category[], excludeId: string): Category[] => {
      return cats.filter(cat => {
        if (cat.id === excludeId) return false
        if (cat.parentId === excludeId) return false
        return true
      })
    }

    return filterDescendants(categories, category?.id || '')
  }

  const parentOptions = getParentOptions()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the category information below.'
              : 'Fill in the details to create a new category.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Category Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                  placeholder="Enter category name"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="slug" className="text-sm font-medium">
                  URL Slug *
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className={errors.slug ? 'border-red-500' : ''}
                  placeholder="category-url-slug"
                  disabled={isSubmitting}
                />
                {errors.slug && (
                  <p className="text-sm text-red-500 mt-1">{errors.slug}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Used in URLs. Only lowercase letters, numbers, and hyphens allowed.
                </p>
              </div>

              <div>
                <Label htmlFor="parentId" className="text-sm font-medium">
                  Parent Category
                </Label>
                <Select
                  value={formData.parentId || 'no-parent'}
                  onValueChange={(value) => handleInputChange('parentId', value === 'no-parent' ? '' : value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={errors.parentId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select parent category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-parent">No Parent (Top Level)</SelectItem>
                    {parentOptions
                      .filter(cat => !cat.parentId) // Only show top-level categories as parents
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.parentId && (
                  <p className="text-sm text-red-500 mt-1">{errors.parentId}</p>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="image" className="text-sm font-medium">
                  Category Image URL
                </Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="sortOrder" className="text-sm font-medium">
                  Sort Order
                </Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min="0"
                  value={formData.sortOrder}
                  onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                  className={errors.sortOrder ? 'border-red-500' : ''}
                  placeholder="0"
                  disabled={isSubmitting}
                />
                {errors.sortOrder && (
                  <p className="text-sm text-red-500 mt-1">{errors.sortOrder}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="isActive" className="text-sm font-medium">
                  Active
                </Label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the category"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* SEO Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="metaTitle" className="text-sm font-medium">
                Meta Title (SEO)
              </Label>
              <Input
                id="metaTitle"
                value={formData.metaTitle}
                onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                placeholder="SEO title for search engines"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="metaDescription" className="text-sm font-medium">
                Meta Description (SEO)
              </Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                placeholder="SEO description for search engines"
                rows={2}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Category' : 'Create Category'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 