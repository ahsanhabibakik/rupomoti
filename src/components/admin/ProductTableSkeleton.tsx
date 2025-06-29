import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function ProductTableSkeleton() {
  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Skeleton className="h-5 w-12" /></TableHead>
            <TableHead><Skeleton className="h-5 w-48" /></TableHead>
            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
            <TableHead><Skeleton className="h-5 w-20" /></TableHead>
            <TableHead><Skeleton className="h-5 w-16" /></TableHead>
            <TableHead><Skeleton className="h-5 w-32" /></TableHead>
            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-12 w-12 rounded-md" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-full" />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-10" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 