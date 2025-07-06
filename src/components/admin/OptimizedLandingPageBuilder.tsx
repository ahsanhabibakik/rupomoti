'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { showToast } from '@/lib/toast'
import { 
  Save, 
  Eye, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Sparkles, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  RefreshCw,
  Copy,
  Settings2,
  Palette,
  Type,
  Image as ImageIcon,
  Star,
  Quote,
  Shield,
  Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { debounce } from 'lodash'
import Image from 'next/image'
import { ControllerRenderProps, FieldPath } from 'react-hook-form'

// Enhanced schema for landing page data
const landingPageSchema = z.object({
  heroTitle: z.string().min(1, 'Hero title is required'),
  heroSubtitle: z.string().min(1, 'Hero subtitle is required'),
  callToAction: z.string().min(1, 'Call to action is required'),
  guarantee: z.string().optional(),
  features: z.array(z.string()).min(1, 'At least one feature is required'),
  benefits: z.array(z.string()).min(1, 'At least one benefit is required'),
  testimonials: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    comment: z.string().min(1, 'Comment is required'),
    rating: z.number().min(1).max(5)
  })).optional(),
  urgencyText: z.string().optional(),
  socialProof: z.string().optional(),
  sections: z.array(z.object({
    id: z.string(),
    type: z.string(),
    order: z.number(),
    enabled: z.boolean(),
    data: z.any()
  })).optional()
})

type LandingPageFormData = z.infer<typeof landingPageSchema>

interface OptimizedLandingPageBuilderProps {
  productId: string
  initialData?: Partial<LandingPageFormData>
  productName?: string
  productImages?: string[]
  onSave: (data: LandingPageFormData) => Promise<void>
  onPreview: (data: LandingPageFormData) => void
  onPublish: (data: LandingPageFormData) => Promise<void>
}

type ViewportSize = 'mobile' | 'tablet' | 'desktop'

