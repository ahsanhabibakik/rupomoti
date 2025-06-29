import { Skeleton } from '@/components/ui/skeleton'

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col space-y-2 sm:space-y-3">
      {/* Responsive image skeleton - more compact on mobile */}
      <Skeleton className="h-[200px] sm:h-[280px] w-full rounded-lg sm:rounded-xl" />
      <div className="space-y-1 sm:space-y-2 px-1.5 sm:px-2">
        {/* Product name skeleton */}
        <Skeleton className="h-3 sm:h-4 w-[80%]" />
        <Skeleton className="h-3 sm:h-4 w-[60%]" />
        {/* Price skeleton */}
        <Skeleton className="h-4 sm:h-5 w-[40%]" />
      </div>
      {/* Button skeleton */}
      <div className="px-1.5 sm:px-2">
        <Skeleton className="h-7 sm:h-10 w-full" />
      </div>
    </div>
  )
} 