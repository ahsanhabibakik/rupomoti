// Force dynamic rendering for product pages (real-time stock, pricing)
export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProduct } from '@/lib/actions/product-actions'
import { ProductDetails } from './_components/product-details'
import { ProductLandingPage } from './_components/product-landing-page'
import { ReviewSection } from './_components/review-section'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    }
  }

  return {
    title: `${product.name} - Rupomoti`,
    description: product.description || `Discover ${product.name} from our premium pearl jewelry collection.`,
    openGraph: {
      title: `${product.name} - Rupomoti`,
      description: product.description || `Discover ${product.name} from our premium pearl jewelry collection.`,
      images: [
        {
          url: product.images[0] || '/images/og-image.png',
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  // Check if product should use landing page design
  const isLandingPage = product.designType === 'LANDING_PAGE'

  if (isLandingPage) {
    return <ProductLandingPage product={product} />
  }

  return (
    <>
      <ProductDetails product={product} />
      <div className="container mx-auto px-4 py-8">
        <ReviewSection
          productId={product.id}
          productSlug={product.slug}
          initialReviews={product.reviews}
        />
      </div>
    </>
  )
} 