'use client'

import React, { useState, useEffect, useContext, createContext } from 'react'
import { motion } from 'framer-motion'
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Play, 
  Pause, 
  Check,
  Award,
  Shield,
  Truck,
  Clock,
  Users,
  Gift,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LandingPageData, LandingPageSection } from '@/types/landing-page'
import { cn } from '@/lib/utils'

const LanguageContext = createContext<{
  language: 'en' | 'bn'
  getText: (en: string, bn: string) => string
}>({
  language: 'en',
  getText: (en, bn) => en
})

interface SectionProps {
  data: any
  productId: string
  onOrderNow: (id?: string) => void
  onAddToCart: (id: string, qty: number) => void
  onScrollToSection: (sectionId: string) => void
  globalSettings: any
}

interface LandingPageRendererProps {
  data: LandingPageData
  productId: string
  onAddToCart?: (productId: string, quantity: number) => void
  onAddToWishlist?: (productId: string) => void
  onOrderNow?: (productId: string) => void
}

export function LandingPageRenderer({ 
  data, 
  productId, 
  onAddToCart,
  onAddToWishlist,
  onOrderNow 
}: LandingPageRendererProps) {
  const [language, setLanguage] = useState<'en' | 'bn'>(
    data.globalSettings?.bangladeshSettings?.language || 'en'
  )

  const getText = (en: string, bn: string) => {
    return language === 'bn' ? bn : en
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleOrderNow = (id?: string) => {
    if (onOrderNow) {
      onOrderNow(id || productId)
    }
  }

  const handleAddToCart = (id: string, quantity: number) => {
    if (onAddToCart) {
      onAddToCart(id, quantity)
    }
  }

  const languageContextValue = {
    language,
    getText
  }

  const renderSection = (section: LandingPageSection) => {
    const sectionProps = {
      data: section.content || section.data,
      productId,
      onOrderNow: handleOrderNow,
      onAddToCart: handleAddToCart,
      onScrollToSection: scrollToSection,
      globalSettings: data.globalSettings || {}
    }

    switch (section.type) {
      case 'hero':
        return <HeroSection key={section.id} {...sectionProps} />
      case 'product-spotlight':
        return <ProductSpotlightSection key={section.id} {...sectionProps} />
      case 'story-video':
        return <StoryVideoSection key={section.id} {...sectionProps} />
      case 'benefit-icons':
        return <BenefitIconsSection key={section.id} {...sectionProps} />
      case 'testimonials':
        return <TestimonialsSection key={section.id} {...sectionProps} />
      case 'category-banner':
        return <CategoryBannerSection key={section.id} {...sectionProps} />
      case 'faq':
        return <FAQSection key={section.id} {...sectionProps} />
      default:
        return null
    }
  }

  const enabledSections = data.sections.filter(section => section.enabled && section.visible)

  return (
    <LanguageContext.Provider value={languageContextValue}>
      <div 
        className="min-h-screen"
        style={{ 
          fontFamily: data.globalSettings?.theme?.fontFamily || 'Inter',
          backgroundColor: data.globalSettings?.theme?.backgroundColor || '#FFFFFF',
          color: data.globalSettings?.theme?.textColor || '#1F2937'
        }}
      >
        {/* Render sections */}
        {enabledSections.map(renderSection)}
        
        {/* Sticky Order Button */}
        <StickyOrderButton
          onOrderNow={() => handleOrderNow()}
          getText={getText}
          primaryColor={data.globalSettings?.theme?.primaryColor || '#10B981'}
          showBangla={data.globalSettings?.bangladeshSettings?.showBanglaText || false}
        />
      </div>
    </LanguageContext.Provider>
  )
}

// Sticky Order Button Component
const StickyOrderButton: React.FC<{
  onOrderNow: () => void
  getText: (en: string, bn: string) => string
  primaryColor: string
  showBangla?: boolean
}> = ({ onOrderNow, getText, primaryColor, showBangla }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4 z-50"
        >
          <div className="container mx-auto max-w-md">
            <Button
              onClick={onOrderNow}
              className="w-full py-4 text-lg font-semibold text-white rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {getText('Order Now', 'এখনই অর্ডার করুন')}
            </Button>
          </div>
        </motion.div>
      )}
    </>
  )
}

