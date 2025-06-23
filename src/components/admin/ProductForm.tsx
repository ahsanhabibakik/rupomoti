'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { uploadImage } from '@/lib/cloudinary'
import { useToast } from '@/components/ui/use-toast'

const productSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  description: z.string().min(1, {
    message: "Description is required",
  }),
  price: z.number().min(0),
  sku: z.string().min(1, {
    message: "SKU is required",
  }),
  categoryId: z.string(),
  mainImage: z.string(),
  images: z.array(z.string()),
  featured: z.boolean(),
  newArrival: z.boolean(),
  bestSeller: z.boolean(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'ARCHIVED']),
})

type ProductFormValues = z.infer<typeof productSchema>

export function ProductForm({ onSubmit }: { onSubmit: (data: ProductFormValues) => void }) {
  const [isUploading, setIsUploading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [previewMainImage, setPreviewMainImage] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      sku: '',
      categoryId: '',
      mainImage: '',
      images: [],
      featured: false,
      newArrival: false,
      bestSeller: false,
      status: 'ACTIVE',
    },
  })

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true)
      const result = await uploadImage(file)
      return result.url
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newImages = Array.from(files)
    setImages(prev => [...prev, ...newImages])

    // Create preview URLs
    const previews = newImages.map(file =>
      URL.createObjectURL(file)
    )
    setPreviewImages(prev => [...prev, ...previews])
  }

  const handleMainImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setMainImage(file)
    setPreviewMainImage(URL.createObjectURL(file))
  }

  const handleSubmit = async (data: ProductFormValues) => {
    try {
      // Upload main image
      if (mainImage) {
        const mainImageUrl = await handleImageUpload(mainImage)
        if (mainImageUrl) {
          data.mainImage = mainImageUrl
        }
      }

      // Upload additional images
      if (images.length > 0) {
        const imageUrls = await Promise.all(
          images.map(img => handleImageUpload(img))
        )
        data.images = imageUrls.filter((url): url is string => url !== null)
      }

      await onSubmit(data)
      toast({
        title: 'Success',
        description: 'Product created successfully',
      })
    } catch (error) {
      console.error('Submit error:', error)
      toast({
        title: 'Error',
        description: 'Failed to create product',
        variant: 'destructive',
      })
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...form.register('name')}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...form.register('description')}
          />
          {form.formState.errors.description && (
            <p className="text-sm text-destructive">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...form.register('price')}
          />
          {form.formState.errors.price && (
            <p className="text-sm text-destructive">
              {form.formState.errors.price.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            {...form.register('sku')}
          />
          {form.formState.errors.sku && (
            <p className="text-sm text-destructive">
              {form.formState.errors.sku.message}
            </p>
          )}
        </div>

        <div>
          <Label>Category</Label>
          <Select {...form.register('categoryId')}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {/* Add your category options here */}
              <SelectItem value="">Select category</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Main Image</Label>
          <input
            type="file"
            accept="image/*"
            onChange={handleMainImageChange}
            className="hidden"
            id="mainImage"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('mainImage')?.click()}
          >
            {previewMainImage ? (
              <>
                <span className="mr-2">Change main image</span>
                <img
                  src={previewMainImage}
                  alt="Preview"
                  className="h-8 w-8 rounded"
                />
              </>
            ) : (
              'Upload main image'
            )}
          </Button>
        </div>

        <div>
          <Label>Additional Images</Label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
            id="additionalImages"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('additionalImages')?.click()}
          >
            Upload additional images
          </Button>
          {previewImages.length > 0 && (
            <div className="mt-2 grid grid-cols-4 gap-2">
              {previewImages.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Preview ${index}`}
                  className="h-16 w-16 rounded"
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              {...form.register('featured')}
            />
            <Label htmlFor="featured">Featured</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="newArrival"
              {...form.register('newArrival')}
            />
            <Label htmlFor="newArrival">New Arrival</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="bestSeller"
              {...form.register('bestSeller')}
            />
            <Label htmlFor="bestSeller">Best Seller</Label>
          </div>
        </div>

        <div>
          <Label>Status</Label>
          <Select {...form.register('status')}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={isUploading}>
        {isUploading && (
          <>
            <span className="mr-2">Uploading...</span>
          </>
        )}
        Create Product
      </Button>
    </form>
  )
}
