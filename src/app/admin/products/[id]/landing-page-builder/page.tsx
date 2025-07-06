'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { LandingPageBuilder } from '@/components/admin/LandingPageBuilder'
import { showToast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink, Eye, Save, Globe } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LandingPageData } from '@/types/landing-page'

export default function LandingPageBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params?.id as string
  
  const [data, setData] = useState<LandingPageData | null>(null)
  const [product, setProduct] = useState<{ id: string; name: string; slug: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch product details
        const productRes = await fetch(`/api/admin/products/${productId}`)
        if (productRes.ok) {
          const productData = await productRes.json()
          setProduct(productData)
        }

        // Fetch landing page data
        const draftRes = await fetch(`/api/admin/products/${productId}/landing-page/draft`)
        if (draftRes.ok) {
          const draftData = await draftRes.json()
          if (draftData.success && draftData.data) {
            setData(draftData.data)
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        showToast.error('Failed to load landing page data')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchData()
    }
  }, [productId])

  const handleSave = async (newData: LandingPageData) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}/landing-page/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      })

      if (response.ok) {
        const result = await response.json()
        setData(newData)
        showToast.success('Landing page draft saved successfully!')
        return result
      } else {
        throw new Error('Failed to save draft')
      }
    } catch (error) {
      console.error('Save error:', error)
      showToast.error('Failed to save landing page draft')
      throw error
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async (newData: LandingPageData) => {
    setPublishing(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}/landing-page/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      })

      if (response.ok) {
        const result = await response.json()
        setData({ ...newData, published: true })
        showToast.success('Landing page published successfully!')
        return result
      } else {
        throw new Error('Failed to publish')
      }
    } catch (error) {
      console.error('Publish error:', error)
      showToast.error('Failed to publish landing page')
      throw error
    } finally {
      setPublishing(false)
    }
  }

  const handlePreview = async (newData: LandingPageData) => {
    // Save as draft first
    await handleSave(newData)
    
    // Open preview in new tab
    const previewUrl = `/product/${product?.slug}?preview=true`
    window.open(previewUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Button asChild>
            <Link href="/admin/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/products">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Landing Page Builder
              </h1>
              <p className="text-gray-600">
                {product?.name || 'Loading...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {data?.published && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <Globe className="h-3 w-3 mr-1" />
                Published
              </Badge>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => data && handlePreview(data)}
              disabled={!data}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            
            {product?.slug && data?.published && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/product/${product.slug}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Live
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {data ? (
          <LandingPageBuilder
            initialData={data}
            productId={productId}
            onSave={handleSave}
            onPublish={handlePublish}
            onPreview={handlePreview}
          />
        ) : (
          <div className="flex items-center justify-center min-h-[600px]">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-2">Create Landing Page</CardTitle>
                <CardDescription>
                  Build a beautiful, conversion-focused landing page for your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Hero Section</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Product Spotlight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Story & Video</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Benefits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Testimonials</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Categories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>FAQ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span>Bangladesh Focus</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => {
                    // Initialize with default data
                    const defaultData: LandingPageData = {
                      id: '',
                      productId,
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
                        title: `${product?.name} - Rupomoti`,
                        description: 'Premium jewelry collection',
                        keywords: ['jewelry', 'bangladesh', 'pearl'],
                        ogImage: '/images/og-image.jpg'
                      },
                      published: false,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    }
                    setData(defaultData)
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Start Building
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
