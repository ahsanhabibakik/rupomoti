'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { useCategories } from '@/hooks/useCategories'
import { showToast } from '@/lib/toast'
import { Switch } from '@/components/ui/switch'
import { generateSKU } from '@/lib/utils/sku'
import { RefreshCw, Info } from 'lucide-react'
import { CategoryCombobox } from './CategoryCombobox'
import { CategoryDialog } from './CategoryDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const landingPageDataSchema = z.object({
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  features: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  testimonials: z.array(z.object({
    name: z.string(),
    comment: z.string(),
    rating: z.number().min(1).max(5)
  })).optional(),
  additionalImages: z.array(z.string()).optional(),
  callToAction: z.string().optional(),
  guarantee: z.string().optional(),
  specifications: z.record(z.string()).optional(),
}).optional()

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().positive('Price must be positive'),
  salePrice: z.coerce.number().positive('Sale price must be positive').optional().nullable(),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  sku: z.string().min(1, 'SKU is required'),
  categoryId: z.string().min(1, 'Category is required'),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  designType: z.enum(['REGULAR', 'LANDING_PAGE']).default('REGULAR'),
  landingPageData: landingPageDataSchema,
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: {
    id?: string
    name?: string
    slug?: string
    description?: string
    price?: number
    salePrice?: number | null
    stock?: number
    sku?: string
    categoryId?: string
    isFeatured?: boolean
    isNewArrival?: boolean
    isPopular?: boolean
    designType?: 'REGULAR' | 'LANDING_PAGE'
    landingPageData?: {
      heroTitle?: string
      heroSubtitle?: string
      callToAction?: string
      guarantee?: string
      features?: string[]
      benefits?: string[]
      testimonials?: Array<{
        name: string
        comment: string
        rating: number
      }>
    }
    images?: string[]
  }
}

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [initialImages, setInitialImages] = useState<string[]>(product?.images || [])
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [newCategoryId, setNewCategoryId] = useState<string | null>(null)
  const { categories, isLoading: categoriesLoading } = useCategories({ pageSize: 1000 })

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      salePrice: undefined,
      stock: 0,
      sku: '',
      categoryId: '',
      isFeatured: false,
      isNewArrival: false,
      isPopular: false,
      designType: 'REGULAR' as const,
      landingPageData: undefined,
    },
  })

  const {
    formState: { isDirty },
  } = form

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      // Ensure null values are converted to appropriate defaults
      const sanitizedProduct = {
        name: product.name || '',
        description: product.description || '',
        sku: product.sku || '',
        categoryId: product.categoryId || '',
        price: product.price || 0,
        salePrice: product.salePrice || undefined,
        stock: product.stock || 0,
        isFeatured: product.isFeatured || false,
        isNewArrival: product.isNewArrival || false,
        isPopular: product.isPopular || false,
        designType: product.designType || 'REGULAR' as const,
        landingPageData: product.landingPageData || undefined,
      }
      form.reset(sanitizedProduct)
      setImages(product.images || [])
      setInitialImages(product.images || [])
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        salePrice: undefined,
        stock: 0,
        sku: '',
        categoryId: '',
        isFeatured: false,
        isNewArrival: false,
        isPopular: false,
        designType: 'REGULAR' as const,
        landingPageData: undefined,
      })
      setImages([])
      setInitialImages([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, open]) // Only reset when product ID changes or dialog opens

  // Auto-generate SKU from name
  const productName = form.watch('name')
  useEffect(() => {
    if (productName && !form.getValues('sku')) {
      form.setValue('sku', generateSKU(productName))
    }
  }, [productName, form])

  useEffect(() => {
    if (newCategoryId) {
      form.setValue('categoryId', newCategoryId)
      setNewCategoryId(null)
    }
  }, [newCategoryId, form])

  const handleGenerateSku = () => {
    const productName = form.getValues('name')
    if (productName) {
      form.setValue('sku', generateSKU(productName))
    } else {
      showToast.error('Please enter a product name first')
    }
  }

  const price = form.watch('price')
  const salePrice = form.watch('salePrice')
  const discount = price && salePrice ? Math.round(((price - salePrice) / price) * 100) : 0

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (images.length === 0) {
        showToast.error('Please upload at least one image')
        return
      }

      const method = product ? 'PUT' : 'POST'
      const url = '/api/admin/products'
      const body = product ? { ...data, images, id: product.id } : { ...data, images }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const result = await response.json()
      if (!response.ok) {
        showToast.error(result.error || `Failed to ${product ? 'update' : 'create'} product`)
        return
      }
      showToast.success(`Product ${product ? 'updated' : 'created'} successfully`)
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting product:', error)
      showToast.error('Something went wrong')
    }
  }

  const imagesChanged = JSON.stringify(images) !== JSON.stringify(initialImages)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value == null ? '' : field.value} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value == null ? '' : field.value} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value == null ? '' : field.value} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Price (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value == null ? '' : field.value} 
                      />
                    </FormControl>
                    {discount > 0 && (
                      <FormMessage>{discount}% discount</FormMessage>
                    )}
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value == null ? '' : field.value} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input {...field} value={field.value == null ? '' : field.value} />
                      </FormControl>
                      <Button type="button" variant="outline" onClick={handleGenerateSku}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Category</FormLabel>
                  <div className="flex items-center gap-2">
                    <CategoryCombobox
                      categories={categories || []}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={categoriesLoading}
                    />
                    <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(true)}>
                      Add Category
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CategoryDialog
              open={categoryDialogOpen}
              onOpenChange={setCategoryDialogOpen}
            />

            <FormField
              control={form.control}
              name="designType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Design Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select design type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="REGULAR">Regular Product Page</SelectItem>
                      <SelectItem value="LANDING_PAGE">Landing Page Design</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('designType') === 'LANDING_PAGE' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Landing Page Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="landingPageData.heroTitle"
                      render={({ field }) => (                      <FormItem>
                        <FormLabel>Hero Title (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} placeholder="Custom hero title for landing page" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="landingPageData.heroSubtitle"
                      render={({ field }) => (                      <FormItem>
                        <FormLabel>Hero Subtitle (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ''} placeholder="Compelling subtitle for the landing page" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="landingPageData.callToAction"
                      render={({ field }) => (                      <FormItem>
                        <FormLabel>Call to Action Text (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} placeholder="e.g., 'Buy Now and Save 20%'" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="landingPageData.guarantee"
                      render={({ field }) => (                      <FormItem>
                        <FormLabel>Guarantee/Promise (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ''} placeholder="e.g., '30-day money-back guarantee'" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      )}
                    />
                    
                    {product?.id && (
                      <div className="pt-4 border-t space-y-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => window.open(`/admin/products/${product.id}/landing-page-builder`, '_blank')}
                          className="w-full"
                        >
                          <Info className="w-4 h-4 mr-2" />
                          Open Advanced Landing Page Builder
                        </Button>
                        
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => window.open(`/product/${product.slug || 'preview'}`, '_blank')}
                          className="w-full"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Preview Product Page
                        </Button>
                        
                        <p className="text-xs text-muted-foreground text-center">
                          Use the builder for custom sections and drag & drop, or preview to see the final result
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <FormLabel>Featured</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isNewArrival"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <FormLabel>New Arrival</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isPopular"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <FormLabel>Popular</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Images</FormLabel>
              <ImageUpload
                value={images}
                onChange={setImages}
                maxFiles={5}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={product ? false : !isDirty && !imagesChanged}>
                {product ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 