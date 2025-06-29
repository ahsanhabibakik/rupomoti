'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface NewArrivalsPaginationProps {
  page: number
  limit: number
  category?: string
  sort?: string
  hasMore: boolean
  total: number
}

export default function NewArrivalsPagination({
  page,
  limit,
  category,
  sort,
  hasMore,
  total
}: NewArrivalsPaginationProps) {
  const router = useRouter()

  const handlePrevious = () => {
    const newPage = page - 1
    const params = new URLSearchParams()
    params.set('page', newPage.toString())
    params.set('limit', limit.toString())
    if (category) params.set('category', category)
    if (sort) params.set('sort', sort)
    router.push(`?${params.toString()}`)
  }

  const handleNext = () => {
    const newPage = page + 1
    const params = new URLSearchParams()
    params.set('page', newPage.toString())
    params.set('limit', limit.toString())
    if (category) params.set('category', category)
    if (sort) params.set('sort', sort)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12">
      <div className="text-sm text-muted-foreground">
        Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, total)} of {total} products
      </div>
      
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          disabled={page === 1} 
          onClick={handlePrevious}
        >
          Previous
        </Button>
        
        <Button 
          variant="outline" 
          disabled={!hasMore} 
          onClick={handleNext}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
