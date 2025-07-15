'use client'

import { useState, useTransition } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'
import { showToast } from '@/lib/toast'
import { type getReviewsForProduct } from '@/lib/actions/review-actions'

// Removed direct import of createReview

type Review = Awaited<ReturnType<typeof getReviewsForProduct>>[0]

interface ReviewSectionProps {
  productId: string
  productSlug: string
  initialReviews?: Review[]
}

export function ReviewSection({ productId, productSlug, initialReviews = [] }: ReviewSectionProps) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState(initialReviews)
  const [isPending, startTransition] = useTransition()

  const handleReviewSubmit = async (formData: FormData) => {
    if (!session) {
      showToast.error('You must be logged in to leave a review.')
      return
    }

    const newReview = {
      id: Math.random().toString(), // temporary ID
      comment: formData.get('comment') as string,
      rating: parseInt(formData.get('rating') as string, 10),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: session.user.id || '',
      productId: productId,
      user: {
        name: session.user.name || null,
        image: session.user.image || null,
      },
    }

    startTransition(async () => {
      setReviews(prev => [newReview, ...prev]);
      // Call the new server action endpoint
      const response = await fetch(`/products/${productSlug}/review-action`, {
        method: 'POST',
        body: formData,
      })
      let result = null
      try {
        result = await response.json()
      } catch {}
      if (!response.ok || result?.error) {
        showToast.error(result?.error || 'Failed to submit review')
        setReviews(prev => prev.filter(r => r.id !== newReview.id)); // remove optimistic update
      } else {
        showToast.success('Review submitted successfully!')
      }
    })
  }

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>
      
      {session && <ReviewForm productId={productId} productSlug={productSlug} onSubmit={handleReviewSubmit} isPending={isPending} />}

      <div className="space-y-8 mt-8">
        {reviews.map(review => (
          <div key={review.id} className="flex gap-4">
            <Image 
              src={review.user.image || '/images/default-avatar.png'} 
              alt={review.user.name || 'User avatar'}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{review.user.name}</p>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-2">{new Date(review.createdAt).toLocaleDateString()}</p>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-center text-gray-500 py-8">No reviews yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </div>
  )
}

interface ReviewFormProps {
  productId: string
  productSlug: string
  onSubmit: (formData: FormData) => void
  isPending: boolean
}

function ReviewForm({ productId, productSlug, onSubmit, isPending }: ReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    formData.set('rating', rating.toString());
    onSubmit(formData);
    setComment('');
    setRating(5);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-6 border rounded-lg bg-gray-50">
      <h4 className="font-semibold mb-4">Write a review</h4>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productSlug" value={productSlug} />
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, i) => (
          <button key={i} type="button" onClick={() => setRating(i + 1)} aria-label={`Rate ${i+1} stars`}>
            <Star className={`w-6 h-6 transition-colors ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-gray-400'}`} />
          </button>
        ))}
      </div>
      <Textarea 
        name="comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your thoughts about this product..."
        className="mb-4"
        rows={4}
        required
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  )
} 