import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function CustomerTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><Skeleton className="h-5 w-24" /></TableHead>
          <TableHead><Skeleton className="h-5 w-48" /></TableHead>
          <TableHead><Skeleton className="h-5 w-32" /></TableHead>
          <TableHead className="text-center"><Skeleton className="h-5 w-16" /></TableHead>
          <TableHead className="text-right"><Skeleton className="h-5 w-24" /></TableHead>
          <TableHead className="text-right"><Skeleton className="h-5 w-12" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 8 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-12" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 