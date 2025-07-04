'use client'

export const dynamic = 'force-dynamic'

import { ReviewModerationPanel } from '@/components/admin/review-moderation-panel'

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Review Moderation</h1>
        <p className="text-muted-foreground">
          Manage and moderate customer reviews across all products
        </p>
      </div>
      
      <ReviewModerationPanel />
    </div>
  )
}
