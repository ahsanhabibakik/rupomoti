import 'server-only'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProduct, getRelatedProducts } from '@/lib/actions/product-actions'
import { getReviewsForProduct } from '@/lib/actions/review-actions'

import { Star, Shield, Truck, Package } from 'lucide-react'
import { ProductImageGallery } from './_components/product-image-gallery'
import { AddToCartButton } from './_components/add-to-cart-button'
import { ReviewSection } from './_components/review-section'
import { ProductCard } from '@/components/products/ProductCard'

type ProductPageProps = {
  params: {
    slug: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }
  
  // These can be fetched in parallel
  const [reviews, relatedProducts] = await Promise.all([
    getReviewsForProduct(product.id),
    getRelatedProducts(product.id, product.categoryId)
  ])

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          <ProductImageGallery images={product.images} productName={product.name} />

          <div className="flex flex-col gap-6">
            <div>
              {product.category && (
                <Link href={`/shop?category=${product.category.slug}`} className="text-sm text-primary hover:underline">
                  {product.category.name}
                </Link>
              )}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-1 mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < averageRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({reviews.length} reviews)</span>
              </div>

              <p className="text-gray-700 leading-relaxed mb-4">{product.description}</p>
              
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-primary">৳{product.salePrice?.toLocaleString() ?? product.price.toLocaleString()}</span>
                {product.salePrice && (
                  <span className="text-xl text-gray-400 line-through">৳{product.price.toLocaleString()}</span>
                )}
              </div>
            </div>

            <AddToCartButton product={product} />

            <div className="border-t pt-6">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <span>Premium Packaging</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <ReviewSection productId={product.id} productSlug={product.slug} initialReviews={reviews} />
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={{...p, category: p.category || { name: '', slug: '' }}} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 