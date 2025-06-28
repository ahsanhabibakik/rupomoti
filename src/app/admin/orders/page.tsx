'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format, differenceInHours } from 'date-fns';
import { getOrders } from '@/lib/actions/order-actions';
import { OrderStatus, Prisma } from '@prisma/client';
import { AdvancedPagination } from '@/components/ui/AdvancedPagination';
import { OrderFilters } from './_components/OrderFilters';
import { OrderDetailsDialog } from '@/components/admin/OrderDetailsDialog';
import { CourierAssignmentForm } from '@/components/admin/CourierAssignmentForm';
import { ShipNowButton } from '@/components/admin/ShipNowButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CourierBadge } from '@/components/ui/CourierBadge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Package, RefreshCw, Truck } from 'lucide-react';
import { OrderTableSkeleton } from '@/components/admin/OrderTableSkeleton';

type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    customer: true;
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

function isNew(date: string | Date) {
  return differenceInHours(new Date(), new Date(date)) < 24;
}

function OrdersList() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search');
  const status = searchParams.get('status') ?? 'all';
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 10);

  const { data, error, isLoading } = useQuery({
    queryKey: ['orders', { search, status, from, to, page, limit }],
    queryFn: async () => {
      const query = new URLSearchParams({
        search: search ?? '',
        status,
        from: from ?? '',
        to: to ?? '',
        page: page.toString(),
        limit: limit.toString(),
      });
      const response = await fetch(`/api/admin/orders?${query.toString()}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <OrderTableSkeleton />;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-10">
        <p>Failed to load orders.</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  const { orders, totalOrders, totalPages } = data ?? { orders: [], totalOrders: 0, totalPages: 0 };

  return (
    <div className="space-y-4">
       <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Courier</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-48">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No orders found.</p>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {isNew(order.createdAt) && (
                        <span className="relative flex h-3 w-3" title="New Order">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                        </span>
                      )}
                      <div className="font-medium">#{order.orderNumber}</div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {format(new Date(order.createdAt), "dd MMM yyyy, h:mm a")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{order.recipientName || order.customer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.recipientPhone || order.customer.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                        <StatusBadge status={order.status} />
                        <StatusBadge status={order.paymentStatus} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <CourierBadge courierName={order.courierName} trackingId={order.courierTrackingCode} />
                  </TableCell>
                  <TableCell className="text-right">
                    ৳{order.total.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <OrderDetailsDialog order={order} />
                       {!['SHIPPED', 'DELIVERED', 'CANCELED'].includes(order.status) && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="mr-2 h-4 w-4" /> Assign
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <CourierAssignmentForm order={order} />
                          </DialogContent>
                        </Dialog>
                      )}
                      <ShipNowButton order={order} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <AdvancedPagination
        currentPage={page}
        totalPages={totalPages}
        limit={limit}
        totalRecords={totalOrders}
      />
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex items-center gap-2">
          <OrderFilters />
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <OrdersList />
    </div>
  );
}

function OrdersListWrapper() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  // You might need to reconstruct the searchParams object to pass to OrdersList
  // This is a simplified example.
  const params = {
    search: searchParams.get('search'),
    status: searchParams.get('status'),
    from: searchParams.get('from'),
    to: searchParams.get('to'),
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  };

  // The actual OrdersList component needs to be created or adapted
  // to be a server component or to receive props in a way that works with Suspense.
  // For now, let's assume we can refactor it slightly.
  // This part is complex because we are calling an async component from a client component.
  // The best approach is often to have a separate component that fetches the data.

  // Let's keep the existing structure for now and pass searchParams.
  // But this will require making OrdersList a client component as well,
  // or fetching data inside it using a hook.
  
  // The 'searchParams' prop needs to be handled correctly.
  // Let's create a simplified `params` object for now.
  const queryParams = Object.fromEntries(searchParams.entries());

  return <OrdersList />;
} 