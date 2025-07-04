'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { LandingPageBuilder, type LandingPageData } from '@/components/admin/LandingPageBuilder'
import { showToast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function LandingPageBuilderPage() {
  const params = useParams()
  const productId = params?.id as string
  
  const [data, setData] = useState<LandingPageData | null>(null)
  const [product, setProduct] = useState<{ id: string; name: string; slug: string } | null>(null)
  const [loading, setLoading] = useState(true)

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
    try {
      const response = await fetch(`/api/admin/products/${productId}/landing-page/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      })

      if (response.ok) {
        setData(newData)
        showToast.success('Landing page saved successfully')
      } else {
        showToast.error('Failed to save landing page')
      }
    } catch (error) {
      console.error('Save error:', error)
      showToast.error('Failed to save landing page')
    }
  }

  const handlePreview = (previewData: LandingPageData) => {
    // Save as draft first, then open preview
    handleSave(previewData).then(() => {
      window.open(`/product/${product?.slug}?preview=true`, '_blank')
    })
  }

  const handlePublish = async (publishData: LandingPageData) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/landing-page/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(publishData),
      })

      if (response.ok) {
        setData(publishData)
        showToast.success('Landing page published successfully')
        
        // Redirect to product page
        setTimeout(() => {
          window.open(`/product/${product?.slug}`, '_blank')
        }, 1000)
      } else {
        showToast.error('Failed to publish landing page')
      }
    } catch (error) {
      console.error('Publish error:', error)
      showToast.error('Failed to publish landing page')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading landing page builder...</p>
        </div>
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
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/products">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Landing Page Builder
              </h1>
              <p className="text-sm text-gray-600">
                {product.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/product/${product.slug}`} target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Product Page
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Builder */}
      <div className="h-[calc(100vh-81px)]">
        <LandingPageBuilder
          productId={productId}
          initialData={data || undefined}
          onSave={handleSave}
          onPreview={handlePreview}
          onPublish={handlePublish}
        />
      </div>
    </div>
  )
}
