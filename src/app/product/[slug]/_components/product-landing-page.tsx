'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Star, 
  Shield, 
  Truck, 
  CheckCircle,
  Users,
  Award,
  Heart,
  Share2,
  ShoppingCart,
  Plus,
  Minus,
  Clock,
  Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
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

interface ProductLandingPageProps {
  product: ProductWithCategoryAndReviews
}

export function ProductLandingPage({ product }: ProductLandingPageProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')

  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 4.8

  const discountPercentage = product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 via-rose-100/20 to-amber-100/20">
          <div className="absolute inset-0 bg-[url('/images/pearl-pattern.svg')] opacity-5"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={product.images[selectedImage] || '/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {product.salePrice && (
                  <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                    {discountPercentage}% OFF
                  </Badge>
                )}
              </div>
              
              {product.images.length > 1 && (
                <div className="flex gap-2 justify-center">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index ? 'border-orange-500 shadow-lg' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Category & Title */}
              <div>
                {product.category && (
                  <Link 
                    href={`/shop?category=${product.category.slug}`}
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm uppercase tracking-wider"
                  >
                    {product.category.name}
                  </Link>
                )}
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-2 mb-4">
                  {product.name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-6 h-6 ${i < averageRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-700">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ({product.reviews.length} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-4xl font-bold text-orange-600">
                  ৳{product.salePrice?.toLocaleString() ?? product.price.toLocaleString()}
                </span>
                {product.salePrice && (
                  <span className="text-2xl text-gray-400 line-through">
                    ৳{product.price.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-lg text-gray-700 leading-relaxed">
                {product.description}
              </p>

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-4 py-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Authentic Materials</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  <span className="text-sm">Premium Quality</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">Lifetime Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-orange-500" />
                  <span className="text-sm">Free Shipping</span>
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold">Quantity:</span>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    size="lg" 
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button size="lg" variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex border-b mb-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'details', label: 'Details' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'care', label: 'Care Instructions' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'border-b-2 border-orange-500 text-orange-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="py-8">
              {activeTab === 'description' && (
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
              
              {activeTab === 'details' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-semibold">Material:</span>
                      <span>{product.material || 'Premium Materials'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Weight:</span>
                      <span>{product.weight ? `${product.weight}g` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Dimensions:</span>
                      <span>{product.dimensions || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-semibold">SKU:</span>
                      <span className="font-mono text-sm">{product.sku}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Stock:</span>
                      <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {product.reviews.length > 0 ? (
                    product.reviews.map(review => (
                      <Card key={review.id} className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{review.user.name}</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No reviews yet. Be the first to review this product!
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'care' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Care Instructions</h3>
                  <div className="prose prose-gray max-w-none">
                    <ul className="space-y-2">
                      <li>Store in a cool, dry place away from direct sunlight</li>
                      <li>Clean gently with a soft, lint-free cloth</li>
                      <li>Avoid contact with chemicals, perfumes, and lotions</li>
                      <li>Store separately to prevent scratching</li>
                      <li>Have it professionally cleaned periodically</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-gradient-to-r from-orange-50 to-rose-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Authentic Guarantee</h3>
              <p className="text-gray-600">100% authentic products with certificate</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Truck className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Free Shipping</h3>
              <p className="text-gray-600">Free shipping on orders over ৳5000</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Quick Delivery</h3>
              <p className="text-gray-600">Express delivery within 1-2 days</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Premium Quality</h3>
              <p className="text-gray-600">Handcrafted with finest materials</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <Crown className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Experience Luxury Like Never Before
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            Join thousands of satisfied customers who trust Rupomoti for their precious moments
          </p>
          <Button size="lg" variant="outline" className="bg-white text-orange-600 hover:bg-orange-50">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Shop Now
          </Button>
        </div>
      </section>
    </div>
  )
}
