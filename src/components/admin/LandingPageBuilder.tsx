'use client'

import { useState, useEffect } from 'react'
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
  Code,
  ShoppingCart,
  Languages,
  Paintbrush,
  Megaphone
} from 'lucide-react'
import { showToast } from '@/lib/toast'
import { LandingPageData, LandingPageSection } from '@/types/landing-page'

interface LandingPageBuilderProps {
  productId?: string
  initialData?: LandingPageData
  onSave?: (data: LandingPageData) => void
  onPreview?: (data: LandingPageData) => void
  onPublish?: (data: LandingPageData) => void
}

const MODERN_COLOR_SCHEMES = [
  { name: 'Emerald Gold', primary: '#10B981', secondary: '#F59E0B', accent: '#EF4444', bg: '#FFFFFF', text: '#1F2937' },
  { name: 'Ocean Blue', primary: '#0EA5E9', secondary: '#8B5CF6', accent: '#F97316', bg: '#F8FAFC', text: '#0F172A' },
  { name: 'Rose Gold', primary: '#E11D48', secondary: '#F59E0B', accent: '#8B5CF6', bg: '#FDF2F8', text: '#881337' },
  { name: 'Purple Pro', primary: '#8B5CF6', secondary: '#EC4899', accent: '#10B981', bg: '#FAFAFA', text: '#374151' },
  { name: 'Sunset Orange', primary: '#F97316', secondary: '#EF4444', accent: '#8B5CF6', bg: '#FFF7ED', text: '#9A3412' },
  { name: 'Midnight Blue', primary: '#1E40AF', secondary: '#0EA5E9', accent: '#F59E0B', bg: '#F1F5F9', text: '#1E293B' }
]

