export default function ShopLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse space-y-8">
        {/* Filters skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-8 bg-muted rounded-md w-1/2"></div>
          <div className="h-8 bg-muted rounded-md w-1/2"></div>
          <div className="h-8 bg-muted rounded-md w-1/2"></div>
          <div className="h-8 bg-muted rounded-md w-1/2"></div>
        </div>
        
        {/* Products grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-square bg-muted rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 