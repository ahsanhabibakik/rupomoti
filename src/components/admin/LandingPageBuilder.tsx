'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult
} from '@hello-pangea/dnd'
import { 
  GripVertical, 
  Trash2, 
  Eye, 
  Save, 
  Upload,
  Star,
  Shield,
  Award,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Type,
  Layout,
  Settings,
  Copy,
  Download,
  Play,
  FileText,
  Palette,
  Sparkles,
  Grid,
  Plus,
  ChevronUp,
  Layers,
  Wand2,
  Zap,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Code
} from 'lucide-react'
import { showToast } from '@/lib/toast'

export interface LandingPageSection {
  id: string
  type: 'hero' | 'features' | 'benefits' | 'testimonials' | 'gallery' | 'cta' | 'text' | 'trust-badges' | 'video' | 'rich-text' | 'faq' | 'pricing' | 'countdown' | 'contact' | 'social-proof' | 'comparison' | 'stats'
  title: string
  content: Record<string, unknown>
  order: number
  visible: boolean
  customCss?: string
  animation?: 'none' | 'fade-in' | 'slide-up' | 'slide-down' | 'zoom-in' | 'bounce'
  spacing?: 'none' | 'small' | 'medium' | 'large'
}

export interface LandingPageData {
  sections: LandingPageSection[]
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
    layout: 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant'
    borderRadius: 'none' | 'small' | 'medium' | 'large'
    shadows: 'none' | 'subtle' | 'medium' | 'bold'
    spacing: 'compact' | 'normal' | 'spacious'
  }
  seo: {
    title: string
    description: string
    keywords: string[]
    ogImage?: string
  }
  settings: {
    customCss?: string
    trackingCode?: string
    enableAnimations: boolean
    mobileOptimized: boolean
    lazyLoading: boolean
  }
}

interface LandingPageBuilderProps {
  productId?: string
  initialData?: LandingPageData
  onSave?: (data: LandingPageData) => void
  onPreview?: (data: LandingPageData) => void
  onPublish?: (data: LandingPageData) => void
}

