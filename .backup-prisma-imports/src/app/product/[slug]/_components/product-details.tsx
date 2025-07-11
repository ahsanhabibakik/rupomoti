'use client'

import Link from 'next/link'
import { Star, Shield, Truck, Package, Heart, Share2, Info, Award, CheckCircle } from 'lucide-react'
import { ProductImageGallery } from './product-image-gallery'
import { AddToCartButton } from './add-to-cart-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { type Prisma } from '@prisma/client'

type ProductWithCategoryAndReviews = Prisma.ProductGetPayload<{
  include: {
    category: true,
    reviews: {
      include: {
        user: {
          select: {
            name: true,
            image: true,
          }
        }
      }
    }
  }
}>

interface ProductDetailsProps {
  product: ProductWithCategoryAndReviews
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0

  const discountPercentage = product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0

  return (
    <div className="bg-gradient-to-br from-slate-50 to-orange-50/30 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProductImageGallery images={product.images.map(img => ({ url: img, id: img }))} productName={product.name} />
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            <div>
              {product.category && (
                <Link href={`/shop?category=${product.category.slug}`} className="inline-block">
                  <Badge variant="secondary" className="mb-3 bg-orange-100 text-orange-800 hover:bg-orange-200">
                    {product.category.name}
                  </Badge>
                </Link>
              )}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < averageRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({product.reviews.length} reviews)</span>
                {averageRating > 0 && (
                  <span className="text-sm font-semibold text-gray-800">{averageRating.toFixed(1)}</span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-orange-600">
                  ৳{product.salePrice?.toLocaleString() ?? product.price.toLocaleString()}
                </span>
                {product.salePrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">৳{product.price.toLocaleString()}</span>
                    <Badge className="bg-red-500 text-white">Save {discountPercentage}%</Badge>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>

              {/* Key Features */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-orange-500" />
                    Key Features
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Authentic Materials</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Premium Quality</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Handcrafted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Certificate Included</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Details */}
              {(product.material || product.weight || product.dimensions) && (
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-500" />
                      Product Details
                    </h3>
                    <div className="space-y-2">
                      {product.material && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Material:</span>
                          <span className="text-sm font-medium text-gray-900">{product.material}</span>
                        </div>
                      )}
                      {product.weight && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Weight:</span>
                          <span className="text-sm font-medium text-gray-900">{product.weight}g</span>
                        </div>
                      )}
                      {product.dimensions && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Dimensions:</span>
                          <span className="text-sm font-medium text-gray-900">{product.dimensions}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">SKU:</span>
                        <span className="text-sm font-medium text-gray-900 font-mono">{product.sku}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              <AddToCartButton product={product} />
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="flex-1">
                  <Heart className="w-4 h-4 mr-2" />
                  Add to Wishlist
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <Card className="bg-gradient-to-r from-orange-50 to-rose-50 border-orange-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <Truck className="w-6 h-6 text-orange-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">Fast Delivery</span>
                    <span className="text-xs text-gray-600">1-2 Days</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Shield className="w-6 h-6 text-orange-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">Secure Payment</span>
                    <span className="text-xs text-gray-600">100% Safe</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Package className="w-6 h-6 text-orange-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">Premium Packaging</span>
                    <span className="text-xs text-gray-600">Gift Ready</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 