export function OptimizedLandingPageBuilder({
  productId,
  initialData,
  productName = 'Product',
  productImages = [],
  onSave,
  onPreview,
  onPublish
}: OptimizedLandingPageBuilderProps) {
  const [currentViewport, setCurrentViewport] = useState<ViewportSize>('desktop')
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [previewData, setPreviewData] = useState<LandingPageFormData | null>(null)

  const form = useForm<LandingPageFormData>({
    resolver: zodResolver(landingPageSchema),
    defaultValues: {
      heroTitle: initialData?.heroTitle || `${productName} - Premium Quality`,
      heroSubtitle: initialData?.heroSubtitle || `Discover the perfect ${productName.toLowerCase()} for your collection`,
      callToAction: initialData?.callToAction || 'Order Now - Limited Stock!',
      guarantee: initialData?.guarantee || '30-Day Money Back Guarantee',
      features: initialData?.features || ['Premium Quality', 'Fast Shipping', 'Expert Craftsmanship'],
      benefits: initialData?.benefits || ['Perfect for special occasions', 'Durable and long-lasting', 'Makes a great gift'],
      testimonials: initialData?.testimonials || [
        { name: 'Sarah Ahmed', comment: 'Absolutely love this product!', rating: 5 }
      ],
      urgencyText: initialData?.urgencyText || 'Only 5 left in stock!',
      socialProof: initialData?.socialProof || '1000+ happy customers',
      sections: initialData?.sections || []
    }
  })

  // Real-time preview update with debouncing
  const debouncedUpdatePreview = useMemo(
    () => debounce((data: LandingPageFormData) => {
      setPreviewData(data)
    }, 300),
    []
  )

  const watchedValues = form.watch()
  
  useEffect(() => {
    if (isPreviewMode) {
      debouncedUpdatePreview(watchedValues)
    }
  }, [watchedValues, isPreviewMode, debouncedUpdatePreview])

  // Viewport size configurations
  const viewportConfigs = {
    mobile: { width: '375px', height: '667px', icon: Smartphone },
    tablet: { width: '768px', height: '1024px', icon: Tablet },
    desktop: { width: '100%', height: '100%', icon: Monitor }
  }

  // Handle form submission
  const handleSave = useCallback(async (data: LandingPageFormData) => {
    setIsSaving(true)
    try {
      await onSave(data)
      showToast.success('Landing page saved successfully!')
    } catch (error) {
      showToast.error('Failed to save landing page')
    } finally {
      setIsSaving(false)
    }
  }, [onSave])

  const handlePublish = useCallback(async (data: LandingPageFormData) => {
    setIsPublishing(true)
    try {
      await onPublish(data)
      showToast.success('Landing page published successfully!')
    } catch (error) {
      showToast.error('Failed to publish landing page')
    } finally {
      setIsPublishing(false)
    }
  }, [onPublish])

  // Feature and benefit management
  const addFeature = () => {
    const currentFeatures = form.getValues('features')
    form.setValue('features', [...currentFeatures, ''])
  }

  const removeFeature = (index: number) => {
    const currentFeatures = form.getValues('features')
    form.setValue('features', currentFeatures.filter((_, i) => i !== index))
  }

  const addBenefit = () => {
    const currentBenefits = form.getValues('benefits')
    form.setValue('benefits', [...currentBenefits, ''])
  }

  const removeBenefit = (index: number) => {
    const currentBenefits = form.getValues('benefits')
    form.setValue('benefits', currentBenefits.filter((_, i) => i !== index))
  }

  const addTestimonial = () => {
    const currentTestimonials = form.getValues('testimonials') || []
    form.setValue('testimonials', [...currentTestimonials, { name: '', comment: '', rating: 5 }])
  }

  const removeTestimonial = (index: number) => {
    const currentTestimonials = form.getValues('testimonials') || []
    form.setValue('testimonials', currentTestimonials.filter((_, i) => i !== index))
  }

  // Quick template functions
  const applyTemplate = (templateType: string) => {
    const templates = {
      luxury: {
        heroTitle: `Luxury ${productName} Collection`,
        heroSubtitle: 'Indulge in exceptional craftsmanship and timeless elegance',
        callToAction: 'Claim Your Luxury Piece Now',
        guarantee: 'Lifetime Luxury Guarantee',
        urgencyText: 'Exclusive Limited Edition',
        socialProof: 'Trusted by VIP customers worldwide'
      },
      urgency: {
        heroTitle: `${productName} - Limited Time Offer!`,
        heroSubtitle: 'Don\'t miss out on this incredible deal',
        callToAction: 'Get Yours Before It\'s Gone!',
        guarantee: 'Flash Sale - 24 Hour Guarantee',
        urgencyText: 'Only 3 hours left!',
        socialProof: '500+ sold in the last 24 hours'
      },
      elegant: {
        heroTitle: `Elegant ${productName}`,
        heroSubtitle: 'Sophistication meets style in perfect harmony',
        callToAction: 'Discover Elegance',
        guarantee: 'Elegance Satisfaction Promise',
        urgencyText: 'Curated collection',
        socialProof: 'Featured in top fashion magazines'
      }
    }

    const template = templates[templateType as keyof typeof templates]
    if (template) {
      Object.entries(template).forEach(([key, value]) => {
        form.setValue(key as keyof LandingPageFormData, value)
      })
      showToast.success(`${templateType.charAt(0).toUpperCase() + templateType.slice(1)} template applied!`)
    }
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Panel - Form Editor */}
      <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Landing Page Builder</h2>
              <p className="text-sm text-gray-600">{productName}</p>
            </div>
            
            {/* Quick Templates */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => applyTemplate('luxury')}
                className="text-xs"
              >
                <Palette className="w-3 h-3 mr-1" />
                Luxury
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => applyTemplate('urgency')}
                className="text-xs"
              >
                <Zap className="w-3 h-3 mr-1" />
                Urgency
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => applyTemplate('elegant')}
                className="text-xs"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Elegant
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              variant={isPreviewMode ? "default" : "outline"}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreviewMode ? 'Live Preview ON' : 'Enable Live Preview'}
            </Button>
            
            <Button
              onClick={() => handleSave(form.getValues())}
              disabled={isSaving}
              variant="outline"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Draft
            </Button>
            
            <Button
              onClick={() => handlePublish(form.getValues())}
              disabled={isPublishing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPublishing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Publish
            </Button>
          </div>

          {/* Form */}
          <Form {...form}>
            <form className="space-y-6">
              {/* Hero Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Hero Section
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                                     <FormField
                     control={form.control}
                     name="heroTitle"
                     render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Hero Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Compelling headline that grabs attention" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                                     <FormField
                     control={form.control}
                     name="heroSubtitle"
                     render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Hero Subtitle</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} placeholder="Supporting text that explains the value proposition" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                                     <FormField
                     control={form.control}
                     name="callToAction"
                     render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Call to Action Button</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Action-oriented button text" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Features Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Product Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {form.watch('features').map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`features.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input {...field} placeholder="Product feature" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        disabled={form.watch('features').length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addFeature} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feature
                  </Button>
                </CardContent>
              </Card>

              {/* Benefits Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Customer Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {form.watch('benefits').map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`benefits.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input {...field} placeholder="Customer benefit" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeBenefit(index)}
                        disabled={form.watch('benefits').length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addBenefit} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Benefit
                  </Button>
                </CardContent>
              </Card>

              {/* Testimonials Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Quote className="w-5 h-5" />
                    Customer Testimonials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(form.watch('testimonials') || []).map((_, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex gap-2">
                        <FormField
                          control={form.control}
                          name={`testimonials.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Customer Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Customer name" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`testimonials.${index}.rating`}
                          render={({ field }) => (
                            <FormItem className="w-24">
                              <FormLabel>Rating</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="5" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTestimonial(index)}
                          className="mt-7"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name={`testimonials.${index}.comment`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Testimonial</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={2} placeholder="Customer testimonial" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addTestimonial} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Testimonial
                  </Button>
                </CardContent>
              </Card>

              {/* Trust & Urgency */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Trust & Urgency
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="guarantee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guarantee/Promise</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="30-Day Money Back Guarantee" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="urgencyText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urgency Text</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Limited time offer!" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="socialProof"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social Proof</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="1000+ happy customers" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </div>

      {/* Right Panel - Live Preview */}
      <div className="w-1/2 bg-white">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Live Preview</h3>
            
            {/* Viewport Switcher */}
            <div className="flex items-center gap-2">
              {Object.entries(viewportConfigs).map(([size, config]) => {
                const IconComponent = config.icon
                return (
                  <Button
                    key={size}
                    variant={currentViewport === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentViewport(size as ViewportSize)}
                  >
                    <IconComponent className="w-4 h-4" />
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="p-4 h-full overflow-auto">
          <div 
            className="mx-auto transition-all duration-300 bg-white shadow-lg rounded-lg overflow-hidden"
            style={{
              width: viewportConfigs[currentViewport].width,
              maxHeight: viewportConfigs[currentViewport].height,
              minHeight: currentViewport === 'desktop' ? '800px' : viewportConfigs[currentViewport].height
            }}
          >
            {/* Preview Content */}
            <LandingPagePreview 
              data={isPreviewMode ? (previewData || form.getValues()) : form.getValues()}
              productImages={productImages}
              viewport={currentViewport}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview Component
interface LandingPagePreviewProps {
  data: LandingPageFormData
  productImages: string[]
  viewport: ViewportSize
}

function LandingPagePreview({ data, productImages, viewport }: LandingPagePreviewProps) {
  const isMobile = viewport === 'mobile'
  const isTablet = viewport === 'tablet'

  return (
    <div className={`${isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-lg'}`}>
      {/* Hero Section */}
      <section className={`relative bg-gradient-to-br from-orange-50 to-amber-50 ${isMobile ? 'py-8 px-4' : isTablet ? 'py-12 px-6' : 'py-16 px-8'}`}>
        <div className="text-center space-y-4">
          {data.urgencyText && (
            <Badge className="bg-red-600 text-white animate-pulse">
              {data.urgencyText}
            </Badge>
          )}
          
          <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl'}`}>
            {data.heroTitle}
          </h1>
          
          <p className={`text-gray-600 max-w-2xl mx-auto ${isMobile ? 'text-sm' : 'text-lg'}`}>
            {data.heroSubtitle}
          </p>
          
          {productImages[0] && (
            <div className={`relative mx-auto ${isMobile ? 'w-48 h-48' : isTablet ? 'w-64 h-64' : 'w-80 h-80'}`}>
              <Image 
                src={productImages[0]} 
                alt="Product" 
                fill
                className="object-cover rounded-lg shadow-lg"
              />
            </div>
          )}
          
          <Button 
            size={isMobile ? "default" : "lg"} 
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full shadow-lg"
          >
            {data.callToAction}
          </Button>
          
          {data.socialProof && (
            <p className="text-sm text-gray-500">{data.socialProof}</p>
          )}
        </div>
      </section>

      {/* Features Section */}
      {data.features.length > 0 && (
        <section className={`${isMobile ? 'py-8 px-4' : isTablet ? 'py-12 px-6' : 'py-16 px-8'} bg-white`}>
          <h2 className={`text-center font-bold text-gray-900 mb-8 ${isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl'}`}>
            Key Features
          </h2>
          <div className={`grid gap-4 max-w-4xl mx-auto ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {data.features.map((feature, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <Star className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="font-medium">{feature}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Benefits Section */}
      {data.benefits.length > 0 && (
        <section className={`${isMobile ? 'py-8 px-4' : isTablet ? 'py-12 px-6' : 'py-16 px-8'} bg-gray-50`}>
          <h2 className={`text-center font-bold text-gray-900 mb-8 ${isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl'}`}>
            Why Choose This Product?
          </h2>
          <div className={`grid gap-4 max-w-4xl mx-auto ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {data.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                <Zap className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <p>{benefit}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {data.testimonials && data.testimonials.length > 0 && (
        <section className={`${isMobile ? 'py-8 px-4' : isTablet ? 'py-12 px-6' : 'py-16 px-8'} bg-white`}>
          <h2 className={`text-center font-bold text-gray-900 mb-8 ${isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl'}`}>
            Customer Reviews
          </h2>
          <div className={`grid gap-6 max-w-4xl mx-auto ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {data.testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 border rounded-lg bg-gray-50">
                <div className="flex items-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-3">"{testimonial.comment}"</p>
                <p className="font-semibold text-gray-900">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Guarantee Section */}
      {data.guarantee && (
        <section className={`${isMobile ? 'py-8 px-4' : isTablet ? 'py-12 px-6' : 'py-16 px-8'} bg-green-50 text-center`}>
          <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className={`font-bold text-gray-900 mb-4 ${isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl'}`}>
            Our Promise to You
          </h2>
          <p className={`text-green-700 max-w-2xl mx-auto ${isMobile ? 'text-base' : 'text-lg'}`}>
            {data.guarantee}
          </p>
        </section>
      )}

      {/* Final CTA */}
      <section className={`${isMobile ? 'py-8 px-4' : isTablet ? 'py-12 px-6' : 'py-16 px-8'} bg-orange-600 text-white text-center`}>
        <h2 className={`font-bold mb-4 ${isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl'}`}>
          Ready to Get Yours?
        </h2>
        <Button 
          size={isMobile ? "default" : "lg"} 
          className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 rounded-full shadow-lg"
        >
          {data.callToAction}
        </Button>
        {data.urgencyText && (
          <p className="mt-4 text-orange-100 font-medium">{data.urgencyText}</p>
        )}
      </section>
    </div>
  )
}