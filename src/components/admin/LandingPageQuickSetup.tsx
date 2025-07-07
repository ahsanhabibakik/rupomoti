'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { showToast } from '@/lib/toast'
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Eye,
  Star,
  Zap,
  Shield,
  Copy,
  Palette,
  RefreshCw,
  CheckCircle
} from 'lucide-react'
import { motion } from 'framer-motion'

const landingPageSchema = z.object({
  heroTitle: z.string().min(1, 'Hero title is required'),
  heroSubtitle: z.string().min(1, 'Hero subtitle is required'),
  callToAction: z.string().min(1, 'Call to action is required'),
  guarantee: z.string().optional(),
  features: z.array(z.string()).min(1, 'At least one feature is required'),
  benefits: z.array(z.string()).min(1, 'At least one benefit is required'),
  urgencyText: z.string().optional(),
  socialProof: z.string().optional(),
})

type LandingPageData = z.infer<typeof landingPageSchema>

interface LandingPageQuickSetupProps {
  productName: string
  initialData?: Partial<LandingPageData>
  onSave: (data: LandingPageData) => Promise<void>
  onPreview?: (data: LandingPageData) => void
  className?: string
}

export function LandingPageQuickSetup({
  productName,
  initialData,
  onSave,
  onPreview,
  className = ""
}: LandingPageQuickSetupProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<LandingPageData>({
    resolver: zodResolver(landingPageSchema),
    defaultValues: {
      heroTitle: initialData?.heroTitle || `${productName} - Premium Quality`,
      heroSubtitle: initialData?.heroSubtitle || `Discover the perfect ${productName.toLowerCase()} for your collection`,
      callToAction: initialData?.callToAction || 'Order Now - Limited Stock!',
      guarantee: initialData?.guarantee || '30-Day Money Back Guarantee',
      features: initialData?.features || ['Premium Quality', 'Fast Shipping', 'Expert Craftsmanship'],
      benefits: initialData?.benefits || ['Perfect for special occasions', 'Durable and long-lasting', 'Makes a great gift'],
      urgencyText: initialData?.urgencyText || 'Only 5 left in stock!',
      socialProof: initialData?.socialProof || '1000+ happy customers',
    }
  })

  // Template application
  const applyTemplate = (templateType: string) => {
    const templates = {
      luxury: {
        heroTitle: `Luxury ${productName} Collection`,
        heroSubtitle: 'Indulge in exceptional craftsmanship and timeless elegance',
        callToAction: 'Claim Your Luxury Piece Now',
        guarantee: 'Lifetime Luxury Guarantee',
        urgencyText: 'Exclusive Limited Edition',
        socialProof: 'Trusted by VIP customers worldwide',
        features: ['Premium Materials', 'Handcrafted Excellence', 'Luxury Packaging', 'Certificate of Authenticity'],
        benefits: ['Symbol of status and elegance', 'Investment in timeless beauty', 'Exclusive collection access', 'VIP customer service']
      },
      urgency: {
        heroTitle: `${productName} - Flash Sale!`,
        heroSubtitle: 'Don\'t miss out on this incredible limited-time offer',
        callToAction: 'Get Yours Before It\'s Gone!',
        guarantee: '24-Hour Flash Sale Guarantee',
        urgencyText: 'Only 3 hours left!',
        socialProof: '500+ sold in the last 24 hours',
        features: ['Limited Time Offer', 'Instant Shipping', 'No Hidden Fees', 'Best Price Guaranteed'],
        benefits: ['Save up to 50% today', 'Limited stock available', 'Free express shipping', 'Exclusive deal access']
      },
      elegant: {
        heroTitle: `Elegant ${productName}`,
        heroSubtitle: 'Sophistication meets style in perfect harmony',
        callToAction: 'Discover Elegance',
        guarantee: 'Elegance Satisfaction Promise',
        urgencyText: 'Curated collection',
        socialProof: 'Featured in top fashion magazines',
        features: ['Timeless Design', 'Sophisticated Styling', 'Premium Finish', 'Elegant Presentation'],
        benefits: ['Complements any style', 'Suitable for all occasions', 'Conversation starter', 'Confidence booster']
      }
    }

    const template = templates[templateType as keyof typeof templates]
    if (template) {
      Object.entries(template).forEach(([key, value]) => {
        form.setValue(key as keyof LandingPageData, value)
      })
      showToast.success(`${templateType.charAt(0).toUpperCase() + templateType.slice(1)} template applied!`)
    }
  }

  // Auto-generate suggestions
  const generateSuggestions = () => {
    const suggestions = {
      heroTitle: `${productName} - Transform Your Style`,
      heroSubtitle: `Experience the perfect blend of quality and elegance with our premium ${productName.toLowerCase()}`,
      callToAction: 'Shop Now & Get Free Shipping',
      guarantee: '30-Day Money Back Guarantee + Lifetime Support',
      urgencyText: 'Limited stock - Order today!',
      socialProof: 'Join 1000+ satisfied customers',
      features: [
        'Premium Quality Materials',
        'Expert Craftsmanship',
        'Fast & Secure Shipping',
        'Beautiful Gift Packaging'
      ],
      benefits: [
        'Perfect for special occasions',
        'Boosts confidence and style',
        'Durable and long-lasting',
        'Makes an ideal gift'
      ]
    }

    Object.entries(suggestions).forEach(([key, value]) => {
      form.setValue(key as keyof LandingPageData, value)
    })
    showToast.success('Suggestions applied successfully!')
  }

  // Array field management
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

  // Form submission
  const handleSave = async (data: LandingPageData) => {
    setIsSaving(true)
    try {
      await onSave(data)
      showToast.success('Landing page saved successfully!')
    } catch (error) {
      showToast.error('Failed to save landing page')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    const data = form.getValues()
    if (onPreview) {
      onPreview(data)
    }
    setIsPreviewMode(!isPreviewMode)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Landing Page Setup</h3>
          <p className="text-sm text-gray-600">Create a high-converting landing page in minutes</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateSuggestions}
            className="text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Auto-Fill
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handlePreview}
          variant="outline"
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-2" />
          {isPreviewMode ? 'Hide Preview' : 'Show Preview'}
        </Button>
        
        <Button
          onClick={() => handleSave(form.getValues())}
          disabled={isSaving}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
          Save Landing Page
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          {/* Hero Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="w-5 h-5 text-orange-500" />
                Hero Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="heroTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hero Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Compelling headline" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="callToAction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Call to Action</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Action button text" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="heroSubtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Subtitle</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} placeholder="Supporting description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Features & Benefits */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Star className="w-5 h-5 text-blue-500" />
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
                            <Input {...field} placeholder="Feature description" />
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

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="w-5 h-5 text-green-500" />
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
          </div>

          {/* Trust & Urgency */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="w-5 h-5 text-purple-500" />
                Trust & Urgency Elements
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <FormItem className="md:col-span-2">
                    <FormLabel>Social Proof</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="1000+ happy customers" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Preview Section */}
          {isPreviewMode && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="w-5 h-5 text-indigo-500" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg">
                  <div className="text-center space-y-4">
                    {form.watch('urgencyText') && (
                      <Badge className="bg-red-600 text-white">
                        {form.watch('urgencyText')}
                      </Badge>
                    )}
                    
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {form.watch('heroTitle')}
                    </h1>
                    
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      {form.watch('heroSubtitle')}
                    </p>
                    
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full">
                      {form.watch('callToAction')}
                    </Button>
                    
                    {form.watch('socialProof') && (
                      <p className="text-sm text-gray-500">{form.watch('socialProof')}</p>
                    )}
                  </div>
                  
                  {/* Features Preview */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {form.watch('features').slice(0, 3).map((feature, index) => (
                      <div key={index} className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <Star className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                        <p className="text-sm font-medium">{feature}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Guarantee Preview */}
                  {form.watch('guarantee') && (
                    <div className="mt-6 text-center p-4 bg-green-50 rounded-lg">
                      <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-green-700 font-medium">{form.watch('guarantee')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </div>
  )
}