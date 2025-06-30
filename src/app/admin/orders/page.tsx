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
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Package, RefreshCw, Trash2, Undo, AlertTriangle, Flag, FlagOff, Download, FileText, Printer, CheckSquare, Square } from 'lucide-react';
import { OrderTableSkeleton } from '@/components/admin/OrderTableSkeleton';
import { DataTablePagination } from '@/components/ui/DataTablePagination';
import { showToast } from '@/lib/toast';
import { OrderFilters } from './_components/OrderFilters';
import { getOrderDisplayNumber, getOrderAnalyticalInfo } from '@/lib/utils/order-number';
import { AdminDebugPanel } from '@/components/admin/AdminDebugPanel';

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
  isFakeOrder?: boolean;
  shippingAddress?: string;
};

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    price: number;
    sku?: string;
  };
};

function isNew(date: string | Date) {
  return differenceInHours(new Date(), new Date(date)) < 24;
}

function OrdersList({ status }: { status: 'active' | 'trashed' | 'fake' }) {
  const router = useRouter();
  const searchParams = useSearchParams() || new URLSearchParams();
  const queryClient = useQueryClient();

  // State management
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
      const response = await fetch(`/api/admin/orders?${query.toString()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        cache: 'no-store', // Ensure fetch cache is disabled
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || 'Failed to fetch orders');
      }
      return response.json();
    },
    staleTime: 0, // Always consider data stale - force fresh fetch every time
    gcTime: 0, // Don't cache results at all
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnReconnect: true, // Refetch when network reconnects
    refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
    refetchIntervalInBackground: true, // Continue refetching even when tab is not active
    retry: 3, // Retry failed requests
    retryDelay: 1000, // Wait 1 second between retries
    notifyOnChangeProps: 'all', // Notify on all changes
  });

  const { mutate: trashOrder, isPending: isTrashing } = useMutation({
    mutationFn: (orderId: string) => fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' }),
    onSuccess: async () => {
      showToast.success('Order moved to trash.');
      // Immediately invalidate and refetch all order queries with aggressive cache busting
      queryClient.setQueryData(['orders'], () => undefined); // Clear cache
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await queryClient.refetchQueries({ queryKey: ['orders'], type: 'active' });
      // Force a fresh fetch for the current query
      await queryClient.refetchQueries({ 
        queryKey: ['orders', { status, search, from, to, page, limit }],
        exact: true 
      });
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
      // Immediately invalidate and refetch all order queries with aggressive cache busting
      queryClient.setQueryData(['orders'], () => undefined); // Clear cache
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await queryClient.refetchQueries({ queryKey: ['orders'], type: 'active' });
      // Force a fresh fetch for the current query
      await queryClient.refetchQueries({ 
        queryKey: ['orders', { status, search, from, to, page, limit }],
        exact: true 
      });
    },
    onError: () => showToast.error('Failed to restore order.'),
  });

  const { mutate: markAsFakeOrder, isPending: isMarkingFake } = useMutation({
    mutationFn: ({ orderId, isFake }: { orderId: string; isFake: boolean }) => 
      fetch(`/api/admin/orders/${orderId}`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAsFake: isFake })
      }),
    onSuccess: async (_, variables: { orderId: string; isFake: boolean }) => {
      showToast.success(variables.isFake ? 'Order marked as fake and user flagged.' : 'Order unmarked as fake.');
      // Immediately invalidate and refetch all order queries with aggressive cache busting
      queryClient.setQueryData(['orders'], () => undefined); // Clear cache
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await queryClient.refetchQueries({ queryKey: ['orders'], type: 'active' });
      // Force a fresh fetch for the current query
      await queryClient.refetchQueries({ 
        queryKey: ['orders', { status, search, from, to, page, limit }],
        exact: true 
      });
    },
    onError: () => showToast.error('Failed to update order.'),
  });
  
  const handleTrashOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to move this order to the trash? This will also flag the user.')) {
      trashOrder(orderId);
    }
  };

  const handleMarkAsFake = (orderId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'unmark' : 'mark';
    const message = `Are you sure you want to ${action} this order as fake?${!currentStatus ? ' This will also flag the user.' : ''}`;
    
    if (window.confirm(message)) {
      markAsFakeOrder({ orderId, isFake: !currentStatus });
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

  // Bulk selection functions
  const handleSelectOrder = (orderId: string, checked: boolean) => {
    const newSelected = new Set(selectedOrders);
    if (checked) {
      newSelected.add(orderId);
    } else {
      newSelected.delete(orderId);
    }
    setSelectedOrders(newSelected);
    setIsSelectAll(newSelected.size === orders.length && orders.length > 0);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(new Set(orders.map((order: OrderWithDetails) => order.id)));
      setIsSelectAll(true);
    } else {
      setSelectedOrders(new Set());
      setIsSelectAll(false);
    }
  };

  const clearSelection = () => {
    setSelectedOrders(new Set());
    setIsSelectAll(false);
  };

  // PDF generation functions
  const generateOrderPDF = async (order: OrderWithDetails) => {
    try {
      setIsGeneratingPDF(true);
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showToast.error('Please allow popups to generate PDF');
        return;
      }

      const orderInfo = getOrderAnalyticalInfo(order);
      
      const styles = `
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .order-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .section { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
          .section h3 { margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .items-table th { background-color: #f5f5f5; }
          .total-section { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
          @media print { body { margin: 0; } }
        </style>
      `;

      const customerSection = `
        <div class="section">
          <h3>Customer Information</h3>              <p><strong>Name:</strong> ${order.recipientName || order.customer.name}</p>
              <p><strong>Phone:</strong> ${order.recipientPhone || order.customer.phone}</p>
              <p><strong>Email:</strong> ${order.customer.email || 'N/A'}</p>
              <p><strong>Address:</strong> ${order.shippingAddress || order.customer.address || 'N/A'}</p>
        </div>
      `;

      const statusSection = `
        <div class="section">
          <h3>Order Status</h3>
          <p><strong>Order Status:</strong> ${order.status}</p>
          <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
          ${order.courierName ? `<p><strong>Courier:</strong> ${order.courierName}</p>` : ''}
          ${order.courierTrackingCode ? `<p><strong>Tracking:</strong> ${order.courierTrackingCode}</p>` : ''}
        </div>
      `;

      const itemsRows = order.items?.map((item: any) => `
        <tr>
          <td>${item.product.name}</td>
          <td>${item.quantity}</td>
          <td>৳${item.price.toLocaleString()}</td>
          <td>৳${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `).join('') || '';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Order ${orderInfo.displayNumber}</title>
          ${styles}
        </head>
        <body>
          <div class="header">
            <h1>Order Invoice</h1>
            <h2>Order #${orderInfo.displayNumber}</h2>
            <p>Date: ${format(new Date(order.createdAt), "dd MMM yyyy, h:mm a")}</p>
          </div>
          
          <div class="order-info">
            ${customerSection}
            ${statusSection}
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div class="total-section">
            <p>Total Amount: ৳${order.total.toLocaleString()}</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };

      showToast.success('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast.error('Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generateBulkPDF = async () => {
    if (selectedOrders.size === 0) {
      showToast.error('Please select orders to export');
      return;
    }

    try {
      setIsGeneratingPDF(true);
      const selectedOrdersList = orders.filter((order: OrderWithDetails) => 
        selectedOrders.has(order.id)
      );

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showToast.error('Please allow popups to generate PDF');
        return;
      }

      const styles = `
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.4; font-size: 12px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .order-card { border: 1px solid #ddd; margin-bottom: 15px; padding: 15px; page-break-inside: avoid; }
          .order-header { background-color: #f5f5f5; padding: 10px; margin: -15px -15px 10px -15px; }
          .order-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .section h4 { margin: 0 0 8px 0; color: #333; }
          .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 5px; text-align: left; }
          .items-table th { background-color: #f9f9f9; }
          @media print { body { margin: 0; font-size: 10px; } .order-card { page-break-inside: avoid; } }
        </style>
      `;

      const headerContent = `
        <div class="header">
          <h1>Bulk Orders Export</h1>
          <p>Generated on: ${format(new Date(), "dd MMM yyyy, h:mm a")}</p>
          <p>Total Orders: ${selectedOrdersList.length}</p>
        </div>
      `;

      const ordersContent = selectedOrdersList.map((order: OrderWithDetails) => {
        const orderInfo = getOrderAnalyticalInfo(order);
        const itemsRows = order.items?.map((item: any) => `
          <tr>
            <td>${item.product.name}</td>
            <td>${item.quantity}</td>
            <td>৳${item.price.toLocaleString()}</td>
            <td>৳${(item.price * item.quantity).toLocaleString()}</td>
          </tr>
        `).join('') || '';

        return `
          <div class="order-card">
            <div class="order-header">
              <h3>Order #${orderInfo.displayNumber} - ৳${order.total.toLocaleString()}</h3>
              <p>Date: ${format(new Date(order.createdAt), "dd MMM yyyy, h:mm a")}</p>
            </div>
            
            <div class="order-details">
              <div class="section">
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> ${order.recipientName || order.customer.name}</p>
                <p><strong>Phone:</strong> ${order.recipientPhone || order.customer.phone}</p>
                <p><strong>Address:</strong> ${(order as any).shippingAddress || order.customer.address || 'N/A'}</p>
              </div>
              
              <div class="section">
                <h4>Order Status</h4>
                <p><strong>Status:</strong> ${order.status}</p>
                <p><strong>Payment:</strong> ${order.paymentStatus}</p>
                ${order.courierName ? `<p><strong>Courier:</strong> ${order.courierName}</p>` : ''}
              </div>
            </div>

            <table class="items-table">
              <thead>
                <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>
          </div>
        `;
      }).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Bulk Orders Export</title>
          ${styles}
        </head>
        <body>
          ${headerContent}
          ${ordersContent}
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };

      showToast.success(`PDF generated for ${selectedOrdersList.length} orders`);
    } catch (error) {
      console.error('Error generating bulk PDF:', error);
      showToast.error('Failed to generate bulk PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  if (isLoading && !isPlaceholderData) return (
    <div className="p-4 md:p-6">
      <OrderTableSkeleton />
    </div>
  );
  if (error) return <div className="text-red-500 text-center py-10">Failed to load orders.</div>;
  
  const { orders, totalOrders, totalPages } = data ?? { orders: [], totalOrders: 0, totalPages: 0 };

  // Debug: Log the actual data being received
  console.log('🔍 Frontend Debug - Orders data:', {
    hasData: !!data,
    dataKeys: data ? Object.keys(data) : [],
    ordersLength: orders?.length,
    totalOrders,
    totalPages,
    status,
    isLoading,
    error: error ? String(error) : null,
    rawData: data
  });

  return (
    <div className="space-y-4">
       {/* Debug Panel - Remove in production */}
       <AdminDebugPanel />
       
       {/* Loading overlay for search/filter operations */}
       {isPlaceholderData && (
         <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
           <div className="flex items-center gap-2 text-muted-foreground">
             <RefreshCw className="h-4 w-4 animate-spin" />
             <span>Updating...</span>
           </div>
         </div>
       )}

       {/* Bulk Actions Bar */}
       {selectedOrders.size > 0 && (
         <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
           <div className="flex items-center gap-2">
             <CheckSquare className="h-4 w-4 text-blue-600" />
             <span className="text-sm font-medium text-blue-800">
               {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
             </span>
           </div>
           <div className="flex items-center gap-2 flex-wrap">
             <Button
               variant="outline"
               size="sm"
               onClick={generateBulkPDF}
               disabled={isGeneratingPDF}
               className="h-8 text-xs"
             >
               <FileText className="mr-1 h-3 w-3" />
               Export PDF
             </Button>
             <Button
               variant="outline"
               size="sm"
               onClick={() => console.log('Bulk print action')}
               disabled={isGeneratingPDF}
               className="h-8 text-xs"
             >
               <Printer className="mr-1 h-3 w-3" />
               Print All
             </Button>
             <Button
               variant="outline"
               size="sm"
               onClick={clearSelection}
               className="h-8 text-xs"
             >
               Clear
             </Button>
           </div>
         </div>
       )}
       
       <div className={`border rounded-lg ${isPlaceholderData ? 'relative' : ''}`}>
        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isSelectAll}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all orders"
                  />
                </TableHead>
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
                  <TableCell colSpan={7} className="text-center h-48">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      {status === 'trashed' ? 'Trash is empty.' : 
                       status === 'fake' ? 'No fake orders found.' : 'No orders found.'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order: OrderWithDetails) => (
                  <TableRow key={order.id} className={isPlaceholderData ? 'opacity-50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.has(order.id)}
                        onCheckedChange={(checked: boolean) => handleSelectOrder(order.id, checked)}
                        aria-label={`Select order ${getOrderAnalyticalInfo(order).displayNumber}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const orderInfo = getOrderAnalyticalInfo(order);
                          return (
                            <>
                              {orderInfo.isVeryNew && (
                                <span className="relative flex h-3 w-3" title="Very New Order (< 2hrs)">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                              )}
                              {orderInfo.isNew && !orderInfo.isVeryNew && (
                                <span className="relative flex h-3 w-3" title="New Order (< 24hrs)">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                                </span>
                              )}
                              {order.isFakeOrder && (
                                <Flag className="h-4 w-4 text-red-500" />
                              )}
                              <div className="font-medium">{orderInfo.displayNumber}</div>
                            </>
                          );
                        })()}
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
                      <div className="flex items-center justify-end gap-1">
                        {status === 'active' ? (
                          <>
                            <OrderDetailsDialog order={order} />
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => generateOrderPDF(order)}
                              disabled={isGeneratingPDF}
                              title="Print/Export PDF"
                            >
                              <Printer className="h-3 w-3" />
                            </Button>
                            {!['SHIPPED', 'DELIVERED', 'CANCELED'].includes(order.status) && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-8 px-2">
                                    <Edit className="h-3 w-3" />
                                    <span className="hidden sm:inline ml-1">Assign</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogTitle className="sr-only">Assign Courier</DialogTitle>
                                  <CourierAssignmentForm order={order} />
                                </DialogContent>
                              </Dialog>
                            )}
                            <ShipNowButton order={order} />
                            <Button 
                              variant={order.isFakeOrder ? "secondary" : "outline"} 
                              size="sm"
                              className="h-8 w-8 p-0"
                              disabled={isMarkingFake} 
                              onClick={() => handleMarkAsFake(order.id, order.isFakeOrder || false)}
                              title={order.isFakeOrder ? "Unmark as fake" : "Mark as fake"}
                            >
                              {order.isFakeOrder ? <FlagOff className="h-3 w-3" /> : <Flag className="h-3 w-3" />}
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              disabled={isTrashing} 
                              onClick={() => handleTrashOrder(order.id)}
                              title="Move to trash"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        ) : status === 'fake' ? (
                          <>
                            <OrderDetailsDialog order={order} />
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => generateOrderPDF(order)}
                              disabled={isGeneratingPDF}
                              title="Print/Export PDF"
                            >
                              <Printer className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 px-2"
                              disabled={isMarkingFake} 
                              onClick={() => handleMarkAsFake(order.id, true)}
                            >
                              <FlagOff className="h-3 w-3" />
                              <span className="hidden sm:inline ml-1">Unmark</span>
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              disabled={isTrashing} 
                              onClick={() => handleTrashOrder(order.id)}
                              title="Move to trash"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                             <Button
                               variant="outline"
                               size="sm"
                               className="h-8 w-8 p-0"
                               onClick={() => generateOrderPDF(order)}
                               disabled={isGeneratingPDF}
                               title="Print/Export PDF"
                             >
                               <Printer className="h-3 w-3" />
                             </Button>
                             <Button 
                               variant="outline" 
                               size="sm" 
                               className="h-8 px-2"
                               onClick={() => restoreOrder(order.id)} 
                               disabled={isRestoring}
                             >
                              <Undo className="h-3 w-3" />
                              <span className="hidden sm:inline ml-1">Restore</span>
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

        {/* Mobile Card Layout */}
        <div className="md:hidden">
          {/* Mobile Bulk Actions */}
          {selectedOrders.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-t-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {selectedOrders.size} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateBulkPDF}
                  disabled={isGeneratingPDF}
                  className="h-8 text-xs px-2"
                >
                  <FileText className="mr-1 h-3 w-3" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  className="h-8 text-xs px-2"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
          
          {/* Mobile Select All */}
          {orders.length > 0 && (
            <div className="bg-gray-50 border-b p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isSelectAll}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all orders"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
              <span className="text-xs text-gray-500">{orders.length} orders</span>
            </div>
          )}

          <div className="space-y-0">
            {orders.length === 0 ? (
              <div className="text-center py-12 p-4">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  {status === 'trashed' ? 'Trash is empty.' : 
                   status === 'fake' ? 'No fake orders found.' : 'No orders found.'}
                </p>
              </div>
            ) : (
              orders.map((order: OrderWithDetails) => (
                <div key={order.id} className={`border-b last:border-b-0 p-4 ${isPlaceholderData ? 'opacity-50' : ''} ${selectedOrders.has(order.id) ? 'bg-blue-50' : 'bg-white'}`}>
                  {/* Header with selection */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedOrders.has(order.id)}
                        onCheckedChange={(checked: boolean) => handleSelectOrder(order.id, checked)}
                        aria-label={`Select order ${getOrderAnalyticalInfo(order).displayNumber}`}
                      />
                      <div className="flex items-center gap-2">
                        {(() => {
                          const orderInfo = getOrderAnalyticalInfo(order);
                          return (
                            <>
                              {orderInfo.isVeryNew && (
                                <span className="relative flex h-3 w-3" title="Very New Order (< 2hrs)">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                              )}
                              {orderInfo.isNew && !orderInfo.isVeryNew && (
                                <span className="relative flex h-3 w-3" title="New Order (< 24hrs)">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                                </span>
                              )}
                              {order.isFakeOrder && (
                                <Flag className="h-4 w-4 text-red-500" />
                              )}
                              <span className="font-semibold text-lg">{orderInfo.compactNumber}</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-green-600">৳{order.total.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(order.createdAt), "dd MMM, h:mm a")}
                      </div>
                    </div>
                  </div>

                  {/* Customer Info with better mobile layout */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        {order.user?.isFlagged && (
                          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-base truncate">{order.recipientName || order.customer.name}</div>
                          <div className="text-sm text-gray-600 truncate">
                            {order.recipientPhone || order.customer.phone}
                          </div>
                          {(order as any).shippingAddress && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {(order as any).shippingAddress}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status with better mobile display */}
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={order.status} />
                    <StatusBadge status={order.paymentStatus} />
                    {order.courierName && (
                      <CourierBadge courierName={order.courierName} trackingId={order.courierTrackingCode} />
                    )}
                  </div>

                  {/* Actions with mobile-optimized layout */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <OrderDetailsDialog order={order} />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => generateOrderPDF(order)}
                          disabled={isGeneratingPDF}
                        >
                          <Printer className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                        {status === 'active' ? (
                          <>
                            {!['SHIPPED', 'DELIVERED', 'CANCELED'].includes(order.status) && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-8 px-2">
                                    <Edit className="h-3 w-3 mr-1" /> Assign
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogTitle className="sr-only">Assign Courier</DialogTitle>
                                  <CourierAssignmentForm order={order} />
                                </DialogContent>
                              </Dialog>
                            )}
                            <ShipNowButton order={order} />
                          </>
                        ) : status === 'fake' ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2"
                            disabled={isMarkingFake} 
                            onClick={() => handleMarkAsFake(order.id, true)}
                          >
                            <FlagOff className="h-3 w-3 mr-1" /> Unmark
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2"
                            onClick={() => restoreOrder(order.id)} 
                            disabled={isRestoring}
                          >
                            <Undo className="h-3 w-3 mr-1" /> Restore
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {status !== 'trashed' && (
                          <Button 
                            variant={order.isFakeOrder ? "secondary" : "outline"} 
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={isMarkingFake} 
                            onClick={() => handleMarkAsFake(order.id, order.isFakeOrder || false)}
                            title={order.isFakeOrder ? "Unmark as fake" : "Mark as fake"}
                          >
                            {order.isFakeOrder ? <FlagOff className="h-3 w-3" /> : <Flag className="h-3 w-3" />}
                          </Button>
                        )}
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={isTrashing} 
                          onClick={() => handleTrashOrder(order.id)}
                          title="Move to trash"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await queryClient.refetchQueries({ queryKey: ['orders'] });
      showToast.success('Orders refreshed successfully!');
    } catch (error) {
      showToast.error('Failed to refresh orders');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500); // Small delay for UX
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex items-center gap-2">
          <OrderFilters />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="fake">Fake Orders</TabsTrigger>
            <TabsTrigger value="trashed">Trashed</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
            <OrdersList status="active" />
        </TabsContent>
        <TabsContent value="fake">
            <OrdersList status="fake" />
        </TabsContent>
        <TabsContent value="trashed">
            <OrdersList status="trashed" />
        </TabsContent>
      </Tabs>
    </div>
  );
}