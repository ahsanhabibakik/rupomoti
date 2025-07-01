'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  RefreshCw, Trash2, Undo, Flag, FlagOff, FileText
} from 'lucide-react';
import { showToast } from '@/lib/toast';

// Simplified types
type SimpleOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  deliveryAddress: string;
  recipientName: string;
  recipientPhone: string;
  isFakeOrder: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  } | null;
  user: {
    isFlagged: boolean;
  } | null;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      price: number;
      sku?: string;
    };
  }>;
};

// Simplified OrdersList component
const OrdersList = React.memo(({ status }: { status: 'active' | 'trashed' | 'fake' | 'all' }) => {
  const router = useRouter();
  const rawSearchParams = useSearchParams();
  const searchParams = useMemo(() => rawSearchParams || new URLSearchParams(), [rawSearchParams]);
  const queryClient = useQueryClient();

  // Query parameters
  const queryParams = useMemo(() => ({
    search: searchParams.get('search') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    page: Number(searchParams.get('page') ?? 1),
    limit: Number(searchParams.get('limit') ?? 20),
    sortBy: searchParams.get('sortBy') ?? 'createdAt',
    sortOrder: searchParams.get('sortOrder') ?? 'desc',
  }), [searchParams]);

  const { search, from, to, page, limit, sortBy, sortOrder } = queryParams;

  // Optimized query with simplified error handling
  const { 
    data, 
    error, 
    isLoading, 
    refetch
  } = useQuery({
    queryKey: ['admin-orders', { status, search, from, to, page, limit, sortBy, sortOrder }],
    queryFn: async () => {
      const query = new URLSearchParams({
        status,
        search,
        from,
        to,
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        timestamp: Date.now().toString()
      });
      
      const response = await fetch(`/api/admin/orders?${query.toString()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        cache: 'no-store',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      return response.json();
    },
    staleTime: 10000, // 10 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: status === 'active' ? 30000 : 60000, // Refresh active orders more frequently
    retry: 2,
    retryDelay: 1000,
  });

  // Mutations for order actions
  const { mutate: trashOrder, isPending: isTrashing } = useMutation({
    mutationFn: (orderId: string) => fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' }),
    onSuccess: () => {
      showToast.success('Order moved to trash.');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: () => showToast.error('Failed to move order to trash.'),
  });

  const { mutate: restoreOrder, isPending: isRestoring } = useMutation({
    mutationFn: (orderId: string) => fetch(`/api/admin/orders/${orderId}`, { 
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restore: true })
    }),
    onSuccess: () => {
      showToast.success('Order restored successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: () => showToast.error('Failed to restore order.'),
  });

  const { mutate: toggleFakeOrder, isPending: isToggling } = useMutation({
    mutationFn: ({ orderId, isFake }: { orderId: string; isFake: boolean }) => 
      fetch(`/api/admin/orders/${orderId}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFakeOrder: isFake })
      }),
    onSuccess: () => {
      showToast.success('Order status updated.');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: () => showToast.error('Failed to update order.'),
  });

  // Event handlers
  const handleTrashOrder = useCallback((orderId: string) => {
    if (window.confirm('Are you sure you want to move this order to trash?')) {
      trashOrder(orderId);
    }
  }, [trashOrder]);

  const handleRestoreOrder = useCallback((orderId: string) => {
    if (window.confirm('Are you sure you want to restore this order?')) {
      restoreOrder(orderId);
    }
  }, [restoreOrder]);

  const handleToggleFake = useCallback((orderId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'unmark' : 'mark';
    if (window.confirm(`Are you sure you want to ${action} this order as fake?`)) {
      toggleFakeOrder({ orderId, isFake: !currentStatus });
    }
  }, [toggleFakeOrder]);

  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/orders?${params.toString()}`);
  }, [router, searchParams]);

  // Process data
  const { orders, totalOrders, totalPages } = useMemo(() => {
    if (!data) return { orders: [], totalOrders: 0, totalPages: 0 };
    
    return {
      orders: data.orders || [],
      totalOrders: data.totalOrders || 0,
      totalPages: data.totalPages || 0
    };
  }, [data]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600">Error loading orders: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-2">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No orders found for "{status}" status</p>
        <Button onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {totalOrders} orders found
        </p>
        <Button onClick={() => refetch()} size="sm" variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order: SimpleOrder) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    {order.isFakeOrder && (
                      <Badge variant="destructive" className="text-xs">Fake</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.customer?.name || order.recipientName}</p>
                    <p className="text-sm text-gray-500">{order.customer?.phone || order.recipientPhone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={order.status === 'PENDING' ? 'secondary' : 'default'}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>৳{order.total.toFixed(2)}</TableCell>
                <TableCell>
                  {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {status === 'trashed' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestoreOrder(order.id)}
                        disabled={isRestoring}
                      >
                        <Undo className="w-4 h-4" />
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleFake(order.id, order.isFakeOrder)}
                          disabled={isToggling}
                        >
                          {order.isFakeOrder ? <FlagOff className="w-4 h-4" /> : <Flag className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTrashOrder(order.id)}
                          disabled={isTrashing}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

OrdersList.displayName = 'OrdersList';

// Main component
export default function OptimizedOrdersPage() {
  const [activeTab, setActiveTab] = useState('active');
  const queryClient = useQueryClient();

  const handleRefreshAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    showToast.success('Refreshing all order data...');
  }, [queryClient]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <Button onClick={handleRefreshAll}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh All
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active Orders</TabsTrigger>
          <TabsTrigger value="fake">Fake Orders</TabsTrigger>
          <TabsTrigger value="trashed">Trashed Orders</TabsTrigger>
          <TabsTrigger value="all">All Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          <OrdersList status="active" />
        </TabsContent>
        
        <TabsContent value="fake" className="space-y-4">
          <OrdersList status="fake" />
        </TabsContent>
        
        <TabsContent value="trashed" className="space-y-4">
          <OrdersList status="trashed" />
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <OrdersList status="all" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
