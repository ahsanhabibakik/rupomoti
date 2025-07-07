export interface LandingPageSection {
  id: string
  type: 'hero' | 'product-spotlight' | 'story-video' | 'benefit-icons' | 'testimonials' | 'category-banner' | 'faq' | 'order-section'
  title?: string
  enabled: boolean
  visible?: boolean
  order: number
  data: any
  content?: any
  animation?: string
  spacing?: string
}

export interface HeroSectionData {
  title: string
  subtitle: string
  description: string
  primaryButton: {
    text: string
    action: 'order' | 'scroll' | 'link'
    url?: string
    target?: string
  }
  secondaryButton?: {
    text: string
    action: 'order' | 'scroll' | 'link'
    url?: string
    target?: string
  }
  backgroundImage: string
  backgroundVideo?: string
  mobileBackgroundImage?: string
  overlay: {
    enabled: boolean
    color: string
    opacity: number
  }
  animation: {
    enabled: boolean
    type: 'fade' | 'slide' | 'zoom'
    duration: number
  }
  badges?: Array<{
    text: string
    icon?: string
    color: string
  }>
  // Bangladesh-specific
  bangladeshiFlavor: {
    showBanglaText: boolean
    banglaTitle?: string
    banglaSubtitle?: string
    showCurrency: boolean
    currencySymbol: string
    showDeliveryBadge: boolean
    deliveryText: string
  }
}

export interface ProductSpotlightData {
  title: string
  description: string
  products: Array<{
    id: string
    name: string
    price: number
    originalPrice?: number
    discount?: number
    image: string
    features: string[]
    badge?: string
    buttonText: string
  }>
  layout: 'grid' | 'carousel' | 'featured-single'
  columns: number
  showPricing: boolean
  showFeatures: boolean
  showDiscount: boolean
  showStock: boolean
  // Bangladesh-specific
  showCashOnDelivery: boolean
  showFreeDelivery: boolean
  deliveryAreas: string[]
}

export interface StoryVideoData {
  title: string
  description: string
  videoUrl: string
  videoThumbnail: string
  videoPoster: string
  story: {
    title: string
    content: string
    author?: string
    authorImage?: string
    authorTitle?: string
  }
  layout: 'video-left' | 'video-right' | 'video-top'
  showPlayButton: boolean
  autoPlay: boolean
  showControls: boolean
  // Bangladesh-specific
  showBanglaCaption: boolean
  banglaTitle?: string
  banglaDescription?: string
}

export interface BenefitIconsData {
  title: string
  description: string
  benefits: Array<{
    icon: string
    title: string
    description: string
    color: string
    banglaTitle?: string
    banglaDescription?: string
  }>
  layout: 'grid' | 'horizontal' | 'vertical'
  columns: number
  showAnimation: boolean
  animationType: 'fade' | 'slide' | 'bounce'
  backgroundColor: string
  // Bangladesh-specific common benefits
  includeFreeDelivery: boolean
  includeCashOnDelivery: boolean
  includeEasyReturn: boolean
  includeCustomerSupport: boolean
}

export interface TestimonialsData {
  title: string
  description: string
  testimonials: Array<{
    name: string
    location: string
    rating: number
    comment: string
    image?: string
    verified: boolean
    purchaseDate?: string
    productName?: string
    banglaName?: string
    banglaComment?: string
  }>
  layout: 'slider' | 'grid' | 'masonry'
  showRating: boolean
  showImages: boolean
  showLocation: boolean
  showPurchaseInfo: boolean
  autoPlay: boolean
  slideDuration: number
  // Bangladesh-specific
  showBanglaText: boolean
  includeLocationBadges: boolean
  locationBadges: Array<{
    area: string
    color: string
  }>
}

export interface CategoryBannerData {
  title: string
  description: string
  categories: Array<{
    id: string
    name: string
    image: string
    discount?: number
    productCount?: number
    badge?: string
    url: string
    banglaName?: string
  }>
  layout: 'horizontal' | 'grid' | 'carousel'
  showProductCount: boolean
  showDiscount: boolean
  showBadges: boolean
  animation: {
    enabled: boolean
    type: 'fade' | 'slide' | 'zoom'
    stagger: boolean
  }
  // Bangladesh-specific
  showSeasonalOffers: boolean
  seasonalOffers: Array<{
    title: string
    description: string
    validUntil: string
    discount: number
    banglaTitle?: string
  }>
}

export interface FAQData {
  title: string
  description: string
  faqs: Array<{
    question: string
    answer: string
    category: string
    banglaQuestion?: string
    banglaAnswer?: string
  }>
  categories: string[]
  showCategories: boolean
  showSearch: boolean
  defaultOpen: boolean
  accordionType: 'single' | 'multiple'
  // Bangladesh-specific FAQs
  includeBangladeshFAQs: boolean
  bangladeshFAQs: Array<{
    question: string
    answer: string
    banglaQuestion: string
    banglaAnswer: string
  }>
}

export interface LandingPageData {
  id: string
  productId: string
  sections: LandingPageSection[]
  globalSettings: {
    theme: {
      primaryColor: string
      secondaryColor: string
      accentColor: string
      backgroundColor: string
      textColor: string
      fontFamily: string
    }
    layout: {
      maxWidth: string
      spacing: string
      borderRadius: string
    }
    animations: {
      enabled: boolean
      duration: number
      easing: string
    }
    // Bangladesh-specific global settings
    bangladeshSettings: {
      showBanglaText: boolean
      language: 'en' | 'bn'
      currency: string
      deliveryAreas: string[]
      paymentMethods: string[]
      supportLanguages: string[]
    }
  }
  seo: {
    title: string
    description: string
    keywords: string[]
    ogImage: string
    banglaTitle?: string
    banglaDescription?: string
  }
  published: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
}
