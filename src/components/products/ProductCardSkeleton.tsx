import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ProductCardSkeletonProps {
  className?: string
  animate?: boolean
}

export function ProductCardSkeleton({ className, animate = true }: ProductCardSkeletonProps) {
  return (
    <div className={cn(
      "flex flex-col space-y-3 bg-card rounded-lg border shadow-sm overflow-hidden",
      animate && "animate-pulse",
      className
    )}>
      {/* Image skeleton with shimmer effect */}
      <div className="relative overflow-hidden bg-muted">
        <Skeleton className="h-[240px] sm:h-[300px] w-full rounded-none" />
        {/* Shimmer overlay */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
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

// Enhanced skeleton for grid layouts
export function ProductGridSkeleton({ count = 30 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton 
          key={index} 
          className="transform transition-all duration-200 hover:scale-105"
        />
      ))}
    </div>
  )
} 