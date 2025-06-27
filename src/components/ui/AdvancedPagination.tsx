'use client';

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { usePagination } from "@/hooks/usePagination";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface AdvancedPaginationProps {
  currentPage: number;
  totalPages: number;
  limit: number;
  totalRecords: number;
}

export function AdvancedPagination({
  currentPage,
  totalPages,
  limit,
  totalRecords,
}: AdvancedPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const paginationRange = usePagination({
    currentPage,
    totalPages,
    siblingCount: 1,
  });

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(pageNumber));
    return `${pathname}?${params.toString()}`;
  };

  const setLimit = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("limit", value);
    params.set("page", "1"); // Reset to page 1 when limit changes
    router.push(`${pathname}?${params.toString()}`);
  }

  if (totalPages === 0 || totalPages === 1) {
    return null;
  }
  
  const from = totalRecords > 0 ? (currentPage - 1) * limit + 1 : 0;
  const to = Math.min(currentPage * limit, totalRecords);

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Showing <strong>{from}-{to}</strong> of <strong>{totalRecords}</strong> orders
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select value={String(limit)} onValueChange={setLimit}>
                <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={limit} />
                </SelectTrigger>
                <SelectContent side="top">
                    {[10, 20, 50, 100].map((pageSize) => (
                        <SelectItem key={pageSize} value={`${pageSize}`}>
                            {pageSize}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => router.push(createPageURL(1))}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => router.push(createPageURL(currentPage - 1))}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {paginationRange.map((pageNumber, index) => {
            if (pageNumber === "...") {
              return <span key={`dots-${index}`} className="px-2">...</span>;
            }
            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                className="h-8 w-8 p-0"
                onClick={() => router.push(createPageURL(pageNumber))}
              >
                {pageNumber}
              </Button>
            );
          })}
          
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => router.push(createPageURL(currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => router.push(createPageURL(totalPages))}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 