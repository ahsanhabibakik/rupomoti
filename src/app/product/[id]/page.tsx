'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/redux/hooks'
import { addToCart, toggleCart } from '@/redux/slices/cartSlice'
import { showToast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { Star } from 'lucide-react'

// Mock product data - replace with your actual data fetching logic
const product = {
  id: '1',
  name: 'Classic Pearl Necklace',
  description: 'Elegant single-strand freshwater pearl necklace with sterling silver clasp',
  price: 2999,
  images: [
    '/images/products/necklace1.jpg',
    '/images/products/necklace2.jpg',
    '/images/products/necklace3.jpg',
    '/images/products/necklace4.jpg',
  ],
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [reviews, setReviews] = useState<any[]>([])
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewError, setReviewError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { data: session } = useSession()
  const dispatch = useAppDispatch()

  // Fetch reviews
  useEffect(() => {
    fetch(`/api/reviews?productId=${params.id}`)
      .then(r => r.json())
      .then(setReviews)
  }, [params.id])

  // Check if user can review (mock: always true for now)
  const canReview = session?.user && !reviews.some(r => r.userId === session.user.id)

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
      category: 'necklaces',
    }))
    dispatch(toggleCart())
    showToast.success(`${product.name} has been added to your cart.`)
  }

  const handleSubmitReview = async (e: any) => {
    e.preventDefault()
    setSubmitting(true)
    setReviewError('')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: params.id, rating: reviewRating, comment: reviewText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit review')
      setReviews([data, ...reviews])
      setShowReviewModal(false)
      setReviewText('')
      setReviewRating(5)
      showToast.success('Review submitted!')
    } catch (err: any) {
      setReviewError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border">
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  'relative aspect-square overflow-hidden rounded-lg border',
                  selectedImage === index && 'ring-2 ring-primary'
                )}
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
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{product.description}</p>
          </div>

          <div className="space-y-4">
            <div className="text-3xl font-bold">৳{product.price.toLocaleString()}</div>
            <Button size="lg" onClick={handleAddToCart}>
              Add to Cart
            </Button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Product Details</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Freshwater pearls</li>
              <li>Sterling silver clasp</li>
              <li>Adjustable length</li>
              <li>Handcrafted in Bangladesh</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Shipping Information</h2>
            <div className="prose text-muted-foreground">
              <p>Free shipping on orders over ৳10,000</p>
              <p>Delivery within 3-5 business days</p>
              <p>30-day return policy</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <div className="text-gray-500 mb-4">No reviews yet.</div>
        ) : (
          <div className="space-y-6 mb-8">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Image src={review.user?.image || '/images/default-avatar.png'} alt={review.user?.name || 'User'} width={32} height={32} className="rounded-full" />
                  <span className="font-medium">{review.user?.name || 'User'}</span>
                  <span className="flex items-center ml-2 text-yellow-500">
                    {[...Array(5)].map((_, i) => <Star key={i} className={i < review.rating ? 'fill-yellow-400' : 'stroke-yellow-400'} size={16} />)}
                  </span>
                  <span className="ml-auto text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-gray-700">{review.comment}</div>
              </div>
            ))}
          </div>
        )}
        {canReview && (
          <Button onClick={() => setShowReviewModal(true)} className="mb-4">Write a Review</Button>
        )}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <form onSubmit={handleSubmitReview} className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Write a Review</h3>
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map((star) => (
                  <button type="button" key={star} onClick={() => setReviewRating(star)}>
                    <Star size={28} className={star <= reviewRating ? 'fill-yellow-400' : 'stroke-yellow-400'} />
                  </button>
                ))}
                <span className="ml-2">{reviewRating} / 5</span>
              </div>
              <textarea
                className="w-full border rounded-lg p-2"
                rows={4}
                placeholder="Share your experience..."
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                required
                disabled={submitting}
              />
              {reviewError && <div className="text-red-500 text-sm">{reviewError}</div>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowReviewModal(false)} disabled={submitting}>Cancel</Button>
                <Button type="submit" loading={submitting}>Submit</Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
} 