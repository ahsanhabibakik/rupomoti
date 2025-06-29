import { Skeleton } from '@/components/ui/skeleton'

export function ShopSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header skeleton */}
      <div className="text-center mb-10">
        <Skeleton className="h-8 w-64 mx-auto mb-2" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>

      <div className="flex gap-x-8 lg:gap-x-12">
        {/* Desktop Filters Skeleton */}
        <aside className="hidden md:block w-64 lg:w-72 flex-shrink-0">
          <div className="sticky top-24 space-y-10">
            {/* Search skeleton */}
            <Skeleton className="h-11 w-full" />
            
            {/* Filter header skeleton */}
            <div className="flex justify-between items-center border-b pb-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            
            {/* Categories skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-5 w-20" />
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Price range skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-full" />
              <div className="flex justify-between items-center space-x-2">
                <Skeleton className="h-9 w-full" />
                <span className="flex-shrink-0">-</span>
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          {/* Header controls skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Skeleton className="h-4 w-48" />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Skeleton className="h-11 w-24 md:hidden" />
              <Skeleton className="h-11 w-40" />
            </div>
          </div>

          {/* Products grid skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {Array.from({ length: 30 }).map((_, index) => (
              <ProductCardSkeleton key={`shop-skeleton-${index}`} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3 bg-card rounded-lg border shadow-sm overflow-hidden">
      {/* Image skeleton with shimmer effect */}
      <div className="relative overflow-hidden bg-muted">
        <Skeleton className="h-[240px] sm:h-[300px] w-full rounded-none" />
        {/* Shimmer overlay */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
      </div>
      
      <div className="space-y-3 p-4">
        {/* Product name skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-[85%]" />
          <Skeleton className="h-4 w-[65%]" />
        </div>
        
        {/* Category skeleton */}
        <Skeleton className="h-3 w-[45%]" />
        
        {/* Price skeleton */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-[60%]" />
          <Skeleton className="h-4 w-[30%]" />
        </div>
        
        {/* Rating skeleton */}
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-4 rounded-full" />
          ))}
          <Skeleton className="h-3 w-8 ml-2" />
        </div>
        
        {/* Buttons skeleton */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    </div>
  )
}
