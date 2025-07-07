'use client'

import { LandingPageRenderer } from '@/components/landing-page/LandingPageRenderer'
import { LandingPageData } from '@/types/landing-page'

// Sample landing page data showcasing all 7 sections with Bangladesh focus
const sampleLandingPageData: LandingPageData = {
  id: 'preview-demo',
  productId: 'demo-product',
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      enabled: true,
      order: 1,
      data: {
        title: 'Premium Pearl Jewelry Collection',
        subtitle: 'প্রিমিয়াম পার্ল জুয়েলারি কালেকশন',
        description: 'Discover our exquisite collection of handcrafted pearl jewelry, designed for the modern Bangladeshi woman. Premium quality, authentic pearls, and elegant designs.',
        primaryButton: {
          text: 'অর্ডার করুন এখনই',
          action: 'order'
        },
        secondaryButton: {
          text: 'কালেকশন দেখুন',
          action: 'scroll'
        },
        backgroundImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        mobileBackgroundImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        overlay: {
          enabled: true,
          color: '#000000',
          opacity: 0.4
        },
        animation: {
          enabled: true,
          type: 'fade',
          duration: 1000
        },
        badges: [
          { text: 'ফ্রি ডেলিভারি', icon: 'truck', color: '#10B981' },
          { text: 'ক্যাশ অন ডেলিভারি', icon: 'credit-card', color: '#F59E0B' },
          { text: '১০০% অরিজিনাল', icon: 'check-circle', color: '#EF4444' }
        ],
        bangladeshiFlavor: {
          showBanglaText: true,
          banglaTitle: 'প্রিমিয়াম পার্ল জুয়েলারি',
          banglaSubtitle: 'হাতে তৈরি মুক্তার গয়না',
          showCurrency: true,
          currencySymbol: '৳',
          showDeliveryBadge: true,
          deliveryText: 'ঢাকায় ২৪ ঘণ্টায় ডেলিভারি'
        }
      }
    },
    {
      id: 'product-spotlight-1',
      type: 'product-spotlight',
      enabled: true,
      order: 2,
      data: {
        title: 'বিশেষ অফার পণ্য',
        description: 'আমাদের সবচেয়ে জনপ্রিয় পার্ল জুয়েলারি কালেকশন দেখুন',
        products: [
          {
            id: '1',
            name: 'Elegant Pearl Necklace',
            price: 3500,
            originalPrice: 4500,
            discount: 22,
            image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            features: ['১০০% অরিজিনাল পার্ল', 'হ্যান্ডক্র্যাফটেড', 'লাইফটাইম গ্যারান্টি'],
            badge: 'বেস্ট সেলার',
            buttonText: 'অর্ডার করুন'
          },
          {
            id: '2',
            name: 'Pearl Drop Earrings',
            price: 2200,
            originalPrice: 2800,
            discount: 21,
            image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            features: ['সিলভার বেস', 'অ্যান্টি-অ্যালার্জিক', 'ওয়াটারপ্রুফ'],
            badge: 'নতুন',
            buttonText: 'অর্ডার করুন'
          },
          {
            id: '3',
            name: 'Pearl Bracelet Set',
            price: 2800,
            originalPrice: 3500,
            discount: 20,
            image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            features: ['অ্যাডজাস্টেবল সাইজ', 'গিফট বক্স ফ্রি', 'এক বছরের ওয়ারেন্টি'],
            badge: 'জনপ্রিয়',
            buttonText: 'অর্ডার করুন'
          }
        ],
        layout: 'grid',
        columns: 3,
        showPricing: true,
        showFeatures: true,
        showDiscount: true,
        showStock: true,
        showCashOnDelivery: true,
        showFreeDelivery: true,
        deliveryAreas: ['ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'খুলনা', 'রাজশাহী', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ']
      }
    },
    {
      id: 'story-video-1',
      type: 'story-video',
      enabled: true,
      order: 3,
      data: {
        title: 'Our Story of Excellence',
        description: 'কীভাবে আমরা বাংলাদেশের সেরা পার্ল জুয়েলারি ব্র্যান্ড হয়ে উঠলাম',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        videoThumbnail: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        videoPoster: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        story: {
          title: 'Traditional Craftsmanship Meets Modern Design',
          content: 'Our journey began in the heart of Dhaka, where skilled artisans have been crafting jewelry for generations. We combine traditional Bangladeshi craftsmanship with contemporary design to create pieces that reflect the beauty and elegance of modern Bangladesh. Each piece is carefully handcrafted with love and attention to detail.',
          author: 'রহিমা খাতুন',
          authorImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b829?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
          authorTitle: 'Founder & Master Craftsperson'
        },
        layout: 'video-left',
        showPlayButton: true,
        autoPlay: false,
        showControls: true,
        showBanglaCaption: true,
        banglaTitle: 'আমাদের গল্প',
        banglaDescription: 'ঐতিহ্যবাহী কারিগরী দক্ষতা এবং আধুনিক ডিজাইনের নিখুঁত মিলন'
      }
    },
    {
      id: 'benefit-icons-1',
      type: 'benefit-icons',
      enabled: true,
      order: 4,
      data: {
        title: 'কেন আমাদের বেছে নিবেন?',
        description: 'আমরা আপনাকে সেরা সার্ভিস এবং গুণমান নিশ্চিত করি',
        benefits: [
          {
            icon: 'truck',
            title: 'ফ্রি ডেলিভারি',
            description: 'সারাদেশে ফ্রি হোম ডেলিভারি',
            color: '#10B981',
            banglaTitle: 'ফ্রি ডেলিভারি',
            banglaDescription: 'সারাদেশে ফ্রি হোম ডেলিভারি'
          },
          {
            icon: 'credit-card',
            title: 'ক্যাশ অন ডেলিভারি',
            description: 'হাতে পেয়ে টাকা দিন',
            color: '#F59E0B',
            banglaTitle: 'ক্যাশ অন ডেলিভারি',
            banglaDescription: 'হাতে পেয়ে টাকা দিন'
          },
          {
            icon: 'check-circle',
            title: '১০০% অরিজিনাল',
            description: 'সম্পূর্ণ অরিজিনাল পণ্যের গ্যারান্টি',
            color: '#EF4444',
            banglaTitle: '১০০% অরিজিনাল',
            banglaDescription: 'সম্পূর্ণ অরিজিনাল পণ্যের গ্যারান্টি'
          },
          {
            icon: 'phone',
            title: '২৪/৭ কাস্টমার সাপোর্ট',
            description: 'যেকোনো সময় আমাদের সাথে যোগাযোগ করুন',
            color: '#8B5CF6',
            banglaTitle: '২৪/৭ কাস্টমার সাপোর্ট',
            banglaDescription: 'যেকোনো সময় আমাদের সাথে যোগাযোগ করুন'
          }
        ],
        layout: 'grid',
        columns: 4,
        showAnimation: true,
        animationType: 'fade',
        backgroundColor: '#F9FAFB',
        includeFreeDelivery: true,
        includeCashOnDelivery: true,
        includeEasyReturn: true,
        includeCustomerSupport: true
      }
    },
    {
      id: 'testimonials-1',
      type: 'testimonials',
      enabled: true,
      order: 5,
      data: {
        title: 'কাস্টমার রিভিউ',
        description: 'আমাদের সন্তুষ্ট কাস্টমারদের মতামত দেখুন',
        testimonials: [
          {
            name: 'রিনা খান',
            location: 'ঢাকা, বাংলাদেশ',
            rating: 5,
            comment: 'অসাধারণ গুণমান! পার্লের কাজ খুবই সুন্দর। দাম অনুযায়ী অনেক ভালো পণ্য পেয়েছি।',
            image: 'https://images.unsplash.com/photo-1494790108755-2616b612b829?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
            verified: true,
            purchaseDate: '2024-01-15',
            productName: 'Pearl Necklace Set',
            banglaName: 'রিনা খান',
            banglaComment: 'অসাধারণ গুণমান! পার্লের কাজ খুবই সুন্দর।'
          },
          {
            name: 'সাবিনা আক্তার',
            location: 'চট্টগ্রাম, বাংলাদেশ',
            rating: 5,
            comment: 'দারুণ সার্ভিস! সময়মতো ডেলিভারি পেয়েছি। প্যাকেজিং খুবই সুন্দর ছিল।',
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
            verified: true,
            purchaseDate: '2024-02-20',
            productName: 'Pearl Earrings',
            banglaName: 'সাবিনা আক্তার',
            banglaComment: 'দারুণ সার্ভিস! সময়মতো ডেলিভারি পেয়েছি।'
          },
          {
            name: 'ফাতেমা বেগম',
            location: 'সিলেট, বাংলাদেশ',
            rating: 5,
            comment: 'বিয়ের জন্য নিয়েছিলাম। সবাই প্রশংসা করেছে। দাম খুবই রিজনেবল।',
            image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
            verified: true,
            purchaseDate: '2024-03-10',
            productName: 'Bridal Pearl Set',
            banglaName: 'ফাতেমা বেগম',
            banglaComment: 'বিয়ের জন্য নিয়েছিলাম। সবাই প্রশংসা করেছে।'
          }
        ],
        layout: 'slider',
        showRating: true,
        showImages: true,
        showLocation: true,
        showPurchaseInfo: true,
        autoPlay: true,
        slideDuration: 5000,
        showBanglaText: true,
        includeLocationBadges: true,
        locationBadges: [
          { area: 'ঢাকা', color: '#10B981' },
          { area: 'চট্টগ্রাম', color: '#F59E0B' },
          { area: 'সিলেট', color: '#EF4444' }
        ]
      }
    },
    {
      id: 'category-banner-1',
      type: 'category-banner',
      enabled: true,
      order: 6,
      data: {
        title: 'আমাদের কালেকশন',
        description: 'বিভিন্ন ধরনের পার্ল জুয়েলারি দেখুন',
        categories: [
          {
            id: '1',
            name: 'Necklaces',
            image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            discount: 25,
            productCount: 45,
            badge: 'জনপ্রিয়',
            url: '/shop/necklaces',
            banglaName: 'হার'
          },
          {
            id: '2',
            name: 'Earrings',
            image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            discount: 20,
            productCount: 32,
            badge: 'নতুন',
            url: '/shop/earrings',
            banglaName: 'কানের দুল'
          },
          {
            id: '3',
            name: 'Bracelets',
            image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            discount: 30,
            productCount: 28,
            badge: 'সেল',
            url: '/shop/bracelets',
            banglaName: 'ব্রেসলেট'
          }
        ],
        layout: 'grid',
        showProductCount: true,
        showDiscount: true,
        showBadges: true,
        animation: {
          enabled: true,
          type: 'fade',
          stagger: true
        },
        showSeasonalOffers: true,
        seasonalOffers: [
          {
            title: 'Winter Wedding Collection',
            description: 'Up to 35% off on bridal jewelry',
            validUntil: '2024-12-31',
            discount: 35,
            banglaTitle: 'শীতকালীন বিয়ের কালেকশন'
          }
        ]
      }
    },
    {
      id: 'faq-1',
      type: 'faq',
      enabled: true,
      order: 7,
      data: {
        title: 'প্রায়শই জিজ্ঞাসিত প্রশ্ন',
        description: 'আপনার সব প্রশ্নের উত্তর এখানে পাবেন',
        faqs: [
          {
            question: 'How long does delivery take?',
            answer: 'We deliver within 24 hours in Dhaka and 2-3 days in other cities across Bangladesh.',
            category: 'Delivery',
            banglaQuestion: 'ডেলিভারি কত সময় লাগে?',
            banglaAnswer: 'ঢাকায় ২৪ ঘণ্টায় এবং অন্যান্য শহরে ২-৩ দিনে ডেলিভারি করি।'
          },
          {
            question: 'Do you offer cash on delivery?',
            answer: 'Yes, we accept cash on delivery for all orders across Bangladesh.',
            category: 'Payment',
            banglaQuestion: 'ক্যাশ অন ডেলিভারি সুবিধা আছে কি?',
            banglaAnswer: 'হ্যাঁ, আমরা সব অর্ডারে ক্যাশ অন ডেলিভারি গ্রহণ করি।'
          },
          {
            question: 'Are your pearls genuine?',
            answer: 'Yes, all our pearls are 100% genuine and come with authenticity certificates.',
            category: 'Product',
            banglaQuestion: 'আপনাদের পার্ল কি আসল?',
            banglaAnswer: 'হ্যাঁ, আমাদের সব পার্ল ১০০% আসল এবং সার্টিফিকেট সহ দেওয়া হয়।'
          },
          {
            question: 'What is your return policy?',
            answer: 'We offer 7-day return policy with full refund if you are not satisfied.',
            category: 'Returns',
            banglaQuestion: 'রিটার্ন পলিসি কী?',
            banglaAnswer: 'সন্তুষ্ট না হলে ৭ দিনের মধ্যে সম্পূর্ণ টাকা ফেরত।'
          }
        ],
        categories: ['Delivery', 'Payment', 'Product', 'Returns'],
        showCategories: true,
        showSearch: true,
        defaultOpen: false,
        accordionType: 'single',
        includeBangladeshFAQs: true,
        bangladeshFAQs: [
          {
            question: 'Do you deliver outside Dhaka?',
            answer: 'Yes, we deliver nationwide across all 8 divisions of Bangladesh.',
            banglaQuestion: 'ঢাকার বাইরে ডেলিভারি করেন?',
            banglaAnswer: 'হ্যাঁ, আমরা বাংলাদেশের সব বিভাগে ডেলিভারি করি।'
          }
        ]
      }
    }
  ],
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
      deliveryAreas: ['ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'খুলনা', 'রাজশাহী', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ'],
      paymentMethods: ['Cash on Delivery', 'bKash', 'Nagad', 'Rocket', 'Bank Transfer'],
      supportLanguages: ['Bengali', 'English']
    }
  },
  seo: {
    title: 'Premium Pearl Jewelry - Bangladesh\'s Best Collection',
    description: 'Discover exquisite pearl jewelry collection with free delivery across Bangladesh',
    keywords: ['pearl jewelry', 'bangladesh', 'pearl necklace', 'pearl earrings', 'handcrafted jewelry'],
    ogImage: '/images/og-pearl-jewelry.jpg',
    banglaTitle: 'প্রিমিয়াম পার্ল জুয়েলারি - বাংলাদেশের সেরা কালেকশন',
    banglaDescription: 'বাংলাদেশের সেরা পার্ল জুয়েলারি কালেকশন - ফ্রি ডেলিভারি সহ'
  },
  published: true,
  publishedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export default function LandingPagePreview() {
  const handleAddToCart = (productId: string, quantity: number) => {
    alert(`Added product ${productId} (quantity: ${quantity}) to cart!`)
  }

  const handleAddToWishlist = (productId: string) => {
    alert(`Added product ${productId} to wishlist!`)
  }

  const handleOrderNow = (productId: string) => {
    alert(`Ordering product ${productId} now!`)
  }

  return (
    <div className="min-h-screen">
      {/* Preview Header */}
      <div className="bg-blue-600 text-white py-3 px-4 text-center text-sm font-medium">
        🎨 <strong>Landing Page Preview</strong> - This is how your beautiful Bangladesh-focused landing page will look!
      </div>
      
      <LandingPageRenderer
        data={sampleLandingPageData}
        productId="demo-product"
        onAddToCart={handleAddToCart}
        onAddToWishlist={handleAddToWishlist}
        onOrderNow={handleOrderNow}
      />
    </div>
  )
}
