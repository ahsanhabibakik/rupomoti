'use client'

import { ReviewSystem } from '@/components/reviews/review-system'

interface ReviewSectionProps {
  productId: string
  productSlug: string
  initialReviews?: any[]
}

export function ReviewSection({ productId, productSlug, initialReviews = [] }: ReviewSectionProps) {
  return (
    <div className="mt-12">
      <ReviewSystem productId={productId} />
    </div>
  )
}
