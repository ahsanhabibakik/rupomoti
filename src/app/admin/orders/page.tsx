import { Suspense } from 'react';
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
import { Edit, Eye, Package, Truck } from 'lucide-react';
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

async function OrdersList({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const status = searchParams.status as OrderStatus | 'all' || 'all';
  const from = typeof searchParams.from === 'string' ? searchParams.from : undefined;
  const to = typeof searchParams.to === 'string' ? searchParams.to : undefined;
  const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  const limit = typeof searchParams.limit === 'string' ? Number(searchParams.limit) : 10;

  const { orders, totalOrders, totalPages, error } = await getOrders({
    search,
    status,
    startDate: from,
    endDate: to,
    page,
    limit,
  });

  if (error) {
    return (
      <div className="text-red-500 text-center py-10">
        <p>Failed to load orders.</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

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

export default function OrdersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <OrderFilters />
      </div>
      <Suspense fallback={<OrderTableSkeleton />}>
        <OrdersList searchParams={searchParams} />
      </Suspense>
    </div>
  );
} 