'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { useCategories } from '@/hooks/useCategories'
import { showToast } from '@/lib/toast'
import { Switch } from '@/components/ui/switch'
import { generateSKU } from '@/lib/utils/sku'
import { RefreshCw, Info, GripVertical, X, Star, Settings, ImageIcon } from 'lucide-react'
import { CategoryCombobox } from './CategoryCombobox'
import { CategoryDialog } from './CategoryDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import { LandingPageQuickSetup } from './LandingPageQuickSetup'

interface ProductVariant {
  id?: string
  size?: string
  color?: string
  weight?: string
  material?: string
  price?: number | null
  stock: number
  sku?: string
  image?: string
  isDefault: boolean
  isActive: boolean
}

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
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [showVariants, setShowVariants] = useState(false)
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
      
      // Load variants if product has them
      if (product.id) {
        loadVariants(product.id)
      }
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
      setVariants([])
      setShowVariants(false)
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
      const body = product ? { ...data, images, variants, id: product.id } : { ...data, images, variants }

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

  // Handle image reordering
  const handleImageReorder = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(images)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setImages(items)
    showToast.success('Image order updated')
  }

  // Set image as main (move to first position)
  const setAsMainImage = (index: number) => {
    const newImages = [...images]
    const [mainImage] = newImages.splice(index, 1)
    newImages.unshift(mainImage)
    setImages(newImages)
    showToast.success('Main image updated')
  }

  // Remove image
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    showToast.success('Image removed')
  }

  const imagesChanged = JSON.stringify(images) !== JSON.stringify(initialImages)

  // Variant management functions
  const addVariant = () => {
    setVariants(prev => [...prev, {
      size: '',
      color: '',
      weight: '',
      material: '',
      price: null,
      stock: 0,
      sku: '',
      image: '',
      isDefault: prev.length === 0,
      isActive: true
    }])
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number | boolean | null) => {
    setVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    ))
  }

  const removeVariant = (index: number) => {
    setVariants(prev => {
      const updated = prev.filter((_, i) => i !== index)
      // If we removed the default variant, make the first one default
      if (prev[index].isDefault && updated.length > 0) {
        updated[0].isDefault = true
      }
      return updated
    })
  }

  // Load variants for existing product
  const loadVariants = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/variants`)
      if (response.ok) {
        const data = await response.json()
        setVariants(data.variants || [])
        setShowVariants(data.variants?.length > 0)
      }
    } catch (error) {
      console.error('Error loading variants:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Page Type Toggle - First thing users see */}
            <Card className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-orange-800 text-lg">
                  <Settings className="h-6 w-6" />
                  Choose Page Design Type
                </CardTitle>
                <p className="text-sm text-orange-700 mt-1">
                  Select how your product page should look and function
                </p>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="designType"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-2 gap-3">
                        <div 
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            field.value === 'REGULAR' 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          onClick={() => field.onChange('REGULAR')}
                        >
                          <div className="text-center">
                            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                              📄
                            </div>
                            <h3 className="font-semibold text-sm">Regular Page</h3>
                            <p className="text-xs text-gray-600 mt-1">Standard product page layout</p>
                          </div>
                        </div>
                        
                        <div 
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            field.value === 'LANDING_PAGE' 
                              ? 'border-orange-500 bg-orange-50 shadow-md' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          onClick={() => field.onChange('LANDING_PAGE')}
                        >
                          <div className="text-center">
                            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-orange-100 flex items-center justify-center">
                              🎨
                            </div>
                            <h3 className="font-semibold text-sm">Landing Page</h3>
                            <p className="text-xs text-gray-600 mt-1">Custom conversion-focused design</p>
                            <div className="mt-2 space-y-1">
                              <div className="text-xs text-green-600 flex items-center gap-1">
                                ✓ Higher conversions
                              </div>
                              <div className="text-xs text-green-600 flex items-center gap-1">
                                ✓ Rich product information
                              </div>
                              <div className="text-xs text-green-600 flex items-center gap-1">
                                ✓ Featured prominently
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Landing Page Quick Setup */}
                {form.watch('designType') === 'LANDING_PAGE' && (
                  <div className="mt-4">
                    <LandingPageQuickSetup
                      productName={form.watch('name') || 'Product'}
                      initialData={form.watch('landingPageData')}
                      onSave={async (data) => {
                        form.setValue('landingPageData', data)
                        showToast.success('Landing page data updated!')
                      }}
                      onPreview={(data) => {
                        form.setValue('landingPageData', data)
                        showToast.info('Preview updated!')
                      }}
                    />
                    
                    {/* Advanced Builder */}
                    {product?.slug && (
                      <div className="mt-4 p-3 bg-orange-100 rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-orange-800">Advanced Landing Page Builder</h4>
                            <p className="text-sm text-orange-600">Create stunning landing pages with drag & drop</p>
                          </div>
                          <Button 
                            type="button"
                            onClick={() => {
                              window.open(`/admin/products/${product.id}/landing-page-builder`, '_blank')
                            }}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Open Builder
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

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

            {form.watch('designType') === 'LANDING_PAGE' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Quick Landing Page Settings
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

            {/* Enhanced Image Management */}
            <Card className="border-2 border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  📸 Product Images
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {images.length}/5 photos
                  </Badge>
                </CardTitle>
                <p className="text-sm text-blue-700 mt-1">
                  Add up to 5 high-quality product photos. The first image will be your main product image.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Upload */}
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50/50">
                  <ImageUpload
                    value={images}
                    onChange={setImages}
                    maxFiles={5}
                  />
                  <p className="text-xs text-blue-600 mt-2 text-center">
                    💡 Tip: Use square images (1200x1200px) for best results
                  </p>
                </div>
                
                {/* Drag & Drop Image Reordering */}
                {images.length > 1 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <GripVertical className="w-4 h-4 text-gray-500" />
                      <p className="text-sm font-medium text-gray-700">
                        Drag to reorder • <span className="text-orange-600">First image = Main product image</span>
                      </p>
                    </div>
                    <DragDropContext onDragEnd={handleImageReorder}>
                      <Droppable droppableId="images" direction="horizontal">
                        {(provided) => (
                          <div 
                            {...provided.droppableProps} 
                            ref={provided.innerRef}
                            className="flex gap-3 overflow-x-auto p-3 bg-gray-50 rounded-lg border"
                          >
                            {images.map((imageUrl, index) => (
                              <Draggable key={imageUrl} draggableId={imageUrl} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`relative group min-w-[120px] ${
                                      snapshot.isDragging ? 'rotate-2 shadow-xl z-10' : ''
                                    }`}
                                  >
                                    <div className="relative">
                                      {/* Main Image Badge */}
                                      {index === 0 && (
                                        <Badge className="absolute -top-2 -left-2 z-20 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                                          <Star className="w-3 h-3 mr-1" />
                                          MAIN
                                        </Badge>
                                      )}
                                      
                                      {/* Image */}
                                      <Image 
                                        src={imageUrl} 
                                        alt={`Product ${index + 1}`}
                                        width={120}
                                        height={120}
                                        className={`w-[120px] h-[120px] object-cover rounded-lg border-2 ${
                                          index === 0 
                                            ? 'border-orange-500 shadow-lg' 
                                            : 'border-gray-300'
                                        }`}
                                      />
                                      
                                      {/* Drag Handle */}
                                      <div 
                                        {...provided.dragHandleProps}
                                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <GripVertical className="w-4 h-4 text-gray-600" />
                                      </div>
                                      
                                      {/* Action Buttons */}
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <div className="flex gap-1">
                                          {index !== 0 && (
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant="secondary"
                                              onClick={() => setAsMainImage(index)}
                                              className="h-8 px-2 bg-orange-500 text-white hover:bg-orange-600"
                                              title="Set as main image"
                                            >
                                              <Star className="w-3 h-3" />
                                            </Button>
                                          )}
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => removeImage(index)}
                                            className="h-8 px-2"
                                            title="Remove image"
                                          >
                                            <X className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Image Order */}
                                    <div className="text-center mt-1">
                                      <span className="text-xs text-gray-500">#{index + 1}</span>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                )}
                
                {images.length > 0 && (
                  <div className="text-sm text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-blue-800 mb-2">📸 Image Management Tips:</p>
                        <ul className="space-y-1 text-blue-700">
                          <li>• <strong>First image</strong> = Main product image (shown in listings)</li>
                          <li>• <strong>Drag images</strong> to reorder them</li>
                          <li>• <strong>Click the star</strong> to set any image as main</li>
                          <li>• <strong>Best quality:</strong> 1200x1200px, clear, well-lit photos</li>
                          <li>• <strong>Show different angles</strong> to help customers decide</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {images.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No images uploaded yet</p>
                    <p className="text-xs mt-1">Add at least one image to save your product</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Variants Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  🎯 Product Variants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Enable Product Variants</p>
                      <p className="text-xs text-gray-500">Add different sizes, colors, weights, or materials</p>
                    </div>
                    <Switch 
                      checked={showVariants}
                      onCheckedChange={setShowVariants}
                    />
                  </div>

                  {showVariants && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Manage Variants</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addVariant()}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Variant
                        </Button>
                      </div>

                      {variants.map((variant, index) => (
                        <Card key={index} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`variant-${index}-size`}>Size</Label>
                              <Input
                                id={`variant-${index}-size`}
                                placeholder="e.g., Small, Medium, Large"
                                value={variant.size || ''}
                                onChange={(e) => updateVariant(index, 'size', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`variant-${index}-color`}>Color</Label>
                              <Input
                                id={`variant-${index}-color`}
                                placeholder="e.g., Gold, Silver, Rose Gold"
                                value={variant.color || ''}
                                onChange={(e) => updateVariant(index, 'color', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`variant-${index}-weight`}>Weight</Label>
                              <Input
                                id={`variant-${index}-weight`}
                                placeholder="e.g., 2g, 3g, 5g"
                                value={variant.weight || ''}
                                onChange={(e) => updateVariant(index, 'weight', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`variant-${index}-material`}>Material</Label>
                              <Input
                                id={`variant-${index}-material`}
                                placeholder="e.g., 14K Gold, Sterling Silver"
                                value={variant.material || ''}
                                onChange={(e) => updateVariant(index, 'material', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`variant-${index}-price`}>Price Override</Label>
                              <Input
                                id={`variant-${index}-price`}
                                type="number"
                                placeholder="Leave empty to use product price"
                                value={variant.price || ''}
                                onChange={(e) => updateVariant(index, 'price', e.target.value ? parseFloat(e.target.value) : null)}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={variant.isDefault}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setVariants(prev => prev.map((v, i) => ({ ...v, isDefault: i === index })))
                                    } else {
                                      updateVariant(index, 'isDefault', false)
                                    }
                                  }}
                                />
                                <Label>Default</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={variant.isActive}
                                  onCheckedChange={(checked) => updateVariant(index, 'isActive', checked)}
                                />
                                <Label>Active</Label>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeVariant(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}

                      {variants.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Settings className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No variants added yet</p>
                          <p className="text-xs mt-1">Add variants to offer different options to customers</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

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