const SECTION_TEMPLATES = {
  hero: {
    title: 'Hero Section',
    icon: Megaphone,
    category: 'Essential',
    defaultContent: {
      headline: 'আমাদের প্রিমিয়াম জুয়েলারি কালেকশন আবিষ্কার করুন',
      headlineEn: 'Discover Our Premium Jewelry Collection',
      subheadline: 'হাতে তৈরি অলংকার, ভালোবাসায় তৈরি, কমনীয়তার জন্য ডিজাইন',
      subheadlineEn: 'Handcrafted with love, designed for elegance',
      backgroundImage: '/images/hero/jewelry-hero.jpg',
      ctaText: 'এখনই অর্ডার করুন',
      ctaTextEn: 'Order Now',
      showProduct: true,
      showOrderButton: true,
      layout: 'centered',
      showVideo: false,
      videoUrl: ''
    }
  },
  'product-spotlight': {
    title: 'Product Spotlight',
    icon: Star,
    category: 'Essential',
    defaultContent: {
      title: 'বিশেষ পণ্য',
      titleEn: 'Featured Products',
      description: 'আমাদের সেরা পণ্যগুলি দেখুন',
      descriptionEn: 'Showcase our best products',
      products: [],
      layout: 'grid',
      showPricing: true,
      showRating: true,
      showOrderButton: true,
      maxProducts: 6
    }
  },
  'story-video': {
    title: 'Brand Story & Video',
    icon: Play,
    category: 'Engagement',
    defaultContent: {
      title: 'আমাদের গল্প',
      titleEn: 'Our Story',
      description: 'আমাদের যাত্রা সম্পর্কে জানুন',
      descriptionEn: 'Learn about our journey',
      videoUrl: '',
      thumbnailImage: '/images/story/brand-story.jpg',
      storyText: 'রুপমতী - বাংলাদেশের ঐতিহ্যবাহী অলংকার',
      storyTextEn: 'Rupomoti - Traditional Jewelry of Bangladesh',
      layout: 'side-by-side',
      showPlayButton: true
    }
  },
  'benefit-icons': {
    title: 'Why Choose Us',
    icon: Shield,
    category: 'Trust',
    defaultContent: {
      title: 'কেন আমাদের বেছে নিবেন',
      titleEn: 'Why Choose Us',
      benefits: [
        { 
          icon: 'shield', 
          title: 'প্রিমিয়াম মান', 
          titleEn: 'Premium Quality',
          description: 'সর্বোচ্চ মানের উপাদান দিয়ে তৈরি',
          descriptionEn: 'Crafted with finest materials'
        },
        { 
          icon: 'heart', 
          title: 'ভালোবাসায় তৈরি', 
          titleEn: 'Made with Love',
          description: 'প্রতিটি পণ্য একটি গল্প বলে',
          descriptionEn: 'Each piece tells a story'
        },
        { 
          icon: 'award', 
          title: 'বিশ্বস্ত ব্র্যান্ড', 
          titleEn: 'Trusted Brand',
          description: 'হাজারো সন্তুষ্ট গ্রাহক',
          descriptionEn: 'Thousands of satisfied customers'
        }
      ],
      layout: 'grid',
      showIcons: true,
      columns: 3
    }
  },
  testimonials: {
    title: 'Customer Reviews',
    icon: MessageCircle,
    category: 'Social Proof',
    defaultContent: {
      title: 'গ্রাহকদের মতামত',
      titleEn: 'What Our Customers Say',
      testimonials: [
        { 
          name: 'সারা আহমেদ', 
          nameEn: 'Sarah Ahmed',
          comment: 'অসাধারণ অলংকার, দারুণ মান!',
          commentEn: 'Beautiful jewelry, excellent quality!',
          rating: 5,
          location: 'ঢাকা',
          locationEn: 'Dhaka'
        },
        { 
          name: 'ফাতিমা খান', 
          nameEn: 'Fatima Khan',
          comment: 'দ্রুত ডেলিভারি এবং চমৎকার সেবা।',
          commentEn: 'Fast delivery and great service.',
          rating: 5,
          location: 'চট্টগ্রাম',
          locationEn: 'Chittagong'
        }
      ],
      layout: 'carousel',
      showRatings: true,
      autoplay: true
    }
  },
  'order-section': {
    title: 'Order Section',
    icon: ShoppingCart,
    category: 'Conversion',
    defaultContent: {
      title: 'এখনই অর্ডার করুন',
      titleEn: 'Order Now',
      subtitle: 'সীমিত সময়ের জন্য বিশেষ ছাড়',
      subtitleEn: 'Special discount for limited time',
      features: [
        { text: 'ফ্রি ডেলিভারি', textEn: 'Free Delivery' },
        { text: 'ক্যাশ অন ডেলিভারি', textEn: 'Cash on Delivery' },
        { text: '৭ দিনের রিটার্ন পলিসি', textEn: '7 Days Return Policy' }
      ],
      buttonText: 'অর্ডার করুন',
      buttonTextEn: 'Place Order',
      urgency: 'মাত্র ২৪ ঘন্টা বাকি!',
      urgencyEn: 'Only 24 hours left!',
      showUrgency: true,
      showFeatures: true
    }
  },
  faq: {
    title: 'FAQ',
    icon: FileText,
    category: 'Support',
    defaultContent: {
      title: 'প্রায়শই জিজ্ঞাসিত প্রশ্ন',
      titleEn: 'Frequently Asked Questions',
      faqs: [
        { 
          question: 'ডেলিভারি কত দিন লাগে?', 
          questionEn: 'How long does delivery take?',
          answer: 'ঢাকার মধ্যে ১-২ দিন, ঢাকার বাইরে ৩-৫ দিন।',
          answerEn: 'Within Dhaka 1-2 days, outside Dhaka 3-5 days.'
        },
        { 
          question: 'রিটার্ন পলিসি কি?', 
          questionEn: 'What is the return policy?',
          answer: 'পণ্য পাওয়ার ৭ দিনের মধ্যে রিটার্ন করতে পারবেন।',
          answerEn: 'You can return within 7 days of receiving the product.'
        }
      ],
      layout: 'accordion',
      showSearch: false
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
    id: '',
    productId: productId || '',
    sections: [],
    globalSettings: {
      theme: {
        primaryColor: '#10B981',
        secondaryColor: '#F59E0B',
        accentColor: '#EF4444',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        fontFamily: 'Inter'
      },
      layout: {
        maxWidth: '1200px',
        spacing: '2rem',
        borderRadius: '0.5rem'
      },
      animations: {
        enabled: true,
        duration: 300,
        easing: 'ease-in-out'
      },
      bangladeshSettings: {
        showBanglaText: true,
        language: 'bn',
        currency: 'BDT',
        deliveryAreas: ['ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'খুলনা'],
        paymentMethods: ['Cash on Delivery', 'bKash', 'Nagad'],
        supportLanguages: ['Bengali', 'English']
      }
    },
    seo: {
      title: '',
      description: '',
      keywords: [],
      ogImage: ''
    },
    published: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  
  const [activeTab, setActiveTab] = useState('sections')
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSave && data.sections.length > 0) {
        onSave(data)
      }
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer)
  }, [data, onSave])

  const addSection = (type: keyof typeof SECTION_TEMPLATES) => {
    const template = SECTION_TEMPLATES[type]
    const newSection: LandingPageSection = {
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: template.title,
      enabled: true,
      visible: true,
      order: data.sections.length,
      data: template.defaultContent,
      content: template.defaultContent,
      animation: 'fade-in',
      spacing: 'medium'
    }

    setData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
      updatedAt: new Date().toISOString()
    }))
    
    setSelectedSection(newSection.id)
    showToast.success(`${template.title} section added`)
  }

  const updateSection = (id: string, updates: Partial<LandingPageSection>) => {
    setData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === id ? { ...section, ...updates } : section
      ),
      updatedAt: new Date().toISOString()
    }))
  }

  const removeSection = (id: string) => {
    setData(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== id),
      updatedAt: new Date().toISOString()
    }))
    
    if (selectedSection === id) {
      setSelectedSection(null)
    }
    showToast.success('Section removed')
  }

  const duplicateSection = (id: string) => {
    const sectionToDuplicate = data.sections.find(s => s.id === id)
    if (!sectionToDuplicate) return

    const newSection: LandingPageSection = {
      ...sectionToDuplicate,
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `${sectionToDuplicate.title} (Copy)`,
      order: data.sections.length
    }

    setData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
      updatedAt: new Date().toISOString()
    }))
    
    showToast.success('Section duplicated')
  }

  const reorderSections = (result: DropResult) => {
    if (!result.destination) return

    const newSections = Array.from(data.sections)
    const [reorderedItem] = newSections.splice(result.source.index, 1)
    newSections.splice(result.destination.index, 0, reorderedItem)

    const sectionsWithOrder = newSections.map((section, index) => ({
      ...section,
      order: index
    }))

    setData(prev => ({
      ...prev,
      sections: sectionsWithOrder,
      updatedAt: new Date().toISOString()
    }))
  }

  const applyColorScheme = (scheme: typeof MODERN_COLOR_SCHEMES[0]) => {
    setData(prev => ({
      ...prev,
      globalSettings: {
        ...prev.globalSettings,
        theme: {
          ...prev.globalSettings.theme,
          primaryColor: scheme.primary,
          secondaryColor: scheme.secondary,
          accentColor: scheme.accent,
          backgroundColor: scheme.bg,
          textColor: scheme.text
        }
      },
      updatedAt: new Date().toISOString()
    }))
    showToast.success(`Applied ${scheme.name} color scheme`)
  }

  const handleSave = () => {
    if (onSave) {
      onSave(data)
      showToast.success('Landing page saved successfully!')
    }
  }

  const handlePreview = () => {
    if (onPreview) {
      onPreview(data)
    }
  }

  const handlePublish = () => {
    if (onPublish) {
      onPublish(data)
      showToast.success('Landing page published successfully!')
    }
  }

  const selectedSectionData = selectedSection 
    ? data.sections.find(s => s.id === selectedSection)
    : null

  // Group sections by category
  const sectionsByCategory = Object.entries(SECTION_TEMPLATES).reduce((acc, [key, template]) => {
    const category = template.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push({ key, template })
    return acc
  }, {} as Record<string, Array<{ key: string; template: any }>>)

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar - Builder Tools */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Landing Page Builder</h2>
          <p className="text-sm text-gray-600">Create high-converting pages</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-4 m-2">
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="language">Language</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="sections" className="p-4 space-y-4">
            {/* Section Categories */}
            {Object.entries(sectionsByCategory).map(([category, sections]) => (
              <div key={category} className="space-y-2">
                <h3 className="font-medium text-gray-900 text-sm">{category}</h3>
                <div className="grid grid-cols-1 gap-2">
                  {sections.map(({ key, template }) => {
                    const Icon = template.icon
                    return (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        onClick={() => addSection(key as keyof typeof SECTION_TEMPLATES)}
                        className="justify-start h-auto p-3 text-left hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Icon className="w-4 h-4 mr-2 text-blue-600" />
                        <div>
                          <div className="font-medium text-sm">{template.title}</div>
                          <div className="text-xs text-gray-500">
                            {key === 'hero' && 'Main banner with CTA'}
                            {key === 'product-spotlight' && 'Featured products'}
                            {key === 'story-video' && 'Brand story with video'}
                            {key === 'benefit-icons' && 'Key benefits with icons'}
                            {key === 'testimonials' && 'Customer reviews'}
                            {key === 'order-section' && 'Order form & CTA'}
                            {key === 'faq' && 'Questions & answers'}
                          </div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Current Sections */}
            {data.sections.length > 0 && (
              <div className="space-y-2 mt-6">
                <h3 className="font-medium text-gray-900 text-sm">Current Sections</h3>
                <DragDropContext onDragEnd={reorderSections}>
                  <Droppable droppableId="sections">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {data.sections.map((section, index) => (
                          <Draggable key={section.id} draggableId={section.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                  selectedSection === section.id
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                }`}
                                onClick={() => setSelectedSection(section.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div {...provided.dragHandleProps}>
                                      <GripVertical className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{section.title}</p>
                                      {!section.visible && (
                                        <Badge variant="secondary" className="text-xs">Hidden</Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Switch
                                      checked={section.visible}
                                      onCheckedChange={(checked) => 
                                        updateSection(section.id, { visible: checked })
                                      }
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        duplicateSection(section.id)
                                      }}
                                    >
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        removeSection(section.id)
                                      }}
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
              </div>
            )}
          </TabsContent>

          <TabsContent value="design" className="p-4 space-y-4">
            {/* Modern Color Schemes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Paintbrush className="w-4 h-4 text-pink-600" />
                  Modern Color Schemes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  {MODERN_COLOR_SCHEMES.map((scheme) => (
                    <Button
                      key={scheme.name}
                      variant="outline"
                      size="sm"
                      onClick={() => applyColorScheme(scheme)}
                      className="h-auto p-3 text-left justify-start"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="flex gap-1">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: scheme.primary }} />
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: scheme.secondary }} />
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: scheme.accent }} />
                        </div>
                        <span className="text-sm font-medium">{scheme.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Custom Colors */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-600" />
                  Custom Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Primary Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="color"
                        value={data.globalSettings?.theme?.primaryColor || '#10B981'}
                        onChange={(e) => setData({
                          ...data,
                          globalSettings: {
                            ...data.globalSettings,
                            theme: { ...data.globalSettings?.theme, primaryColor: e.target.value }
                          }
                        })}
                        className="w-12 h-8 p-0 border-0"
                      />
                      <Input
                        type="text"
                        value={data.globalSettings?.theme?.primaryColor || '#10B981'}
                        onChange={(e) => setData({
                          ...data,
                          globalSettings: {
                            ...data.globalSettings,
                            theme: { ...data.globalSettings?.theme, primaryColor: e.target.value }
                          }
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
                        value={data.globalSettings?.theme?.secondaryColor || '#F59E0B'}
                        onChange={(e) => setData({
                          ...data,
                          globalSettings: {
                            ...data.globalSettings,
                            theme: { ...data.globalSettings?.theme, secondaryColor: e.target.value }
                          }
                        })}
                        className="w-12 h-8 p-0 border-0"
                      />
                      <Input
                        type="text"
                        value={data.globalSettings?.theme?.secondaryColor || '#F59E0B'}
                        onChange={(e) => setData({
                          ...data,
                          globalSettings: {
                            ...data.globalSettings,
                            theme: { ...data.globalSettings?.theme, secondaryColor: e.target.value }
                          }
                        })}
                        className="flex-1 text-xs"
                      />
                    </div>
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
              <CardContent>
                <div>
                  <Label className="text-sm">Font Family</Label>
                  <Select
                    value={data.globalSettings?.theme?.fontFamily || 'Inter'}
                    onValueChange={(value) => setData({
                      ...data,
                      globalSettings: {
                        ...data.globalSettings,
                        theme: { ...data.globalSettings?.theme, fontFamily: value }
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter (Modern)</SelectItem>
                      <SelectItem value="Poppins">Poppins (Friendly)</SelectItem>
                      <SelectItem value="Roboto">Roboto (Clean)</SelectItem>
                      <SelectItem value="Montserrat">Montserrat (Bold)</SelectItem>
                      <SelectItem value="Playfair Display">Playfair Display (Elegant)</SelectItem>
                      <SelectItem value="Lato">Lato (Professional)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="language" className="p-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Languages className="w-4 h-4 text-green-600" />
                  Language Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Show Bangla Text</Label>
                  <Switch
                    checked={data.globalSettings?.bangladeshSettings?.showBanglaText || false}
                    onCheckedChange={(checked) => setData({
                      ...data,
                      globalSettings: {
                        ...data.globalSettings,
                        bangladeshSettings: {
                          ...data.globalSettings?.bangladeshSettings,
                          showBanglaText: checked
                        }
                      }
                    })}
                  />
                </div>
                <div className="text-xs text-gray-600">
                  When enabled, Bangla text will be displayed primarily. Users cannot change this setting.
                </div>
                
                <div>
                  <Label className="text-sm">Primary Language</Label>
                  <Select
                    value={data.globalSettings?.bangladeshSettings?.language || 'en'}
                    onValueChange={(value) => setData({
                      ...data,
                      globalSettings: {
                        ...data.globalSettings,
                        bangladeshSettings: {
                          ...data.globalSettings?.bangladeshSettings,
                          language: value as 'en' | 'bn',
                          showBanglaText: value === 'bn'
                        }
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bn">বাংলা (Bangla)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Currency</Label>
                  <Select
                    value={data.globalSettings?.bangladeshSettings?.currency || 'BDT'}
                    onValueChange={(value) => setData({
                      ...data,
                      globalSettings: {
                        ...data.globalSettings,
                        bangladeshSettings: {
                          ...data.globalSettings?.bangladeshSettings,
                          currency: value
                        }
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BDT">BDT (৳)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="p-4 space-y-4">
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
                    value={data.seo.title}
                    onChange={(e) => setData({
                      ...data,
                      seo: { ...data.seo, title: e.target.value }
                    })}
                    placeholder="Enter page title"
                  />
                </div>
                <div>
                  <Label className="text-sm">Meta Description</Label>
                  <Textarea
                    value={data.seo.description}
                    onChange={(e) => setData({
                      ...data,
                      seo: { ...data.seo, description: e.target.value }
                    })}
                    placeholder="Enter meta description"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-600" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Enable Animations</Label>
                  <Switch
                    checked={data.globalSettings?.animations?.enabled || true}
                    onCheckedChange={(checked) => setData({
                      ...data,
                      globalSettings: {
                        ...data.globalSettings,
                        animations: { ...data.globalSettings?.animations, enabled: checked }
                      }
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Actions */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs">
                {data.sections.length} sections
              </Badge>
              {data.published && (
                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                  Published
                </Badge>
              )}
              
              {/* Preview Mode Toggle */}
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewMode('desktop')}
                  className="h-6 px-2"
                >
                  <Monitor className="w-3 h-3" />
                </Button>
                <Button
                  variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewMode('tablet')}
                  className="h-6 px-2"
                >
                  <Tablet className="w-3 h-3" />
                </Button>
                <Button
                  variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewMode('mobile')}
                  className="h-6 px-2"
                >
                  <Smartphone className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreview}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button size="sm" onClick={handlePublish} className="bg-green-600 hover:bg-green-700">
                <Upload className="w-4 h-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 p-4 overflow-auto bg-gray-100">
          {data.sections.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Layout className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Landing Page</h3>
                <p className="text-gray-600 mb-4">Add sections to create a high-converting landing page</p>
                <Button onClick={() => setActiveTab('sections')} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Section
                </Button>
              </div>
            </div>
          ) : (
            <div className={`mx-auto transition-all duration-300 ${
              previewMode === 'mobile' ? 'max-w-sm' : 
              previewMode === 'tablet' ? 'max-w-2xl' : 
              'max-w-6xl'
            }`}>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="space-y-0">
                  {data.sections.map((section) => (
                    <div
                      key={section.id}
                      className={`relative group cursor-pointer transition-all duration-200 ${
                        selectedSection === section.id
                          ? 'ring-2 ring-blue-500 ring-inset'
                          : 'hover:ring-1 hover:ring-gray-300 hover:ring-inset'
                      }`}
                      onClick={() => setSelectedSection(section.id)}
                    >
                      {/* Section Overlay */}
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-200 z-10" />
                      
                      {/* Section Label */}
                      <div className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Badge variant="secondary" className="text-xs bg-white shadow-sm">
                          {section.title}
                        </Badge>
                      </div>
                      
                      {/* Section Content Preview */}
                      <div className="p-8 min-h-[200px] flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg font-semibold mb-2" style={{ color: data.globalSettings?.theme?.primaryColor || '#10B981' }}>
                            {section.title}
                          </div>
                          <div className="text-sm text-gray-600 mb-4">
                            {section.type === 'hero' && 'Hero section with main call-to-action and order button'}
                            {section.type === 'product-spotlight' && 'Featured product showcase with order options'}
                            {section.type === 'story-video' && 'Brand story with video content'}
                            {section.type === 'benefit-icons' && 'Key benefits with icons'}
                            {section.type === 'testimonials' && 'Customer testimonials and reviews'}
                            {section.type === 'order-section' && 'Dedicated order section with CTA'}
                            {section.type === 'faq' && 'Frequently asked questions'}
                          </div>
                          
                          {/* Show Order Button Preview */}
                          {(section.type === 'hero' || section.type === 'product-spotlight' || section.type === 'order-section') && (
                            <Button 
                              className="mb-2"
                              style={{ 
                                backgroundColor: data.globalSettings?.theme?.primaryColor || '#10B981',
                                borderColor: data.globalSettings?.theme?.primaryColor || '#10B981'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              {data.globalSettings?.bangladeshSettings?.showBanglaText ? 'অর্ডার করুন' : 'Order Now'}
                            </Button>
                          )}
                          
                          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            {!section.visible && (
                              <Badge variant="secondary" className="text-xs text-red-600">
                                Hidden
                              </Badge>
                            )}
                            <span className="capitalize">{section.animation}</span>
                            <span>•</span>
                            <span className="capitalize">{section.spacing} spacing</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Section Settings */}
      {selectedSectionData && (
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Section Settings</h3>
            <p className="text-sm text-gray-600">{selectedSectionData.title}</p>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <Label className="text-sm">Section Title</Label>
              <Input
                value={selectedSectionData.title}
                onChange={(e) => updateSection(selectedSectionData.id, { title: e.target.value })}
                placeholder="Enter section title"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-sm">Visible</Label>
              <Switch
                checked={selectedSectionData.visible}
                onCheckedChange={(checked) => updateSection(selectedSectionData.id, { visible: checked })}
              />
            </div>
            
            <div>
              <Label className="text-sm">Animation</Label>
              <Select
                value={selectedSectionData.animation || 'fade-in'}
                onValueChange={(value) => updateSection(selectedSectionData.id, { animation: value as any })}
              >
                <SelectTrigger>
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
              <Label className="text-sm">Spacing</Label>
              <Select
                value={selectedSectionData.spacing || 'medium'}
                onValueChange={(value) => updateSection(selectedSectionData.id, { spacing: value as any })}
              >
                <SelectTrigger>
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

            {/* Section-specific settings */}
            {selectedSectionData.type === 'hero' && (
              <div className="space-y-3 border-t pt-3">
                <h4 className="font-medium text-sm">Hero Content</h4>
                <div>
                  <Label className="text-sm">Show Order Button</Label>
                  <Switch
                    checked={selectedSectionData.content?.showOrderButton}
                    onCheckedChange={(checked) => updateSection(selectedSectionData.id, { 
                      content: { ...selectedSectionData.content, showOrderButton: checked }
                    })}
                  />
                </div>
              </div>
            )}

            {selectedSectionData.type === 'order-section' && (
              <div className="space-y-3 border-t pt-3">
                <h4 className="font-medium text-sm">Order Settings</h4>
                <div>
                  <Label className="text-sm">Show Urgency</Label>
                  <Switch
                    checked={selectedSectionData.content?.showUrgency}
                    onCheckedChange={(checked) => updateSection(selectedSectionData.id, { 
                      content: { ...selectedSectionData.content, showUrgency: checked }
                    })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
