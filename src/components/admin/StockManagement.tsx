'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Plus, Minus, Package, History, RefreshCw } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { useProducts } from '@/hooks/useProducts';
import { formatDistanceToNow } from 'date-fns';

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  status: string;
}

interface StockLog {
  id: string;
  productId: string;
  type: 'MANUAL_ADJUSTMENT' | 'ORDER_DECREMENT' | 'ORDER_CANCELLATION' | 'RESTOCK';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  orderId?: string;
  userId?: string;
  userName?: string;
  createdAt: string;
  product: {
    name: string;
    sku: string;
  };
}

interface StockUpdateFormProps {
  product: Product;
  onUpdate: () => void;
}

function StockUpdateForm({ product, onUpdate }: StockUpdateFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStock = async (operation: 'increment' | 'decrement' | 'set') => {
    if (quantity <= 0) {
      showToast.error('Quantity must be greater than 0');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch('/api/products/stock', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          operation
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update stock');
      }

      const result = await response.json();
      showToast.success(`Stock updated: ${result.previousStock} → ${result.newStock}`);
      onUpdate();
      setQuantity(1);
    } catch (error) {
      console.error('Stock update error:', error);
      showToast.error(error instanceof Error ? error.message : 'Failed to update stock');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{product.name}</span>
          <Badge variant={product.stock > 10 ? 'default' : product.stock > 0 ? 'secondary' : 'destructive'}>
            {product.stock} in stock
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">SKU: {product.sku}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20"
          />
          <Button
            onClick={() => updateStock('increment')}
            disabled={isUpdating}
            size="sm"
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
          <Button
            onClick={() => updateStock('decrement')}
            disabled={isUpdating}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            <Minus className="h-4 w-4 mr-1" />
            Remove
          </Button>
          <Button
            onClick={() => updateStock('set')}
            disabled={isUpdating}
            size="sm"
            variant="secondary"
            className="flex-1"
          >
            Set to {quantity}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LowStockAlert({ products }: { products: Product[] }) {
  const lowStockProducts = products.filter(p => p.stock <= 10 && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-green-600">
            <Package className="h-12 w-12 mx-auto mb-2" />
            <p className="font-medium">All products are well-stocked!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {outOfStockProducts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Out of Stock ({outOfStockProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {outOfStockProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center">
                  <span className="font-medium">{product.name}</span>
                  <Badge variant="destructive">0 left</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {lowStockProducts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Warning ({lowStockProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center">
                  <span className="font-medium">{product.name}</span>
                  <Badge variant="secondary">{product.stock} left</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function StockManagement() {
  const { data: productsData, isLoading } = useProducts({ adminView: true, includeOutOfStock: true });
  const products = productsData?.products || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Trigger a page refresh or refetch - the hook doesn't expose mutate
      window.location.reload();
    } catch {
      setIsRefreshing(false);
    }
  };

  const filteredProducts = products.filter((product: Product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stock Management</h1>
        <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="manage">Manage Stock</TabsTrigger>
          <TabsTrigger value="history">Stock History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <LowStockAlert products={products} />
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Badge variant="outline">
              {filteredProducts.length} products
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product: Product) => (
              <StockUpdateForm
                key={product.id}
                product={product}
                onUpdate={handleRefresh}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <StockHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StockHistory() {
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStockHistory();
  }, []);

  const fetchStockHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/stock-history?limit=50');
      if (!response.ok) throw new Error('Failed to fetch stock history');
      
      const data = await response.json();
      setStockLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch stock history:', error);
      showToast.error('Failed to load stock history');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: StockLog['type']) => {
    switch (type) {
      case 'MANUAL_ADJUSTMENT':
        return <Package className="h-4 w-4" />;
      case 'ORDER_DECREMENT':
        return <Minus className="h-4 w-4 text-red-500" />;
      case 'ORDER_CANCELLATION':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'RESTOCK':
        return <Plus className="h-4 w-4 text-blue-500" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: StockLog['type']) => {
    switch (type) {
      case 'MANUAL_ADJUSTMENT':
        return <Badge variant="outline">Manual</Badge>;
      case 'ORDER_DECREMENT':
        return <Badge variant="destructive">Order</Badge>;
      case 'ORDER_CANCELLATION':
        return <Badge variant="secondary">Cancelled</Badge>;
      case 'RESTOCK':
        return <Badge variant="default">Restock</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Stock History
        </CardTitle>
        <div className="flex items-center gap-4">
          <Button onClick={fetchStockHistory} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stockLogs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No stock history found
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{log.product.name}</div>
                        <div className="text-sm text-gray-500">{log.product.sku}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(log.type)}
                        {getTypeBadge(log.type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        log.quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {log.quantity > 0 ? '+' : ''}{log.quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {log.previousQuantity} → {log.newQuantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {log.reason || (log.orderId ? `Order #${log.orderId.slice(-8)}` : '-')}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