const SECTION_TEMPLATES = {
  hero: {
    title: 'Hero Section',
    icon: Layout,
    defaultContent: {
      headline: 'Discover Our Premium Collection',
      subheadline: 'Handcrafted with love, designed for elegance',
      backgroundImage: '',
      backgroundVideo: '',
      ctaText: 'Shop Now',
      ctaLink: '#product',
      showArrow: true,
      overlayOpacity: 0.5
    }
  },
  video: {
    title: 'Video Section',
    icon: Play,
    defaultContent: {
      title: 'See Our Product in Action',
      videoUrl: '',
      thumbnailUrl: '',
      autoplay: false,
      showControls: true,
      aspectRatio: '16:9'
    }
  },
  'rich-text': {
    title: 'Rich Text',
    icon: FileText,
    defaultContent: {
      title: 'About Our Product',
      content: '<p>Add your detailed product description here. You can use <strong>bold text</strong>, <em>italic text</em>, and even <a href="#">links</a>.</p>',
      showTitle: true,
      alignment: 'left',
      maxWidth: 'full'
    }
  },
  features: {
    title: 'Features',
    icon: Star,
    defaultContent: {
      title: 'Why Choose Us',
      subtitle: 'Discover what makes our products special',
      layout: 'grid',
      columns: 3,
      items: [
        { title: 'Premium Quality', description: 'Crafted with finest materials', icon: 'star', color: '#f97316' },
        { title: 'Expert Craftsmanship', description: 'Made by skilled artisans', icon: 'award', color: '#dc2626' },
        { title: 'Lifetime Warranty', description: 'Quality guaranteed', icon: 'shield', color: '#16a34a' }
      ]
    }
  },
  benefits: {
    title: 'Benefits',
    icon: Award,
    defaultContent: {
      title: 'Benefits You\'ll Love',
      items: [
        'Free shipping on all orders',
        '30-day money-back guarantee',
        'Expert customer support',
        'Exclusive member discounts'
      ],
      layout: 'list',
      showCheckmarks: true
    }
  },
  testimonials: {
    title: 'Testimonials',
    icon: MessageCircle,
    defaultContent: {
      title: 'What Our Customers Say',
      subtitle: 'Real reviews from real customers',
      layout: 'carousel',
      showRating: true,
      items: [
        { name: 'Sarah Johnson', comment: 'Beautiful quality and fast shipping!', rating: 5, image: '', location: 'New York' },
        { name: 'Mike Chen', comment: 'Exactly as described. Highly recommended!', rating: 5, image: '', location: 'California' },
        { name: 'Emma Davis', comment: 'Perfect gift for my mother. She loved it!', rating: 5, image: '', location: 'Texas' }
      ]
    }
  },
  gallery: {
    title: 'Gallery',
    icon: ImageIcon,
    defaultContent: {
      title: 'See It In Action',
      subtitle: 'Beautiful photos from our customers',
      layout: 'masonry',
      columns: 3,
      showLightbox: true,
      images: []
    }
  },
  cta: {
    title: 'Call to Action',
    icon: Heart,
    defaultContent: {
      title: 'Ready to Experience Luxury?',
      subtitle: 'Join thousands of satisfied customers',
      buttonText: 'Order Now',
      buttonLink: '#product',
      buttonSize: 'large',
      buttonStyle: 'primary',
      backgroundColor: 'gradient',
      showArrow: true
    }
  },
  text: {
    title: 'Text Block',
    icon: Type,
    defaultContent: {
      title: 'About This Product',
      content: 'Add your custom text content here...',
      alignment: 'left',
      fontSize: 'medium',
      showTitle: true
    }
  },
  'trust-badges': {
    title: 'Trust Badges',
    icon: Shield,
    defaultContent: {
      title: 'Why You Can Trust Us',
      layout: 'horizontal',
      showTitle: true,
      badges: [
        { icon: 'shield', text: 'Secure Payment', color: '#16a34a' },
        { icon: 'award', text: 'Premium Quality', color: '#f97316' },
        { icon: 'star', text: 'Trusted by Thousands', color: '#eab308' }
      ]
    }
  },
  faq: {
    title: 'FAQ',
    icon: MessageCircle,
    defaultContent: {
      title: 'Frequently Asked Questions',
      subtitle: 'Find answers to common questions',
      items: [
        { question: 'What is your return policy?', answer: 'We offer a 30-day money-back guarantee on all products.' },
        { question: 'How long does shipping take?', answer: 'Standard shipping takes 3-5 business days.' },
        { question: 'Do you offer international shipping?', answer: 'Yes, we ship worldwide with additional fees.' }
      ]
    }
  },
  pricing: {
    title: 'Pricing',
    icon: Award,
    defaultContent: {
      title: 'Choose Your Plan',
      subtitle: 'Transparent pricing with no hidden fees',
      currency: '$',
      plans: [
        { name: 'Basic', price: 29, features: ['Feature 1', 'Feature 2'], popular: false },
        { name: 'Premium', price: 49, features: ['Feature 1', 'Feature 2', 'Feature 3'], popular: true },
        { name: 'Enterprise', price: 99, features: ['All Features', 'Priority Support'], popular: false }
      ]
    }
  },
  countdown: {
    title: 'Countdown Timer',
    icon: Zap,
    defaultContent: {
      title: 'Limited Time Offer',
      subtitle: 'Don\'t miss out on this amazing deal',
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true
    }
  },
  contact: {
    title: 'Contact Form',
    icon: MessageCircle,
    defaultContent: {
      title: 'Get In Touch',
      subtitle: 'Have questions? We\'d love to hear from you',
      fields: [
        { name: 'name', label: 'Your Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'message', label: 'Message', type: 'textarea', required: true }
      ],
      submitText: 'Send Message',
      showPhone: true,
      showEmail: true,
      showAddress: false
    }
  },
  'social-proof': {
    title: 'Social Proof',
    icon: Star,
    defaultContent: {
      title: 'Trusted by Thousands',
      stats: [
        { label: 'Happy Customers', value: '10,000+' },
        { label: 'Products Sold', value: '50,000+' },
        { label: 'Five Star Reviews', value: '98%' },
        { label: 'Countries Served', value: '25+' }
      ],
      layout: 'horizontal',
      showIcons: true
    }
  },
  comparison: {
    title: 'Comparison Table',
    icon: Grid,
    defaultContent: {
      title: 'Why Choose Our Product',
      subtitle: 'See how we compare to the competition',
      products: [
        { name: 'Our Product', features: ['Feature 1', 'Feature 2', 'Feature 3'], highlight: true },
        { name: 'Competitor A', features: ['Feature 1', '', 'Feature 3'], highlight: false },
        { name: 'Competitor B', features: ['Feature 1', 'Feature 2', ''], highlight: false }
      ]
    }
  },
  stats: {
    title: 'Statistics',
    icon: Award,
    defaultContent: {
      title: 'Numbers That Matter',
      subtitle: 'Our achievements in numbers',
      layout: 'horizontal',
      animateNumbers: true,
      items: [
        { label: 'Years in Business', value: 15, suffix: '+' },
        { label: 'Customer Satisfaction', value: 99, suffix: '%' },
        { label: 'Products Delivered', value: 50000, suffix: '+' },
        { label: 'Countries Reached', value: 25, suffix: '+' }
      ]
    }
  }
}

export function LandingPageBuilder({ 
  productId, 
  initialData, 
  onSave, 
  onPreview, 
  onPublish 
}: LandingPageBuilderProps) {
  const [data, setData] = useState<LandingPageData>(initialData || {
    sections: [],
    theme: {
      primaryColor: '#f97316',
      secondaryColor: '#dc2626',
      accentColor: '#0ea5e9',
      fontFamily: 'Inter',
      layout: 'modern',
      borderRadius: 'medium',
      shadows: 'subtle',
      spacing: 'normal'
    },
    seo: {
      title: '',
      description: '',
      keywords: []
    },
    settings: {
      enableAnimations: true,
      mobileOptimized: true,
      lazyLoading: true
    }
  })
  
  const [activeTab, setActiveTab] = useState('sections')
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [showPreview, setShowPreview] = useState(false)

  // Load existing landing page data
  useEffect(() => {
    const loadData = async () => {
      if (productId && !initialData) {
        setLoading(true)
        try {
          const response = await fetch(`/api/admin/products/${productId}/landing-page/draft`)
          const result = await response.json()
          
          if (result.success && result.data) {
            setData(result.data)
          }
        } catch (error) {
          console.error('Error loading landing page data:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    
    loadData()
  }, [productId, initialData])

  const loadLandingPageData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}/landing-page/draft`)
      const result = await response.json()
      
      if (result.success && result.data) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error loading landing page data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (start: { draggableId: string }) => {
    // Handle drag start
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const newSections = Array.from(data.sections)
    const [reorderedItem] = newSections.splice(result.source.index, 1)
    newSections.splice(result.destination.index, 0, reorderedItem)
    
    // Update order numbers
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }))

    setData({ ...data, sections: updatedSections })
    showToast.success('Section reordered successfully')
  }

  const addSection = (type: keyof typeof SECTION_TEMPLATES) => {
    const template = SECTION_TEMPLATES[type]
    const newSection: LandingPageSection = {
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: template.title,
      content: template.defaultContent,
      order: data.sections.length,
      visible: true
    }
    
    setData({
      ...data,
      sections: [...data.sections, newSection]
    })
    
    setSelectedSection(newSection.id)
    showToast.success(`${template.title} section added`)
  }

  const updateSection = (sectionId: string, updates: Partial<LandingPageSection>) => {
    setData({
      ...data,
      sections: data.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    })
  }

  const deleteSection = (sectionId: string) => {
    setData({
      ...data,
      sections: data.sections.filter(section => section.id !== sectionId)
    })
    
    if (selectedSection === sectionId) {
      setSelectedSection(null)
    }
    
    showToast.success('Section deleted')
  }

  const duplicateSection = (sectionId: string) => {
    const sectionToDuplicate = data.sections.find(s => s.id === sectionId)
    if (!sectionToDuplicate) return
    
    const newSection: LandingPageSection = {
      ...sectionToDuplicate,
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `${sectionToDuplicate.title} (Copy)`,
      order: data.sections.length
    }
    
    setData({
      ...data,
      sections: [...data.sections, newSection]
    })
    
    showToast.success('Section duplicated')
  }

  const handleSave = async (asDraft = true) => {
    setSaving(true)
    try {
      if (productId) {
        const endpoint = asDraft ? 'draft' : 'publish'
        const response = await fetch(`/api/admin/products/${productId}/landing-page/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })

        const result = await response.json()
        
        if (result.success) {
          showToast.success(asDraft ? 'Draft saved successfully' : 'Landing page published successfully')
          if (onSave) {
            await onSave(data)
          }
        } else {
          showToast.error(result.error || 'Failed to save')
        }
      } else {
        if (onSave) {
          await onSave(data)
        }
        showToast.success(asDraft ? 'Draft saved' : 'Landing page published')
      }
    } catch (error) {
      console.error('Save error:', error)
      showToast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    if (showPreview) {
      setShowPreview(false)
    } else {
      setShowPreview(true)
      if (onPreview) {
        onPreview(data)
      }
    }
  }

  const handlePublish = async () => {
    await handleSave(false)
    if (onPublish) {
      onPublish(data)
    }
  }

  const exportData = () => {
    const dataStr = JSON.stringify(data, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `landing-page-${productId || 'template'}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast.success('Landing page exported')
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        setData(importedData)
        showToast.success('Landing page imported')
      } catch {
        showToast.error('Invalid file format')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-orange-600" />
          <h2 className="text-lg font-semibold">Landing Page Builder</h2>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {data.sections.length} sections
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Device Preview Buttons */}
          <div className="flex items-center gap-1 mr-4 p-1 bg-gray-100 rounded-lg">
            <Button
              variant={previewMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('desktop')}
              className={`px-3 ${previewMode === 'desktop' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <Monitor className="w-4 h-4 mr-1" />
              Desktop
            </Button>
            <Button
              variant={previewMode === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('tablet')}
              className={`px-3 ${previewMode === 'tablet' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <Tablet className="w-4 h-4 mr-1" />
              Tablet
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('mobile')}
              className={`px-3 ${previewMode === 'mobile' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <Smartphone className="w-4 h-4 mr-1" />
              Mobile
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className={showPreview ? 'bg-blue-50 border-blue-300' : ''}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={saving || data.sections.length === 0}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Publish Live
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r bg-gray-50 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4 m-2">
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sections" className="flex-1 overflow-y-auto px-2">
              {/* Add Section Categories */}
              <div className="space-y-4">
                {/* Essential Sections */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-600" />
                      Essential Sections
                      <Badge variant="outline" className="text-xs">Start Here</Badge>
                    </CardTitle>
                    <p className="text-xs text-gray-600">
                      🚀 Every great landing page starts with these core sections
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'hero', template: SECTION_TEMPLATES.hero },
                        { key: 'features', template: SECTION_TEMPLATES.features },
                        { key: 'cta', template: SECTION_TEMPLATES.cta },
                        { key: 'testimonials', template: SECTION_TEMPLATES.testimonials }
                      ].map(({ key, template }) => {
                        const Icon = template.icon
                        return (
                          <Button
                            key={key}
                            variant="outline"
                            size="sm"
                            onClick={() => addSection(key as keyof typeof SECTION_TEMPLATES)}
                            className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-orange-50 hover:border-orange-300 transition-all"
                            title={`Add ${template.title} - Essential for conversions`}
                          >
                            <Icon className="w-4 h-4 text-orange-600" />
                            <span className="text-xs font-medium">{template.title}</span>
                          </Button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Content Sections */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Content Sections
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'rich-text', template: SECTION_TEMPLATES['rich-text'] },
                        { key: 'text', template: SECTION_TEMPLATES.text },
                        { key: 'video', template: SECTION_TEMPLATES.video },
                        { key: 'gallery', template: SECTION_TEMPLATES.gallery }
                      ].map(({ key, template }) => {
                        const Icon = template.icon
                        return (
                          <Button
                            key={key}
                            variant="outline"
                            size="sm"
                            onClick={() => addSection(key as keyof typeof SECTION_TEMPLATES)}
                            className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Icon className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-medium">{template.title}</span>
                          </Button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Social & Trust */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      Social & Trust
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'trust-badges', template: SECTION_TEMPLATES['trust-badges'] },
                        { key: 'social-proof', template: SECTION_TEMPLATES['social-proof'] },
                        { key: 'stats', template: SECTION_TEMPLATES.stats },
                        { key: 'benefits', template: SECTION_TEMPLATES.benefits }
                      ].map(({ key, template }) => {
                        const Icon = template.icon
                        return (
                          <Button
                            key={key}
                            variant="outline"
                            size="sm"
                            onClick={() => addSection(key as keyof typeof SECTION_TEMPLATES)}
                            className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-green-50 hover:border-green-300"
                          >
                            <Icon className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium">{template.title}</span>
                          </Button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Advanced Sections */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-purple-600" />
                      Advanced Sections
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'faq', template: SECTION_TEMPLATES.faq },
                        { key: 'pricing', template: SECTION_TEMPLATES.pricing },
                        { key: 'countdown', template: SECTION_TEMPLATES.countdown },
                        { key: 'contact', template: SECTION_TEMPLATES.contact },
                        { key: 'comparison', template: SECTION_TEMPLATES.comparison }
                      ].map(({ key, template }) => {
                        const Icon = template.icon
                        return (
                          <Button
                            key={key}
                            variant="outline"
                            size="sm"
                            onClick={() => addSection(key as keyof typeof SECTION_TEMPLATES)}
                            className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-purple-50 hover:border-purple-300"
                          >
                            <Icon className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-medium">{template.title}</span>
                          </Button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sections List */}
              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Page Sections</span>
                    {data.sections.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSection(null)}
                        className="text-xs h-6 px-2"
                      >
                        Clear Selection
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.sections.length === 0 ? (
                    <div className="text-center py-6">
                      <Layers className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-2">No sections yet</p>
                      <p className="text-xs text-gray-400">Add your first section from the categories above</p>
                    </div>
                  ) : (
                    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                      <Droppable droppableId="sections">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef}>
                            {data.sections.map((section, index) => (
                              <Draggable key={section.id} draggableId={section.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`mb-2 p-3 border rounded-lg transition-all ${
                                      selectedSection === section.id 
                                        ? 'border-orange-500 bg-orange-50 shadow-md' 
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                    } ${
                                      snapshot.isDragging ? 'shadow-lg rotate-1' : ''
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div 
                                          {...provided.dragHandleProps} 
                                          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-200"
                                        >
                                          <GripVertical className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div 
                                          className="flex-1 cursor-pointer"
                                          onClick={() => setSelectedSection(section.id)}
                                        >
                                          <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium">{section.title}</p>
                                            {!section.visible && (
                                              <Badge variant="secondary" className="text-xs">Hidden</Badge>
                                            )}
                                          </div>
                                          <p className="text-xs text-gray-500 capitalize">{section.type.replace('-', ' ')}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-1">
                                        <Switch
                                          checked={section.visible}
                                          onCheckedChange={(checked) => 
                                            updateSection(section.id, { visible: checked })
                                          }
                                          className="data-[state=checked]:bg-orange-600"
                                        />
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => duplicateSection(section.id)}
                                          className="p-1 h-8 w-8 hover:bg-blue-100"
                                        >
                                          <Copy className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => deleteSection(section.id)}
                                          className="p-1 h-8 w-8 hover:bg-red-100"
                                        >
                                          <Trash2 className="w-3 h-3 text-red-500" />
                                        </Button>
                                      </div>
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="theme" className="flex-1 overflow-y-auto px-2">
              <div className="space-y-4">
                {/* Colors */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Palette className="w-4 h-4 text-pink-600" />
                      Color Scheme
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Primary Color</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="color"
                            value={data.theme.primaryColor}
                            onChange={(e) => setData({
                              ...data,
                              theme: { ...data.theme, primaryColor: e.target.value }
                            })}
                            className="w-12 h-8 p-0 border-0"
                          />
                          <Input
                            type="text"
                            value={data.theme.primaryColor}
                            onChange={(e) => setData({
                              ...data,
                              theme: { ...data.theme, primaryColor: e.target.value }
                            })}
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm">Secondary Color</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="color"
                            value={data.theme.secondaryColor}
                            onChange={(e) => setData({
                              ...data,
                              theme: { ...data.theme, secondaryColor: e.target.value }
                            })}
                            className="w-12 h-8 p-0 border-0"
                          />
                          <Input
                            type="text"
                            value={data.theme.secondaryColor}
                            onChange={(e) => setData({
                              ...data,
                              theme: { ...data.theme, secondaryColor: e.target.value }
                            })}
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm">Accent Color</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="color"
                            value={data.theme.accentColor}
                            onChange={(e) => setData({
                              ...data,
                              theme: { ...data.theme, accentColor: e.target.value }
                            })}
                            className="w-12 h-8 p-0 border-0"
                          />
                          <Input
                            type="text"
                            value={data.theme.accentColor}
                            onChange={(e) => setData({
                              ...data,
                              theme: { ...data.theme, accentColor: e.target.value }
                            })}
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Predefined Color Schemes */}
                    <div>
                      <Label className="text-sm mb-2 block">Quick Color Schemes</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { name: 'Orange', primary: '#f97316', secondary: '#dc2626', accent: '#0ea5e9' },
                          { name: 'Blue', primary: '#3b82f6', secondary: '#1e40af', accent: '#10b981' },
                          { name: 'Green', primary: '#10b981', secondary: '#059669', accent: '#f59e0b' },
                          { name: 'Purple', primary: '#8b5cf6', secondary: '#7c3aed', accent: '#ec4899' },
                          { name: 'Pink', primary: '#ec4899', secondary: '#db2777', accent: '#f97316' },
                          { name: 'Gray', primary: '#6b7280', secondary: '#4b5563', accent: '#f59e0b' }
                        ].map((scheme) => (
                          <Button
                            key={scheme.name}
                            variant="outline"
                            size="sm"
                            onClick={() => setData({
                              ...data,
                              theme: { 
                                ...data.theme, 
                                primaryColor: scheme.primary,
                                secondaryColor: scheme.secondary,
                                accentColor: scheme.accent
                              }
                            })}
                            className="h-8 text-xs"
                          >
                            <div className="flex items-center gap-1">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: scheme.primary }}
                              />
                              {scheme.name}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Typography */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Type className="w-4 h-4 text-blue-600" />
                      Typography
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm">Font Family</Label>
                      <Select
                        value={data.theme.fontFamily}
                        onValueChange={(value) => setData({
                          ...data,
                          theme: { ...data.theme, fontFamily: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter (Modern)</SelectItem>
                          <SelectItem value="Roboto">Roboto (Clean)</SelectItem>
                          <SelectItem value="Poppins">Poppins (Friendly)</SelectItem>
                          <SelectItem value="Open Sans">Open Sans (Readable)</SelectItem>
                          <SelectItem value="Playfair Display">Playfair Display (Elegant)</SelectItem>
                          <SelectItem value="Montserrat">Montserrat (Bold)</SelectItem>
                          <SelectItem value="Lato">Lato (Professional)</SelectItem>
                          <SelectItem value="Source Sans Pro">Source Sans Pro (Tech)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Layout Style */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Layout className="w-4 h-4 text-green-600" />
                      Layout Style
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm">Page Layout</Label>
                      <Select
                        value={data.theme.layout}
                        onValueChange={(value) => setData({
                          ...data,
                          theme: { ...data.theme, layout: value as 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant' }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modern">Modern (Clean & Minimal)</SelectItem>
                          <SelectItem value="classic">Classic (Traditional)</SelectItem>
                          <SelectItem value="minimal">Minimal (Ultra Clean)</SelectItem>
                          <SelectItem value="bold">Bold (High Impact)</SelectItem>
                          <SelectItem value="elegant">Elegant (Sophisticated)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm">Border Radius</Label>
                      <Select
                        value={data.theme.borderRadius}
                        onValueChange={(value) => setData({
                          ...data,
                          theme: { ...data.theme, borderRadius: value as 'none' | 'small' | 'medium' | 'large' }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (Sharp)</SelectItem>
                          <SelectItem value="small">Small (Subtle)</SelectItem>
                          <SelectItem value="medium">Medium (Balanced)</SelectItem>
                          <SelectItem value="large">Large (Rounded)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm">Shadows</Label>
                      <Select
                        value={data.theme.shadows}
                        onValueChange={(value) => setData({
                          ...data,
                          theme: { ...data.theme, shadows: value as 'none' | 'subtle' | 'medium' | 'bold' }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (Flat)</SelectItem>
                          <SelectItem value="subtle">Subtle (Light)</SelectItem>
                          <SelectItem value="medium">Medium (Balanced)</SelectItem>
                          <SelectItem value="bold">Bold (Dramatic)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm">Spacing</Label>
                      <Select
                        value={data.theme.spacing}
                        onValueChange={(value) => setData({
                          ...data,
                          theme: { ...data.theme, spacing: value as 'compact' | 'normal' | 'spacious' }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compact (Dense)</SelectItem>
                          <SelectItem value="normal">Normal (Balanced)</SelectItem>
                          <SelectItem value="spacious">Spacious (Airy)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="flex-1 overflow-y-auto px-2">
              <div className="space-y-4">
                {/* SEO Settings */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      SEO Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm">Page Title</Label>
                      <Input
                        value={data.seo.title || ''}
                        onChange={(e) => setData({
                          ...data,
                          seo: { ...data.seo, title: e.target.value }
                        })}
                        placeholder="Custom page title for SEO"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm">Meta Description</Label>
                      <Textarea
                        value={data.seo.description || ''}
                        onChange={(e) => setData({
                          ...data,
                          seo: { ...data.seo, description: e.target.value }
                        })}
                        placeholder="Brief description for search engines (160 characters max)"
                        rows={3}
                        maxLength={160}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {data.seo.description?.length || 0}/160 characters
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm">Keywords</Label>
                      <Input
                        value={data.seo.keywords?.join(', ') || ''}
                        onChange={(e) => setData({
                          ...data,
                          seo: { ...data.seo, keywords: e.target.value.split(', ').filter(k => k.trim()) }
                        })}
                        placeholder="keyword1, keyword2, keyword3"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm">Open Graph Image</Label>
                      <div className="space-y-2">
                        <Input
                          value={data.seo.ogImage || ''}
                          onChange={(e) => setData({
                            ...data,
                            seo: { ...data.seo, ogImage: e.target.value }
                          })}
                          placeholder="https://example.com/image.jpg"
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const input = document.createElement('input')
                              input.type = 'file'
                              input.accept = 'image/*'
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0]
                                if (file) {
                                  // Here you would upload the file to your server/CDN
                                  // For now, just show a message
                                  showToast.info('Image upload functionality needs to be implemented')
                                }
                              }
                              input.click()
                            }}
                            className="text-xs"
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Upload Image
                          </Button>
                          <p className="text-xs text-gray-500">
                            Recommended: 1200x630px
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Settings */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-600" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Enable Animations</Label>
                        <p className="text-xs text-gray-500">Smooth transitions and effects</p>
                      </div>
                      <Switch
                        checked={data.settings.enableAnimations}
                        onCheckedChange={(checked) => setData({
                          ...data,
                          settings: { ...data.settings, enableAnimations: checked }
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Mobile Optimized</Label>
                        <p className="text-xs text-gray-500">Responsive design for mobile devices</p>
                      </div>
                      <Switch
                        checked={data.settings.mobileOptimized}
                        onCheckedChange={(checked) => setData({
                          ...data,
                          settings: { ...data.settings, mobileOptimized: checked }
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Lazy Loading</Label>
                        <p className="text-xs text-gray-500">Load images only when needed</p>
                      </div>
                      <Switch
                        checked={data.settings.lazyLoading}
                        onCheckedChange={(checked) => setData({
                          ...data,
                          settings: { ...data.settings, lazyLoading: checked }
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Import/Export */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Download className="w-4 h-4 text-green-600" />
                      Import/Export
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportData}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Landing Page
                    </Button>
                    
                    <div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={importData}
                        className="hidden"
                        id="import-file"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('import-file')?.click()}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Import Landing Page
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="flex-1 overflow-y-auto px-2">
              <div className="space-y-4">
                {/* Custom CSS */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Code className="w-4 h-4 text-purple-600" />
                      Custom CSS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label className="text-sm">Custom CSS</Label>
                      <Textarea
                        value={data.settings.customCss || ''}
                        onChange={(e) => setData({
                          ...data,
                          settings: { ...data.settings, customCss: e.target.value }
                        })}
                        placeholder="Add your custom CSS here..."
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Analytics */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings className="w-4 h-4 text-gray-600" />
                      Analytics & Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label className="text-sm">Tracking Code</Label>
                      <Textarea
                        value={data.settings.trackingCode || ''}
                        onChange={(e) => setData({
                          ...data,
                          settings: { ...data.settings, trackingCode: e.target.value }
                        })}
                        placeholder="Google Analytics, Facebook Pixel, etc."
                        rows={6}
                        className="font-mono text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Templates */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Layout className="w-4 h-4 text-indigo-600" />
                      Quick Templates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { name: 'Simple Product', sections: ['hero', 'features', 'cta'] },
                        { name: 'Complete Sales', sections: ['hero', 'features', 'benefits', 'testimonials', 'trust-badges', 'cta'] },
                        { name: 'Video First', sections: ['hero', 'video', 'features', 'cta'] },
                        { name: 'Trust Builder', sections: ['hero', 'trust-badges', 'social-proof', 'testimonials', 'cta'] }
                      ].map((template) => (
                        <Button
                          key={template.name}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newSections = template.sections.map((type, index) => ({
                              id: `section-${Date.now()}-${index}`,
                              type: type as keyof typeof SECTION_TEMPLATES,
                              title: SECTION_TEMPLATES[type as keyof typeof SECTION_TEMPLATES].title,
                              content: SECTION_TEMPLATES[type as keyof typeof SECTION_TEMPLATES].defaultContent,
                              order: index,
                              visible: true
                            }))
                            setData({ ...data, sections: newSections })
                            showToast.success(`${template.name} template applied`)
                          }}
                          className="w-full justify-start"
                        >
                          <Wand2 className="w-4 h-4 mr-2" />
                          {template.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Preview Area */}
        <div className="flex-1 flex flex-col">
          {selectedSection ? (
            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-6">
              <div className="max-w-4xl mx-auto">
                <SectionEditor
                  section={data.sections.find(s => s.id === selectedSection)!}
                  onUpdate={(updates) => updateSection(selectedSection, updates)}
                  onClose={() => setSelectedSection(null)}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
              {/* Preview Area */}
              <div className="h-full flex items-center justify-center p-6">
                <div className={`bg-white rounded-lg shadow-lg transition-all duration-300 ${
                  previewMode === 'desktop' ? 'w-full max-w-6xl' : 
                  previewMode === 'tablet' ? 'w-full max-w-3xl' : 
                  'w-full max-w-sm'
                }`}>
                  {data.sections.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Layers className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-3">
                          🎨 Landing Page Builder
                        </h3>
                        <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
                          Create stunning, conversion-focused landing pages with our beginner-friendly drag-and-drop builder. 
                          No coding required!
                        </p>
                        
                        <div className="space-y-6">
                          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
                            <h4 className="text-xl font-semibold text-orange-800 mb-3">
                              🚀 Get Started in 3 Easy Steps
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                              <div className="bg-white p-4 rounded-lg border border-orange-200">
                                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mb-2">1</div>
                                <h5 className="font-semibold text-gray-900 mb-1">Add Hero Section</h5>
                                <p className="text-sm text-gray-600">Start with a compelling headline and description</p>
                              </div>
                              <div className="bg-white p-4 rounded-lg border border-orange-200">
                                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mb-2">2</div>
                                <h5 className="font-semibold text-gray-900 mb-1">Add Features</h5>
                                <p className="text-sm text-gray-600">Highlight your product&apos;s key benefits</p>
                              </div>
                              <div className="bg-white p-4 rounded-lg border border-orange-200">
                                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mb-2">3</div>
                                <h5 className="font-semibold text-gray-900 mb-1">Add Call-to-Action</h5>
                                <p className="text-sm text-gray-600">Guide visitors to buy your product</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                            <Button
                              onClick={() => addSection('hero')}
                              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg text-lg px-6 py-3"
                            >
                              <Plus className="w-5 h-5 mr-2" />
                              Start with Hero
                            </Button>
                            <Button
                              onClick={() => addSection('features')}
                              variant="outline"
                              className="border-orange-300 text-orange-600 hover:bg-orange-50 text-lg px-6 py-3"
                            >
                              <Star className="w-5 h-5 mr-2" />
                              Add Features
                            </Button>
                          </div>
                          <p className="text-sm text-gray-500">
                            💡 Or choose from 17+ section types in the sidebar
                          </p>
                        </div>
                      </div>
                      
                      {/* Quick Tips */}
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Tips</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <strong>Drag & Drop:</strong> Reorder sections by dragging them in the sidebar
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <strong>YouTube Videos:</strong> Add video sections with YouTube URLs
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <strong>Rich Text:</strong> Use the rich text editor for detailed descriptions
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <strong>Templates:</strong> Apply pre-made templates from the Advanced tab
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="min-h-[600px] overflow-y-auto">
                      <div className="p-4 border-b bg-gray-50">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">
                            Live Preview ({previewMode})
                          </h3>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {data.sections.length} sections
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Preview Content */}
                      <div className="p-4 space-y-4">
                        {data.sections.map((section) => (
                          <div 
                            key={section.id}
                            className={`border rounded-lg p-4 ${
                              section.visible ? 'bg-white' : 'bg-gray-50 opacity-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{section.title}</h4>
                              <Badge variant={section.visible ? 'default' : 'secondary'}>
                                {section.visible ? 'Visible' : 'Hidden'}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              {section.type} section
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => setSelectedSection(section.id)}
                            >
                              <Settings className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Section Editor Component
interface SectionEditorProps {
  section: LandingPageSection
  onUpdate: (updates: Partial<LandingPageSection>) => void
  onClose: () => void
}

function SectionEditor({ section, onUpdate, onClose }: SectionEditorProps) {
  const updateContent = (key: string, value: string | number | boolean | unknown) => {
    onUpdate({
      content: {
        ...section.content,
        [key]: value
      }
    })
  }

  const renderEditor = () => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Headline</Label>
                <Input
                  value={(section.content.headline as string) || ''}
                  onChange={(e) => updateContent('headline', e.target.value)}
                  placeholder="Main headline"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Call to Action Text</Label>
                <Input
                  value={(section.content.ctaText as string) || ''}
                  onChange={(e) => updateContent('ctaText', e.target.value)}
                  placeholder="Shop Now"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Subheadline</Label>
              <Textarea
                value={(section.content.subheadline as string) || ''}
                onChange={(e) => updateContent('subheadline', e.target.value)}
                placeholder="Supporting text"
                rows={2}
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Background Image URL</Label>
                <Input
                  value={(section.content.backgroundImage as string) || ''}
                  onChange={(e) => updateContent('backgroundImage', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Background Video URL</Label>
                <Input
                  value={(section.content.backgroundVideo as string) || ''}
                  onChange={(e) => updateContent('backgroundVideo', e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">CTA Link</Label>
                <Input
                  value={(section.content.ctaLink as string) || ''}
                  onChange={(e) => updateContent('ctaLink', e.target.value)}
                  placeholder="#product or https://..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Overlay Opacity</Label>
                <Input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={(section.content.overlayOpacity as number) || 0.5}
                  onChange={(e) => updateContent('overlayOpacity', parseFloat(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={(section.content.showArrow as boolean) || false}
                onCheckedChange={(checked) => updateContent('showArrow', checked)}
              />
              <Label className="text-sm font-medium">Show Arrow Down</Label>
            </div>
          </div>
        )
        
      case 'video':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Section Title</Label>
              <Input
                value={(section.content.title as string) || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                placeholder="Video section title"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Video URL</Label>
              <Input
                value={(section.content.videoUrl as string) || ''}
                onChange={(e) => updateContent('videoUrl', e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports YouTube, Vimeo, and direct video file URLs
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Video Thumbnail (Optional)</Label>
              <Input
                value={(section.content.thumbnailUrl as string) || ''}
                onChange={(e) => updateContent('thumbnailUrl', e.target.value)}
                placeholder="https://example.com/thumbnail.jpg"
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Aspect Ratio</Label>
                <Select
                  value={(section.content.aspectRatio as string) || '16:9'}
                  onValueChange={(value) => updateContent('aspectRatio', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                    <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    <SelectItem value="21:9">21:9 (Ultra Wide)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={(section.content.autoplay as boolean) || false}
                  onCheckedChange={(checked) => updateContent('autoplay', checked)}
                />
                <Label className="text-sm font-medium">Autoplay</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={(section.content.showControls as boolean) || true}
                  onCheckedChange={(checked) => updateContent('showControls', checked)}
                />
                <Label className="text-sm font-medium">Show Controls</Label>
              </div>
            </div>
          </div>
        )
        
      case 'rich-text':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={(section.content.showTitle as boolean) || true}
                onCheckedChange={(checked) => updateContent('showTitle', checked)}
              />
              <Label className="text-sm font-medium">Show Title</Label>
            </div>
            
            {(section.content.showTitle as boolean) !== false && (
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <Input
                  value={(section.content.title as string) || ''}
                  onChange={(e) => updateContent('title', e.target.value)}
                  placeholder="Section title"
                  className="mt-1"
                />
              </div>
            )}
            
            <div>
              <Label className="text-sm font-medium">Rich Text Content</Label>
              <Textarea
                value={(section.content.content as string) || ''}
                onChange={(e) => updateContent('content', e.target.value)}
                placeholder="Enter your rich text content here. You can use HTML tags like <strong>, <em>, <a>, <p>, <ul>, <ol>, etc."
                rows={12}
                className="mt-1 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports HTML formatting: &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;h1-h6&gt;, &lt;blockquote&gt;
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Text Alignment</Label>
                <Select
                  value={(section.content.alignment as string) || 'left'}
                  onValueChange={(value) => updateContent('alignment', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="justify">Justify</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Max Width</Label>
                <Select
                  value={(section.content.maxWidth as string) || 'full'}
                  onValueChange={(value) => updateContent('maxWidth', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Width</SelectItem>
                    <SelectItem value="large">Large (1200px)</SelectItem>
                    <SelectItem value="medium">Medium (800px)</SelectItem>
                    <SelectItem value="small">Small (600px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )
        
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Title</Label>
              <Input
                value={(section.content.title as string) || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                placeholder="Section title"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Content</Label>
              <Textarea
                value={(section.content.content as string) || ''}
                onChange={(e) => updateContent('content', e.target.value)}
                placeholder="Your content here..."
                rows={6}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Text Alignment</Label>
                <Select
                  value={(section.content.alignment as string) || 'left'}
                  onValueChange={(value) => updateContent('alignment', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Font Size</Label>
                <Select
                  value={(section.content.fontSize as string) || 'medium'}
                  onValueChange={(value) => updateContent('fontSize', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )
        
      case 'cta':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Title</Label>
              <Input
                value={(section.content.title as string) || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                placeholder="Call to action title"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Subtitle</Label>
              <Input
                value={(section.content.subtitle as string) || ''}
                onChange={(e) => updateContent('subtitle', e.target.value)}
                placeholder="Supporting text"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Button Text</Label>
                <Input
                  value={(section.content.buttonText as string) || ''}
                  onChange={(e) => updateContent('buttonText', e.target.value)}
                  placeholder="Order Now"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Button Link</Label>
                <Input
                  value={(section.content.buttonLink as string) || ''}
                  onChange={(e) => updateContent('buttonLink', e.target.value)}
                  placeholder="#product or https://..."
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Button Size</Label>
                <Select
                  value={(section.content.buttonSize as string) || 'large'}
                  onValueChange={(value) => updateContent('buttonSize', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Button Style</Label>
                <Select
                  value={(section.content.buttonStyle as string) || 'primary'}
                  onValueChange={(value) => updateContent('buttonStyle', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="outline">Outline</SelectItem>
                    <SelectItem value="ghost">Ghost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={(section.content.showArrow as boolean) || false}
                onCheckedChange={(checked) => updateContent('showArrow', checked)}
              />
              <Label className="text-sm font-medium">Show Arrow Icon</Label>
            </div>
          </div>
        )
        
      default:
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Advanced editor for <strong>{section.type}</strong> sections is coming soon. 
                For now, you can edit the section title and visibility.
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Section Title</Label>
              <Input
                value={section.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Section title"
                className="mt-1"
              />
            </div>
          </div>
        )
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Edit Section</h3>
              <p className="text-orange-100 text-sm">{section.title}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
          {/* Basic Section Settings */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Basic Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Section Title</Label>
                <Input
                  value={section.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  placeholder="Section title"
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={section.visible}
                  onCheckedChange={(checked) => onUpdate({ visible: checked })}
                />
                <Label className="text-sm font-medium">Visible on Page</Label>
              </div>
            </div>
          </div>
          
          {/* Section Content */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Section Content</h4>
            {renderEditor()}
          </div>
          
          {/* Advanced Settings */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Advanced Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Animation</Label>
                <Select
                  value={(section.animation as string) || 'fade-in'}
                  onValueChange={(value) => onUpdate({ animation: value as 'none' | 'fade-in' | 'slide-up' | 'slide-down' | 'zoom-in' | 'bounce' })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="fade-in">Fade In</SelectItem>
                    <SelectItem value="slide-up">Slide Up</SelectItem>
                    <SelectItem value="slide-down">Slide Down</SelectItem>
                    <SelectItem value="zoom-in">Zoom In</SelectItem>
                    <SelectItem value="bounce">Bounce</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Spacing</Label>
                <Select
                  value={(section.spacing as string) || 'medium'}
                  onValueChange={(value) => onUpdate({ spacing: value as 'none' | 'small' | 'medium' | 'large' })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-4">
              <Label className="text-sm font-medium">Custom CSS</Label>
              <Textarea
                value={(section.customCss as string) || ''}
                onChange={(e) => onUpdate({ customCss: e.target.value })}
                placeholder="Add custom CSS for this section..."
                rows={4}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-gray-600"
              >
                Close Editor
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Duplicate section logic could go here
                  onClose()
                }}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Delete section logic could go here
                  onClose()
                }}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
