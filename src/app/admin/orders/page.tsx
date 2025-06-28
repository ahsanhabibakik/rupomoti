'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, differenceInHours } from 'date-fns';
import { Prisma } from '@prisma/client';
import { OrderDetailsDialog } from '@/components/admin/OrderDetailsDialog';
import { CourierAssignmentForm } from '@/components/admin/CourierAssignmentForm';
import { ShipNowButton } from '@/components/admin/ShipNowButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CourierBadge } from '@/components/ui/CourierBadge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit, Package, RefreshCw, Trash2, Undo, AlertTriangle } from 'lucide-react';
import { OrderTableSkeleton } from '@/components/admin/OrderTableSkeleton';
import { DataTablePagination } from '@/components/ui/DataTablePagination';
import { showToast } from '@/lib/toast';
import { OrderFilters } from './_components/OrderFilters';

// Manually define the type to include the fields we need
type OrderWithDetails = (Prisma.OrderGetPayload<{
  include: {
    customer: true;
    items: {
      include: {
        product: true;
      };
    };
  };
}>) & {
  user: { isFlagged: boolean } | null;
};

function isNew(date: string | Date) {
  return differenceInHours(new Date(), new Date(date)) < 24;
}

function OrdersList({ status }: { status: 'active' | 'trashed' }) {
  const router = useRouter();
  const searchParams = useSearchParams() || new URLSearchParams();
  const queryClient = useQueryClient();

  const search = searchParams.get('search');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 10);

  const { data, error, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['orders', { status, search, from, to, page, limit }],
    queryFn: async () => {
      const query = new URLSearchParams({
        status: status,
        search: search ?? '',
        from: from ?? '',
        to: to ?? '',
        page: page.toString(),
        limit: limit.toString(),
      });
      const response = await fetch(`/api/admin/orders?${query.toString()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
    placeholderData: (previousData) => previousData,
  });

  const { mutate: trashOrder, isPending: isTrashing } = useMutation({
    mutationFn: (orderId: string) => fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' }),
    onSuccess: async () => {
      showToast.success('Order moved to trash.');
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: () => showToast.error('Failed to move order to trash.'),
  });

  const { mutate: restoreOrder, isPending: isRestoring } = useMutation({
    mutationFn: (orderId: string) => fetch(`/api/admin/orders/${orderId}`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restore: true })
    }),
    onSuccess: async () => {
      showToast.success('Order restored successfully.');
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: () => showToast.error('Failed to restore order.'),
  });
  
  const handleTrashOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to move this order to the trash? This will also flag the user.')) {
      trashOrder(orderId);
    }
  };
  
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/orders?${params.toString()}`);
  };

  const handlePageSizeChange = (newSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', newSize.toString());
    params.set('page', '1');
    router.push(`/admin/orders?${params.toString()}`);
  };

  if (isLoading && !isPlaceholderData) return <OrderTableSkeleton />;
  if (error) return <div className="text-red-500 text-center py-10">Failed to load orders.</div>;
  
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
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-48">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    {status === 'trashed' ? 'Trash is empty.' : 'No orders found.'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order: OrderWithDetails) => (
                <TableRow key={order.id} className={isPlaceholderData ? 'opacity-50' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {status === 'active' && isNew(order.createdAt) && (
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
                    <div className='flex items-center gap-2'>
                        {order.user?.isFlagged && <span title='This user has been flagged'><AlertTriangle className="h-4 w-4 text-destructive" /></span>}
                        <span>{order.recipientName || order.customer.name}</span>
                    </div>
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
                      {status === 'active' ? (
                        <>
                          <OrderDetailsDialog order={order} />
                          {!['SHIPPED', 'DELIVERED', 'CANCELED'].includes(order.status) && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Assign</Button>
                              </DialogTrigger>
                              <DialogContent><CourierAssignmentForm order={order} /></DialogContent>
                            </Dialog>
                          )}
                          <ShipNowButton order={order} />
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            disabled={isTrashing} 
                            onClick={() => handleTrashOrder(order.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                           <Button variant="outline" size="sm" onClick={() => restoreOrder(order.id)} disabled={isRestoring}>
                            <Undo className="mr-2 h-4 w-4" /> Restore
                          </Button>
                          <Button variant="destructive" size="sm" disabled={true} title="Permanent deletion is disabled">
                            Delete Permanently
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {totalOrders > 0 && (
        <DataTablePagination
            page={page}
            totalPages={totalPages}
            totalRecords={totalOrders}
            pageSize={limit}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('active');
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="trashed">Trashed</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
            <OrdersList status="active" />
        </TabsContent>
        <TabsContent value="trashed">
            <OrdersList status="trashed" />
        </TabsContent>
      </Tabs>
    </div>
  );
}