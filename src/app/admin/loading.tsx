import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  const sidebarItems = Array.from({ length: 14 });

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="flex h-full">
        {/* Skeleton Sidebar */}
        <div className="w-64 flex-shrink-0 border-r bg-background/50 p-4">
          <div className="flex items-center gap-3 mb-8">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="mb-6">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-3">
            {sidebarItems.map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-5 w-36" />
              </div>
            ))}
          </div>
          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Skeleton Main Content */}
        <div className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-9 w-64" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
} 