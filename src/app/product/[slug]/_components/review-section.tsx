'use client'

import { ReviewSystem } from '@/components/reviews/review-system'

interface ReviewSectionProps {
  productId: string
  productSlug?: string
  initialReviews?: unknown[]
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  return (
    <div className="mt-12">
      <ReviewSystem productId={productId} />
    </div>
  )
}
