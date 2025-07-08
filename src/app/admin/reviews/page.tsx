'use client'

export const dynamic = 'force-dynamic'

import { ReviewModerationPanel } from '@/components/admin/review-moderation-panel'

export default function ReviewsPage() {
  return (
    <div className="space-y-6">

      
      <ReviewModerationPanel />
    </div>
  )
}
