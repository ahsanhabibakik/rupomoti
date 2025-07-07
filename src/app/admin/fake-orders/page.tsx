'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Flag, 
  FlagOff, 
  Trash2, 
  Search, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { showToast } from '@/lib/toast';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FakeOrder {
  id: string;
  orderNumber: string;
  recipientName: string;
  recipientPhone: string;
  total: number;
  status: string;
  createdAt: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  items: {
    quantity: number;
    product: {
      name: string;
      price: number;
    };
  }[];
}

export default function FakeOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<'unflag' | 'delete'>('unflag');

  const queryClient = useQueryClient();

  // Fetch fake orders
  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ['fake-orders', searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        status: 'fake',
        search: searchQuery,
        page: '1',
        limit: '50'
      });
      
      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch fake orders');
      }
      return response.json();
    }
  });

  // Bulk unflag orders (mark as real orders)
  const unflagMutation = useMutation({
    mutationFn: async (orderIds: string[]) => {
      const response = await fetch('/api/admin/orders/bulk-unflag', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to unflag orders');
      }
      
      return response.json();
    },
    onSuccess: () => {
      showToast.success('Orders unflagged successfully');
      setSelectedOrders(new Set());
      queryClient.invalidateQueries({ queryKey: ['fake-orders'] });
    },
    onError: (error) => {
      showToast.error(error instanceof Error ? error.message : 'Failed to unflag orders');
    }
  });

  // Bulk delete orders
  const deleteMutation = useMutation({
    mutationFn: async (orderIds: string[]) => {
      const response = await fetch('/api/admin/orders/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete orders');
      }
      
      return response.json();
    },
    onSuccess: () => {
      showToast.success('Orders deleted successfully');
      setSelectedOrders(new Set());
      queryClient.invalidateQueries({ queryKey: ['fake-orders'] });
    },
    onError: (error) => {
      showToast.error(error instanceof Error ? error.message : 'Failed to delete orders');
    }
  });

  const handleSelectAll = useCallback(() => {
    if (selectedOrders.size === ordersData?.orders?.length) {
      setSelectedOrders(new Set());
    } else {
      const allIds = new Set(ordersData?.orders?.map((order: FakeOrder) => order.id) || []);
      setSelectedOrders(allIds as Set<string>);
    }
  }, [selectedOrders.size, ordersData?.orders]);

  const handleSelectOrder = useCallback((orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  }, [selectedOrders]);

  const handleBulkAction = useCallback(() => {
    if (selectedOrders.size === 0) return;

    const orderIds = Array.from(selectedOrders);
    
    if (bulkAction === 'unflag') {
      unflagMutation.mutate(orderIds);
    } else {
      deleteMutation.mutate(orderIds);
    }
    
    setShowBulkDialog(false);
  }, [selectedOrders, bulkAction, unflagMutation, deleteMutation]);

  const orders = ordersData?.orders || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fake Orders Management</h1>
          <p className="text-gray-500 mt-1">Manage suspicious or flagged orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Bulk Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by order number, customer name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {selectedOrders.size > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium text-amber-900">
              {selectedOrders.size} selected
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setBulkAction('unflag');
                setShowBulkDialog(true);
              }}
            >
              <FlagOff className="mr-1 h-3 w-3" />
              Unflag
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                setBulkAction('delete');
                setShowBulkDialog(true);
              }}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selectedOrders.size === orders.length && orders.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading fake orders...
                  </div>
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Flag className="h-8 w-8" />
                    <p>No fake orders found</p>
                    <p className="text-sm">All orders appear to be legitimate</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order: FakeOrder) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.has(order.id)}
                      onCheckedChange={() => handleSelectOrder(order.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{order.orderNumber}</div>
                      <div className="text-sm text-gray-500">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{order.recipientName}</div>
                      <div className="text-sm text-gray-500">{order.recipientPhone}</div>
                      {order.customer && (
                        <div className="text-xs text-gray-400">{order.customer.email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">৳{order.total.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive" className="gap-1">
                      <Flag className="h-3 w-3" />
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(order.createdAt), 'hh:mm a')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrders(new Set([order.id]));
                          setBulkAction('unflag');
                          setShowBulkDialog(true);
                        }}
                      >
                        <FlagOff className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedOrders(new Set([order.id]));
                          setBulkAction('delete');
                          setShowBulkDialog(true);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {bulkAction === 'unflag' ? (
                <FlagOff className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              Confirm {bulkAction === 'unflag' ? 'Unflag' : 'Delete'} Orders
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === 'unflag' 
                ? `Are you sure you want to unflag ${selectedOrders.size} order${selectedOrders.size > 1 ? 's' : ''}? They will be moved back to active orders.`
                : `Are you sure you want to permanently delete ${selectedOrders.size} order${selectedOrders.size > 1 ? 's' : ''}? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkAction}
              className={bulkAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {bulkAction === 'unflag' ? 'Unflag Orders' : 'Delete Orders'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