// Hero Section Component
const HeroSection: React.FC<SectionProps> = ({ data, productId, onOrderNow, onScrollToSection, globalSettings }) => {
  const { getText } = useContext(LanguageContext)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      {/* Background Image */}
      {data.backgroundImage && (
        <div className="absolute inset-0 z-0">
          <img
            src={data.backgroundImage}
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            {getText(data.title || 'Premium Jewelry Collection', data.titleBn || 'প্রিমিয়াম জুয়েলারি কালেকশন')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl md:text-2xl text-white/90 mb-8"
          >
            {getText(data.subtitle || 'Handcrafted with love, designed for elegance', data.subtitleBn || 'ভালোবাসা দিয়ে তৈরি, কমনীয়তার জন্য ডিজাইন করা')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button
              onClick={() => onOrderNow(productId)}
              className="px-8 py-4 text-lg font-semibold text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-200"
              style={{ backgroundColor: globalSettings?.theme?.primaryColor || '#10B981' }}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {getText('Order Now', 'এখনই অর্ডার করুন')}
            </Button>
            
            <Button
              onClick={() => onScrollToSection('product-spotlight')}
              variant="outline"
              className="px-8 py-4 text-lg font-semibold border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-200"
            >
              <Eye className="h-5 w-5 mr-2" />
              {getText('View Products', 'পণ্য দেখুন')}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Product Spotlight Section
const ProductSpotlightSection: React.FC<SectionProps> = ({ data, onAddToCart, globalSettings }) => {
  const { getText } = useContext(LanguageContext)

  return (
    <section 
      id="product-spotlight" 
      className="py-20"
      style={{ 
        backgroundColor: data.backgroundColor || globalSettings?.theme?.backgroundColor || '#F9FAFB',
        color: globalSettings?.theme?.textColor || '#1F2937'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {getText(data.title || 'Featured Products', data.titleBn || 'নির্বাচিত পণ্য')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {getText(data.description || 'Discover our handpicked collection', data.descriptionBn || 'আমাদের বাছাই করা কালেকশন দেখুন')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.products?.map((product: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />
                  {product.discount && (
                    <Badge 
                      className="absolute top-3 right-3 px-2 py-1 text-xs font-medium"
                      style={{ backgroundColor: globalSettings?.theme?.accentColor || '#EF4444' }}
                    >
                      -{product.discount}%
                    </Badge>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold" style={{ color: globalSettings?.theme?.primaryColor || '#10B981' }}>
                        ৳{product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-gray-500 line-through ml-2">
                          ৳{product.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn(
                          "h-4 w-4",
                          i < product.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                        )} />
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => onAddToCart(product.id, 1)}
                    className="w-full py-3 text-lg font-semibold text-white rounded-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: globalSettings?.theme?.primaryColor || '#10B981' }}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {getText('Add to Cart', 'কার্টে যোগ করুন')}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Story & Video Section
const StoryVideoSection: React.FC<SectionProps> = ({ data, globalSettings }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const { getText } = useContext(LanguageContext)

  return (
    <section className="py-20" style={{ backgroundColor: globalSettings?.theme?.backgroundColor || '#FFFFFF' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {getText(data.title || 'Our Story', data.titleBn || 'আমাদের গল্প')}
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {getText(data.description || 'Every piece tells a story of craftsmanship and tradition.', data.descriptionBn || 'প্রতিটি পণ্য কারুশিল্প এবং ঐতিহ্যের গল্প বলে।')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={data.videoThumbnail || '/images/placeholder.jpg'}
                  alt="Video thumbnail"
                  className="w-full h-80 object-cover"
                />
                
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-gray-900" />
                    ) : (
                      <Play className="w-8 h-8 text-gray-900 ml-1" />
                    )}
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Benefit Icons Section
const BenefitIconsSection: React.FC<SectionProps> = ({ data, globalSettings }) => {
  const { getText } = useContext(LanguageContext)

  const iconMap = {
    award: Award,
    shield: Shield,
    truck: Truck,
    users: Users,
    heart: Heart,
    star: Star,
    gift: Gift,
    sparkles: Sparkles
  }

  return (
    <section className="py-20" style={{ backgroundColor: data.backgroundColor || globalSettings?.theme?.backgroundColor || '#F9FAFB' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {getText(data.title || 'Why Choose Us', data.titleBn || 'কেন আমাদের নির্বাচন করবেন')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {getText(data.description || 'We offer the best quality and service', data.descriptionBn || 'আমরা সেরা মানের এবং সেবা প্রদান করি')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.benefits?.map((benefit: any, index: number) => {
              const IconComponent = iconMap[benefit.icon as keyof typeof iconMap] || Award
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${globalSettings?.theme?.primaryColor || '#10B981'}20` }}
                  >
                    <IconComponent 
                      className="w-8 h-8" 
                      style={{ color: globalSettings?.theme?.primaryColor || '#10B981' }}
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

// Testimonials Section
const TestimonialsSection: React.FC<SectionProps> = ({ data, globalSettings }) => {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const { getText } = useContext(LanguageContext)

  return (
    <section className="py-20" style={{ backgroundColor: globalSettings?.theme?.backgroundColor || '#FFFFFF' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {getText(data.title || 'What Our Customers Say', data.titleBn || 'আমাদের গ্রাহকদের মতামত')}
            </h2>
            <p className="text-lg text-gray-600">
              {getText(data.description || 'Real stories from real customers', data.descriptionBn || 'সত্যিকারের গ্রাহকদের প্রকৃত গল্প')}
            </p>
          </motion.div>

          {data.testimonials?.[activeTestimonial] && (
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl shadow-xl p-8 text-center"
            >
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-xl text-gray-700 mb-8 italic leading-relaxed">
                "{data.testimonials[activeTestimonial].text}"
              </p>
              
              <div className="flex items-center justify-center">
                <img
                  src={data.testimonials[activeTestimonial].image}
                  alt={data.testimonials[activeTestimonial].name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <div className="font-semibold text-gray-900">
                    {data.testimonials[activeTestimonial].name}
                  </div>
                  <div className="text-gray-600">
                    {data.testimonials[activeTestimonial].location}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}

// Category Banner Section
const CategoryBannerSection: React.FC<SectionProps> = ({ data, globalSettings }) => {
  const { getText } = useContext(LanguageContext)

  return (
    <section className="py-20" style={{ backgroundColor: data.backgroundColor || globalSettings?.theme?.backgroundColor || '#F9FAFB' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {getText(data.title || 'Shop by Category', data.titleBn || 'ক্যাটাগরি অনুযায়ী কেনাকাটা')}
            </h2>
            <p className="text-lg text-gray-600">
              {getText(data.description || 'Find the perfect piece for every occasion', data.descriptionBn || 'প্রতিটি উপলক্ষের জন্য উপযুক্ত পণ্য খুঁজুন')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.categories?.map((category: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="relative h-80">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                      <p className="text-white/90">{category.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// FAQ Section
const FAQSection: React.FC<SectionProps> = ({ data, globalSettings }) => {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { getText } = useContext(LanguageContext)

  const filteredFAQs = data.faqs?.filter((faq: any) => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <section className="py-20" style={{ backgroundColor: globalSettings?.theme?.backgroundColor || '#FFFFFF' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {getText(data.title || 'Frequently Asked Questions', data.titleBn || 'প্রায়শই জিজ্ঞাসিত প্রশ্ন')}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {getText(data.description || 'Find answers to common questions', data.descriptionBn || 'সাধারণ প্রশ্নের উত্তর খুঁজুন')}
            </p>
            
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder={getText('Search FAQs...', 'FAQ খুঁজুন...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-3 rounded-lg"
              />
            </div>
          </motion.div>

          <div className="space-y-4">
            {filteredFAQs.map((faq: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {expandedFAQ === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                
                {expandedFAQ === faq.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-500 text-lg">
                {getText('No FAQs found', 'কোনো প্রশ্ন পাওয়া যায়নি')}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
