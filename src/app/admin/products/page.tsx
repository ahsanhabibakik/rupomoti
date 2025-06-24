"use client";

import { useState, useEffect, useCallback } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Search, 
  RotateCw,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from 'next/image';
import { showToast } from '@/lib/toast';
import { ProductDialog } from '@/components/admin/ProductDialog';
import { Product } from '@/types/product';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('active');
  
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 1,
    totalCount: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    isFeatured: '',
    isNewArrival: '',
    isPopular: '',
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams(filters);
      searchParams.set('status', activeTab === 'active' ? 'ACTIVE' : 'TRASHED');
      searchParams.set('page', pagination.page.toString());
      searchParams.set('pageSize', pagination.pageSize.toString());
      const res = await fetch(`/api/admin/products?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      
      setProducts(data.products || []);
      setPagination(prev => ({
        ...prev,
        totalPages: data.totalPages,
        totalCount: data.totalCount,
      }));
    } catch (err: any) {
      setError(err.message);
      showToast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab, pagination.page, pagination.pageSize]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSoftDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to move this product to the trash?')) return;
    
    try {
      const res = await fetch(`/api/admin/products?id=${productId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to move product to trash');
      }
      
      showToast.success('Product moved to trash successfully');
      fetchProducts();
    } catch (err: any) {
      showToast.error(err.message);
    }
  };

  const handleRestore = async (productId: string) => {
    if (!confirm('Are you sure you want to restore this product?')) return;

    try {
      const res = await fetch(`/api/admin/products?id=${productId}&action=restore`, {
        method: 'PATCH',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to restore product');
      }

      showToast.success('Product restored successfully');
      fetchProducts();
    } catch (err: any) {
      showToast.error(err.message);
    }
  };

  const handlePermanentDelete = async (productId: string) => {
    if (!confirm('This action is irreversible. Are you sure you want to permanently delete this product?')) return;

    try {
      const res = await fetch(`/api/admin/products?id=${productId}&action=delete-permanent`, {
        method: 'PATCH',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete product permanently');
      }
      
      showToast.success('Product permanently deleted');
      fetchProducts();
    } catch (err: any) {
      showToast.error(err.message);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({...prev, page: 1}));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      categoryId: '',
      isFeatured: '',
      isNewArrival: '',
      isPopular: '',
    });
    setPagination(prev => ({...prev, page: 1}));
  }

  const handlePageSizeChange = (size: number) => {
    setPagination({ ...pagination, pageSize: size, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  const renderProductRows = (productsToRender: Product[]) => (
    productsToRender.map((product) => (
      <TableRow key={product.id}>
        <TableCell>
          <Image
            src={product.images[0] || '/placeholder.png'}
            alt={product.name}
            width={50}
            height={50}
            className="rounded-md object-cover"
          />
        </TableCell>
        <TableCell>{product.name}</TableCell>
        <TableCell>{product.sku}</TableCell>
        <TableCell>৳{product.price}</TableCell>
        <TableCell>{product.stock}</TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {product.isFeatured && <Badge variant="outline">Featured</Badge>}
            {product.isNewArrival && <Badge variant="outline" className="border-blue-500 text-blue-500">New</Badge>}
            {product.isPopular && <Badge variant="outline" className="border-green-500 text-green-500">Popular</Badge>}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {activeTab === 'active' ? (
              <>
                <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleSoftDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => handleRestore(product.id)}>
                  <RotateCw className="mr-2 h-4 w-4" /> Restore
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handlePermanentDelete(product.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                </Button>
              </>
            )}
          </div>
        </TableCell>
      </TableRow>
    ))
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Filter Products</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Search by name or SKU..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <Select value={filters.isFeatured} onValueChange={(v) => handleFilterChange('isFeatured', v)}>
            <SelectTrigger><SelectValue placeholder="Featured Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all-featured">All</SelectItem>
              <SelectItem value="true">Featured</SelectItem>
              <SelectItem value="false">Not Featured</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.isNewArrival} onValueChange={(v) => handleFilterChange('isNewArrival', v)}>
            <SelectTrigger><SelectValue placeholder="New Arrival Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all-new-arrival">All</SelectItem>
              <SelectItem value="true">New Arrival</SelectItem>
              <SelectItem value="false">Not New Arrival</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.isPopular} onValueChange={(v) => handleFilterChange('isPopular', v)}>
            <SelectTrigger><SelectValue placeholder="Popular Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all-popular">All</SelectItem>
              <SelectItem value="true">Popular</SelectItem>
              <SelectItem value="false">Not Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end">
            <Button variant="ghost" onClick={clearFilters}>Clear Filters</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="trashed">Trashed</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderProductRows(products)}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="trashed">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderProductRows(products)}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {Math.min(pagination.pageSize * (pagination.page - 1) + 1, pagination.totalCount)}
          -
          {Math.min(pagination.pageSize * pagination.page, pagination.totalCount)} of {pagination.totalCount} products.
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Rows per page:</span>
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={(value) => handlePageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder={pagination.pageSize} />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 50, 100, 200].map(size => (
                  <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <ProductDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingProduct(null);
            fetchProducts();
          }
        }}
        product={editingProduct}
      />
    </div>
  );
} 