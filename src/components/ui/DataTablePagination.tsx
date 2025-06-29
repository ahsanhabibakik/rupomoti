'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface DataTablePaginationProps {
  page: number
  totalPages: number
  totalRecords: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function DataTablePagination({
  page,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const startRecord = totalRecords > 0 ? (page - 1) * pageSize + 1 : 0
  const endRecord = Math.min(page * pageSize, totalRecords)

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="text-sm text-muted-foreground">
        Showing {startRecord}-{endRecord} of {totalRecords} records.
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50, 100].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm font-medium">
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
} 
 