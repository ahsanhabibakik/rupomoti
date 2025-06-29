import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

export function OrderTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-4">
        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>

        {/* Table skeleton */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Courier</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32 mt-1" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <div>
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24 mt-1" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-28 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-end gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  )
} 