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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from 'date-fns';
// Define Decimal type to replace Prisma.Decimal
type Decimal = number;
// Import Mongoose models to replace Prisma models

import { OrderDetailsDialog } from '@/components/admin/OrderDetailsDialog';
import { CourierAssignmentForm } from '@/components/admin/CourierAssignmentForm';
import { ShipNowButton } from '@/components/admin/ShipNowButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CourierBadge } from '@/components/ui/CourierBadge';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, Package, RefreshCw, Trash2, Undo, AlertTriangle, Flag, FlagOff, 
  FileText, Printer, CheckSquare, Bell
} from 'lucide-react';
import { OrderTableSkeleton } from '@/components/admin/OrderTableSkeleton';
import { DataTablePagination } from '@/components/ui/DataTablePagination';
import { showToast } from '@/lib/toast';
import { OrderFilters } from './_components/OrderFilters';
import { getOrderAnalyticalInfo } from '@/lib/utils/order-number';
import { Order, OrderStatus, PaymentStatus } from '@/types/mongoose-types';

// Enhanced type definitions
type OrderWithDetails = Order & {
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string | null;
    zone?: string | null;
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
  user: { isFlagged: boolean } | null;
  isFakeOrder?: boolean;
  isFake?: boolean;
  deliveryAddress?: string;
  recipientName?: string;
  recipientPhone?: string;
  courierName?: string;
  courierTrackingCode?: string;
  shippingAddress?: string;
  _isNew?: boolean; // For highlighting new orders
  _lastUpdated?: string; // For tracking updates
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

// Real-time notification hook
const useRealTimeNotifications = () => {
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // WebSocket or Server-Sent Events for real-time updates
    const connectToRealTime = () => {
      // This would connect to your real-time service
      // For now, we'll use periodic checks with optimizations
      
      const checkForUpdates = async () => {
        try {
          // For now, we'll use a simple approach without calling a non-existent endpoint
          // In production, this would connect to WebSocket or Server-Sent Events
          // Skip the actual update check to avoid 405 errors
          if (!isVisible) {
            // Real-time updates would be handled by React Query refetching
            // when the component mounts or becomes visible
          }
        } catch (error) {
          console.warn('Failed to check for updates:', error);
        }
      };

      const interval = setInterval(checkForUpdates, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    };

    const cleanup = connectToRealTime();

    // Visibility change handler
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsVisible(visible);
      
      if (visible && newOrdersCount > 0) {
        setNewOrdersCount(0);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      cleanup();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isVisible, newOrdersCount]);

  return { newOrdersCount, clearNotifications: () => setNewOrdersCount(0) };
};



// Optimized OrdersList component with virtualization support
const OrdersList = React.memo(({ status }: { status: 'active' | 'trashed' | 'fake' }) => {
  const router = useRouter();
  const rawSearchParams = useSearchParams();
  const searchParams = useMemo(() => rawSearchParams || new URLSearchParams(), [rawSearchParams]);
  const queryClient = useQueryClient();
  
  // Real-time notifications
  const { newOrdersCount, clearNotifications } = useRealTimeNotifications();

  // Show notification when new orders arrive
  useEffect(() => {
    if (newOrdersCount > 0) {
      showToast.success(`${newOrdersCount} new orders received!`);
    }
  }, [newOrdersCount]);

  // State management
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [lastRefresh] = useState<Date>(new Date()); // Track when component mounted

  // Memoized query parameters
  const queryParams = useMemo(() => {
    return {
      search: searchParams.get('search'),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      page: Number(searchParams.get('page') ?? 1),
      limit: Number(searchParams.get('limit') ?? 20), // Increased default for better UX
      sortBy: searchParams.get('sortBy') ?? 'createdAt',
      sortOrder: searchParams.get('sortOrder') ?? 'desc',
    };
  }, [searchParams]);

  const { search, from, to, page, limit, sortBy, sortOrder } = queryParams;

  // Enhanced query with better caching strategy and error handling
  const { 
    data, 
    error, 
    isLoading, 
    isPlaceholderData
  } = useQuery({
    queryKey: ['orders', { status, search, from, to, page, limit, sortBy, sortOrder }],
    queryFn: async () => {
      console.log('🔍 Fetching orders with params:', { status, search, from, to, page, limit });
      
      const query = new URLSearchParams({
        status: status,
        search: search ?? '',
        from: from ?? '',
        to: to ?? '',
        page: page.toString(),
        limit: limit.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder,
        timestamp: Date.now().toString() // Force fresh data
      });
      
      const response = await fetch(`/api/admin/orders?${query.toString()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest'
        },
        cache: 'no-store',
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch orders');
      }
      
      const result = await response.json();
      console.log('📊 Fetched data:', { ordersCount: result.orders?.length || 0, totalCount: result.totalCount });
      
      // Mark new orders based on last refresh
      if (result.orders) {
        result.orders = result.orders.map((order: OrderWithDetails) => ({
          ...order,
          _isNew: new Date(order.createdAt) > lastRefresh,
          _lastUpdated: order.updatedAt
        }));
      }
      
      return result;
    },
    staleTime: 30000, // 30 seconds - balance between freshness and performance
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: status === 'active' ? 30000 : 60000, // More frequent for active orders
    refetchIntervalInBackground: false,
    retry: (failureCount, error) => {
      // Smart retry logic
      if (error?.message?.includes('Network error')) {
        return failureCount < 3;
      }
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    // Enable background updates
    notifyOnChangeProps: ['data', 'error', 'isLoading'],
  });

  // Mutations with optimistic updates
  const { mutate: trashOrder, isPending: isTrashing } = useMutation({
    mutationFn: (orderId: string) => fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' }),
    onMutate: async (orderId: string) => {
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      const previousData = queryClient.getQueryData(['orders', { status, search, from, to, page, limit, sortBy, sortOrder }]);
      
      // Optimistically remove the order
      queryClient.setQueryData(['orders', { status, search, from, to, page, limit, sortBy, sortOrder }], (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        const oldData = old as { orders: OrderWithDetails[]; totalOrders: number };
        return {
          ...oldData,
          orders: oldData.orders.filter((order: OrderWithDetails) => order.id !== orderId),
          totalOrders: oldData.totalOrders - 1
        };
      });
      
      return { previousData };
    },
    onError: (err, orderId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['orders', { status, search, from, to, page, limit, sortBy, sortOrder }], context.previousData);
      }
      showToast.error('Failed to move order to trash.');
      console.error('Mutation error:', err);
    },
    onSuccess: async (data, orderId) => {
      showToast.success('Order moved to trash.');
      
      // Broadcast change to other tabs/windows
      if (typeof window !== 'undefined') {
        const channel = new BroadcastChannel('orders-updates');
        channel.postMessage({ 
          type: 'order-updated', 
          action: 'trash',
          orderId: orderId,
          timestamp: Date.now()
        });
        channel.close();
      }
      
      // Invalidate and refetch
      await queryClient.invalidateQueries({ 
        queryKey: ['orders'], 
        refetchType: 'active' 
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  const { mutate: restoreOrder, isPending: isRestoring } = useMutation({
    mutationFn: (orderId: string) => fetch(`/api/admin/orders/${orderId}`, { 
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restore: true })
    }),
    onMutate: async (orderId: string) => {
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      const previousData = queryClient.getQueryData(['orders', { status, search, from, to, page, limit, sortBy, sortOrder }]);
      
      // Optimistically remove the order
      queryClient.setQueryData(['orders', { status, search, from, to, page, limit, sortBy, sortOrder }], (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        const oldData = old as { orders: OrderWithDetails[]; totalOrders: number };
        return {
          ...oldData,
          orders: oldData.orders.filter((order: OrderWithDetails) => order.id !== orderId),
          totalOrders: oldData.totalOrders - 1
        };
      });
      
      return { previousData };
    },
    onError: (err, orderId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['orders', { status, search, from, to, page, limit, sortBy, sortOrder }], context.previousData);
      }
      showToast.error('Failed to restore order.');
      console.error('Mutation error:', err);
    },
    onSuccess: async (data, orderId) => {
      showToast.success('Order restored successfully.');
      
      // Broadcast change to other tabs/windows
      if (typeof window !== 'undefined') {
        const channel = new BroadcastChannel('orders-updates');
        channel.postMessage({ 
          type: 'order-updated', 
          action: 'restore',
          orderId: orderId,
          timestamp: Date.now()
        });
        channel.close();
      }
      
      await queryClient.invalidateQueries({ 
        queryKey: ['orders'], 
        refetchType: 'active' 
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  const { mutate: markAsFakeOrder, isPending: isMarkingFake } = useMutation({
    mutationFn: ({ orderId, isFake }: { orderId: string; isFake: boolean }) => 
      fetch(`/api/admin/orders/${orderId}`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAsFake: isFake })
      }),
    onMutate: async ({ orderId, isFake }: { orderId: string; isFake: boolean }) => {
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      const previousData = queryClient.getQueryData(['orders', { status, search, from, to, page, limit, sortBy, sortOrder }]);
      
      // Update the order optimistically
      queryClient.setQueryData(['orders', { status, search, from, to, page, limit, sortBy, sortOrder }], (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        const oldData = old as { orders: OrderWithDetails[]; totalOrders: number };
        
        if (status === 'fake' && !isFake) {
          // Removing from fake view
          return {
            ...oldData,
            orders: oldData.orders.filter((order: OrderWithDetails) => order.id !== orderId),
            totalOrders: oldData.totalOrders - 1
          };
        } else if (status === 'active' && isFake) {
          // Removing from active view
          return {
            ...oldData,
            orders: oldData.orders.filter((order: OrderWithDetails) => order.id !== orderId),
            totalOrders: oldData.totalOrders - 1
          };
        } else {
          // Update in place
          return {
            ...oldData,
            orders: oldData.orders.map((order: OrderWithDetails) => 
              order.id === orderId ? { ...order, isFakeOrder: isFake } : order
            )
          };
        }
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['orders', { status, search, from, to, page, limit, sortBy, sortOrder }], context.previousData);
      }
      showToast.error('Failed to update order.');
      console.error('Mutation error:', err);
    },
    onSuccess: async (data, variables: { orderId: string; isFake: boolean }) => {
      showToast.success('Order status updated.');
      
      // Broadcast change to other tabs/windows
      if (typeof window !== 'undefined') {
        const channel = new BroadcastChannel('orders-updates');
        channel.postMessage({ 
          type: 'order-updated', 
          action: 'mark-fake',
          orderId: variables.orderId,
          isFake: variables.isFake,
          timestamp: Date.now()
        });
        channel.close();
      }
      
      await queryClient.invalidateQueries({ 
        queryKey: ['orders'], 
        refetchType: 'active' 
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
  // Event handlers with improved UX
  const handleTrashOrder = useCallback((orderId: string) => {
    if (window.confirm('Are you sure you want to move this order to the trash? This will also flag the user.')) {
      trashOrder(orderId);
      setSelectedOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  }, [trashOrder]);

  // Enhanced pagination handlers
  const handlePageChange = useCallback((newPage: number) => {
    clearNotifications();
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/orders?${params.toString()}`);
  }, [router, searchParams, clearNotifications]);

  const handlePageSizeChange = useCallback((newSize: number) => {
    clearNotifications();
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', newSize.toString());
    params.set('page', '1');
    router.push(`/admin/orders?${params.toString()}`);
  }, [router, searchParams, clearNotifications]);

  const handleMarkAsFake = useCallback((orderId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'unmark' : 'mark';
    const message = `Are you sure you want to ${action} this order as fake?${!currentStatus ? ' This will also flag the user.' : ''}`;
    
    if (window.confirm(message)) {
      markAsFakeOrder({ orderId, isFake: !currentStatus });
    }
  }, [markAsFakeOrder]);

  // Process orders with enhanced validation
  const { orders, totalOrders, totalPages } = useMemo(() => {
    const { orders: rawOrders = [], totalOrders = 0, totalPages = 0 } = data ?? {};
    
    const processedOrders = rawOrders.filter((order: OrderWithDetails) => {
      if (!order || !order.id) {
        console.warn('Invalid order found:', order);
        return false;
      }
      return true;
    }).map((order: OrderWithDetails) => ({
      ...order,
      customer: order.customer || {
        id: 'unknown',
        name: 'Unknown Customer',
        phone: 'N/A',
        email: null,
        address: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      user: order.user || { isFlagged: false },
      items: order.items || [],
      shippingAddress: order.shippingAddress || order.deliveryAddress || 'N/A'
    }));

    return { 
      orders: processedOrders, 
      totalOrders, 
      totalPages
    };
  }, [data]);

  // Selection handlers with performance optimization
  const handleSelectOrder = useCallback((orderId: string, checked: boolean) => {
    setSelectedOrders(prev => {
      const newSelected = new Set(prev);
      if (checked) {
        newSelected.add(orderId);
      } else {
        newSelected.delete(orderId);
      }
      
      // Update select all state
      setIsSelectAll(newSelected.size === orders.length && orders.length > 0);
      return newSelected;
    });
  }, [orders.length]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedOrders(new Set(orders.map((order: OrderWithDetails) => order.id)));
      setIsSelectAll(true);
    } else {
      setSelectedOrders(new Set());
      setIsSelectAll(false);
    }
  }, [orders]);

  const clearSelection = useCallback(() => {
    setSelectedOrders(new Set());
    setIsSelectAll(false);
  }, []);

  // Enhanced PDF generation with better error handling
  const generateOrderPDF = useCallback(async (order: OrderWithDetails) => {
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
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * { box-sizing: border-box; }
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
            padding: 20px; 
            line-height: 1.6; 
            color: #1f2937;
            background: white;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #3b82f6; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
          }
          .header h1 { color: #1f2937; margin: 0; font-size: 28px; font-weight: 700; }
          .header h2 { color: #3b82f6; margin: 10px 0; font-size: 20px; font-weight: 600; }
          .header p { color: #6b7280; margin: 5px 0; }
          
          .order-info { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-bottom: 25px; 
          }
          .section { 
            border: 1px solid #e5e7eb; 
            padding: 20px; 
            border-radius: 8px; 
            background: #f9fafb;
          }
          .section h3 { 
            margin-top: 0; 
            color: #1f2937; 
            border-bottom: 2px solid #e5e7eb; 
            padding-bottom: 10px; 
            font-size: 16px;
            font-weight: 600;
          }
          .section p { margin: 8px 0; font-size: 14px; }
          .section strong { font-weight: 600; color: #374151; }
          
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 25px; 
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .items-table th, .items-table td { 
            border-bottom: 1px solid #e5e7eb; 
            padding: 15px 12px; 
            text-align: left; 
          }
          .items-table th { 
            background-color: #f3f4f6; 
            font-weight: 600;
            color: #374151;
            font-size: 14px;
          }
          .items-table td { font-size: 14px; }
          .items-table tr:hover { background-color: #f9fafb; }
          
          .total-section { 
            text-align: right; 
            margin-top: 25px; 
            padding: 20px;
            background: #f3f4f6;
            border-radius: 8px;
          }
          .total-section p { 
            font-size: 20px; 
            font-weight: 700; 
            color: #059669;
            margin: 0;
          }
          
          .status-badges {
            display: flex;
            gap: 10px;
            margin-top: 10px;
          }
          .badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
          }
          .badge.pending { background: #fef3c7; color: #d97706; }
          .badge.confirmed { background: #dbeafe; color: #2563eb; }
          .badge.shipped { background: #dcfce7; color: #16a34a; }
          .badge.delivered { background: #dcfce7; color: #059669; }
          .badge.canceled { background: #fee2e2; color: #dc2626; }
          
          @media print { 
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      `;

      const customerSection = `
        <div class="section">
          <h3>👤 Customer Information</h3>              
          <p><strong>Name:</strong> ${order.recipientName || order.customer?.name || 'N/A'}</p>
          <p><strong>Phone:</strong> ${order.recipientPhone || order.customer?.phone || 'N/A'}</p>
          <p><strong>Email:</strong> ${order.customer?.email || 'N/A'}</p>
          <p><strong>Address:</strong> ${order.shippingAddress || order.customer?.address || 'N/A'}</p>
        </div>
      `;

      const statusSection = `
        <div class="section">
          <h3>📦 Order Status</h3>
          <p><strong>Order Status:</strong> <span class="badge ${order.status.toLowerCase()}">${order.status}</span></p>
          <p><strong>Payment Status:</strong> <span class="badge ${order.paymentStatus?.toLowerCase() || 'unknown'}">${order.paymentStatus || 'Unknown'}</span></p>
          ${order.courierName ? `<p><strong>Courier:</strong> ${order.courierName}</p>` : ''}
          ${order.courierTrackingCode ? `<p><strong>Tracking:</strong> ${order.courierTrackingCode}</p>` : ''}
        </div>
      `;

      const itemsRows = order.items?.map((item: OrderItem) => `
        <tr>
          <td><strong>${item.product.name}</strong></td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">৳${item.price.toLocaleString()}</td>
          <td style="text-align: right;"><strong>৳${(item.price * item.quantity).toLocaleString()}</strong></td>
        </tr>
      `).join('') || '';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Order ${orderInfo.displayNumber}</title>
          <meta charset="UTF-8">
          ${styles}
        </head>
        <body>
          <div class="header">
            <h1>📋 Order Invoice</h1>
            <h2>Order #${orderInfo.displayNumber}</h2>
            <p>Generated on: ${format(new Date(), "dd MMM yyyy, h:mm a")}</p>
            <p>Order Date: ${format(new Date(order.createdAt), "dd MMM yyyy, h:mm a")}</p>
          </div>
          
          <div class="order-info">
            ${customerSection}
            ${statusSection}
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div class="total-section">
            <p>💰 Total Amount: ৳${order.total.toLocaleString()}</p>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Thank you for your business! 🙏</p>
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
  }, []);

  // Bulk PDF generation with progress indication
  const generateBulkPDF = useCallback(async () => {
    if (selectedOrders.size === 0) {
      showToast.error('Please select orders to generate PDF');
      return;
    }

    try {
      setIsGeneratingPDF(true);
      showToast.success(`Generating PDF for ${selectedOrders.size} orders...`);
      
      const selectedOrdersList = orders.filter((order: OrderWithDetails) => 
        selectedOrders.has(order.id)
      );

      if (selectedOrdersList.length === 0) {
        showToast.error('No valid orders found for PDF generation');
        return;
      }

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showToast.error('Please allow popups to generate PDF');
        return;
      }

      // Enhanced bulk PDF with better styling
      const styles = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body { 
            font-family: 'Inter', sans-serif; 
            padding: 15px; 
            line-height: 1.4; 
            font-size: 12px; 
            color: #1f2937;
          }
          .page-break { page-break-after: always; }
          .order-section { 
            margin-bottom: 25px; 
            border: 2px solid #e5e7eb; 
            padding: 20px; 
            border-radius: 8px;
            background: white;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #3b82f6; 
            padding-bottom: 15px; 
            margin-bottom: 20px; 
          }
          .header h2 { color: #3b82f6; margin: 0; font-size: 18px; }
          .order-info { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
            margin-bottom: 15px; 
          }
          .section { 
            border: 1px solid #e5e7eb; 
            padding: 12px; 
            border-radius: 6px; 
            background: #f9fafb;
          }
          .section h4 { 
            margin: 0 0 10px 0; 
            color: #1f2937; 
            font-size: 14px; 
            font-weight: 600;
          }
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px; 
            font-size: 11px; 
          }
          .items-table th, .items-table td { 
            border: 1px solid #d1d5db; 
            padding: 8px 6px; 
            text-align: left; 
          }
          .items-table th { 
            background-color: #f3f4f6; 
            font-weight: 600;
          }
          .total-section { 
            text-align: right; 
            margin-top: 15px; 
            font-weight: 700; 
            color: #059669;
          }
          @media print { 
            body { margin: 0; }
            .order-section { page-break-inside: avoid; }
          }
        </style>
      `;

      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Bulk Orders Export - ${selectedOrdersList.length} Orders</title>
          <meta charset="UTF-8">
          ${styles}
        </head>
        <body>
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: #f3f4f6; border-radius: 8px;">
            <h1 style="color: #1f2937; margin: 0;">📊 Bulk Orders Export</h1>
            <p style="color: #6b7280; margin: 10px 0;">
              ${selectedOrdersList.length} orders • Generated on ${format(new Date(), "dd MMM yyyy, h:mm a")}
            </p>
          </div>
      `;

      selectedOrdersList.forEach((order: OrderWithDetails, index: number) => {
        const orderInfo = getOrderAnalyticalInfo(order);
        const isLastOrder = index === selectedOrdersList.length - 1;

        const itemsRows = order.items?.map((item: OrderItem) => `
          <tr>
            <td>${item.product.name}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">৳${item.price.toLocaleString()}</td>
            <td style="text-align: right;">৳${(item.price * item.quantity).toLocaleString()}</td>
          </tr>
        `).join('') || '';

        htmlContent += `
          <div class="order-section${isLastOrder ? '' : ' page-break'}">
            <div class="header">
              <h2>📦 Order #${orderInfo.displayNumber}</h2>
              <p style="color: #6b7280; margin: 5px 0;">
                ${format(new Date(order.createdAt), "dd MMM yyyy, h:mm a")}
              </p>
            </div>
            
            <div class="order-info">
              <div class="section">
                <h4>👤 Customer Information</h4>
                <p><strong>Name:</strong> ${order.recipientName || order.customer?.name || 'N/A'}</p>
                <p><strong>Phone:</strong> ${order.recipientPhone || order.customer?.phone || 'N/A'}</p>
                <p><strong>Email:</strong> ${order.customer?.email || 'N/A'}</p>
                <p><strong>Address:</strong> ${order.shippingAddress || order.customer?.address || 'N/A'}</p>
              </div>
              <div class="section">
                <h4>📦 Order Status</h4>
                <p><strong>Status:</strong> ${order.status}</p>
                <p><strong>Payment:</strong> ${order.paymentStatus}</p>
                ${order.courierName ? `<p><strong>Courier:</strong> ${order.courierName}</p>` : ''}
                ${order.courierTrackingCode ? `<p><strong>Tracking:</strong> ${order.courierTrackingCode}</p>` : ''}
              </div>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <div class="total-section">
              <p>💰 Total Amount: ৳${order.total.toLocaleString()}</p>
            </div>
          </div>
        `;
      });

      htmlContent += `
          <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>📋 Bulk Export Complete • Thank you for your business! 🙏</p>
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
        }, 1000);
      };

      showToast.success(`PDF generated for ${selectedOrdersList.length} orders`);
      clearSelection();
    } catch (error) {
      console.error('Error generating bulk PDF:', error);
      showToast.error('Failed to generate bulk PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [selectedOrders, orders, clearSelection]);

  // Loading and error states
  if (isLoading && !isPlaceholderData) return (
    <div className="p-4 md:p-6">
      <OrderTableSkeleton />
    </div>
  );
  
  if (error) return (
    <div className="text-red-500 text-center py-10">
      Failed to load orders: {error instanceof Error ? error.message : String(error)}
    </div>
  );

  // Show message when no orders are found
  if (orders.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12 p-4">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {status === 'trashed' ? 'Trash is empty.' : 
           status === 'fake' ? 'No fake orders found.' : 
           totalOrders === 0 ? 'No orders have been placed yet.' : 'Try adjusting your search filters.'}
        </p>
        {totalOrders === 0 && status === 'active' && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                <strong>Getting Started:</strong> Orders will appear here once customers start placing them through your store.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
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
                  <TableRow 
                    key={order.id} 
                    className={
                      (isPlaceholderData ? 'opacity-50 ' : '') + 
                      (order._isNew ? 'bg-blue-50 border-l-4 border-l-blue-500' : '')
                    }
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.has(order.id)}
                        onCheckedChange={(checked: boolean) => handleSelectOrder(order.id, checked)}
                        aria-label={"Select order " + getOrderAnalyticalInfo(order).displayNumber}
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
                          <span>{order.recipientName || order.customer?.name || 'N/A'}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.recipientPhone || order.customer?.phone || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                          <StatusBadge status={order.status} />
                          {order.paymentStatus && <StatusBadge status={order.paymentStatus} />}
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
                <div key={order.id} className={
                  "border-b last:border-b-0 p-4 " + 
                  (isPlaceholderData ? 'opacity-50 ' : '') + 
                  (selectedOrders.has(order.id) ? 'bg-blue-50' : 'bg-white') +
                  (order._isNew ? ' border-l-4 border-l-blue-500' : '')
                }>
                  {/* Header with selection */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedOrders.has(order.id)}
                        onCheckedChange={(checked: boolean) => handleSelectOrder(order.id, checked)}
                        aria-label={"Select order " + getOrderAnalyticalInfo(order).displayNumber}
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
                          <div className="font-medium text-base truncate">{order.recipientName || order.customer?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-600 truncate">
                            {order.recipientPhone || order.customer?.phone || 'N/A'}
                          </div>
                          {order.shippingAddress && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {order.shippingAddress}
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
});

OrdersList.displayName = 'OrdersList';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newOrderNotifications, setNewOrderNotifications] = useState(0);
  const queryClient = useQueryClient();

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showToast.success('Browser notifications enabled for new orders!');
        }
      });
    }
  }, []);

  // Add visibility change listener for real-time updates
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, refresh orders and clear notifications
        setNewOrderNotifications(0);
        queryClient.invalidateQueries({ 
          queryKey: ['orders'], 
          refetchType: 'active' 
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [queryClient]);

  // Add BroadcastChannel for cross-tab communication
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const channel = new BroadcastChannel('orders-updates');
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'order-updated') {
        // Another tab updated an order, refresh our data
        queryClient.invalidateQueries({ 
          queryKey: ['orders'], 
          refetchType: 'active' 
        });
        
        // If it's a new order and tab is not visible, show notification
        if (event.data.action === 'new-order' && document.hidden) {
          setNewOrderNotifications(prev => prev + 1);
          
          // Update page title with notification
          document.title = "(" + (newOrderNotifications + 1) + ") Orders - Admin";
          
          // Browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Order Received!', {
              body: 'A new order has been placed',
              icon: '/favicon.ico',
              tag: 'new-order'
            });
          }
        }
      }
    };

    channel.addEventListener('message', handleMessage);
    
    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [queryClient, newOrderNotifications]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setNewOrderNotifications(0);
    document.title = 'Orders - Admin'; // Reset title
    
    try {
      // Invalidate all order queries to force fresh data
      await queryClient.invalidateQueries({ 
        queryKey: ['orders'], 
        refetchType: 'active' 
      });
      showToast.success('Orders refreshed successfully!');
    } catch {
      showToast.error('Failed to refresh orders');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Package className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Order Management</h1>
              <p className="text-sm text-slate-600">Manage and track all your orders</p>
            </div>
            {newOrderNotifications > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                <Bell className="h-3 w-3 mr-1" />
                {newOrderNotifications} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <OrderFilters />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="shrink-0 hover:bg-slate-50"
              title="Refresh orders"
            >
              <RefreshCw className={"h-4 w-4 mr-2 " + (isRefreshing ? 'animate-spin' : '')} />
              Refresh
            </Button>
            {/* Real-time status indicator */}
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Live Updates</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Orders Tabs Section */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b bg-slate-50 px-6 py-4">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-white p-1 rounded-lg h-auto shadow-sm border">
              <TabsTrigger 
                value="active" 
                className="relative data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 hover:text-slate-800 transition-all duration-200 font-medium py-2.5 px-4 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Active</span>
                  {newOrderNotifications > 0 && activeTab !== 'active' && (
                    <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center animate-pulse">
                      {newOrderNotifications > 99 ? '99+' : newOrderNotifications}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="trashed"
                className="data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 hover:text-slate-800 transition-all duration-200 font-medium py-2.5 px-4 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Trashed</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-6">
            <TabsContent value="active" className="mt-0">
                <OrdersList status="active" />
            </TabsContent>
            <TabsContent value="trashed" className="mt-0">
                <OrdersList status="trashed" />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}