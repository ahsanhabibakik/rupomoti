"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Filter,
  Loader2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from 'next/image';
import { showToast } from '@/lib/toast';
import { ProductDialog } from '@/components/admin/ProductDialog';
import { Product } from '@/types/product';
import { useCategories } from '@/hooks/useCategories';
import { useDebounce } from '@/hooks/useDebounce';
import { Slider } from "@/components/ui/slider"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const INITIAL_PRICE_RANGE = [0, 50000];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('active');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  
  const { categories } = useCategories({ pageSize: 999 });

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 1,
    totalCount: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    categoryId: 'all-categories',
    stockStatus: 'all',
    priceRange: INITIAL_PRICE_RANGE,
    isFeatured: '',
    isNewArrival: '',
    isPopular: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [priceRangeValue, setPriceRangeValue] = useState(INITIAL_PRICE_RANGE);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    setFilters(prev => ({...prev, search: debouncedSearchQuery}));
  }, [debouncedSearchQuery]);

  const fetchProducts = useCallback(async () => {
    if (!initialLoading) {
      setIsFiltering(true);
    }

    try {
      const searchParams = new URLSearchParams();
      
      // Build search params from filters state
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            if (key === 'priceRange') {
                if (value[0] > INITIAL_PRICE_RANGE[0]) searchParams.set('minPrice', value[0].toString());
                if (value[1] < INITIAL_PRICE_RANGE[1]) searchParams.set('maxPrice', value[1].toString());
            } else if (key === 'categoryId' && value !== 'all-categories') {
                searchParams.set(key, String(value));
            } else if (key === 'stockStatus' && value !== 'all') {
                searchParams.set(key, String(value));
            } else if (!['priceRange', 'categoryId', 'stockStatus'].includes(key)) {
                searchParams.set(key, String(value));
            }
        }
      });

      searchParams.set('status', activeTab === 'active' ? 'ACTIVE' : 'TRASHED');
      searchParams.set('page', pagination.page.toString());
      searchParams.set('pageSize', pagination.pageSize.toString());

      const res = await fetch(`/api/admin/products?${searchParams.toString()}`);
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
    } finally {
      setInitialLoading(false);
      setIsFiltering(false);
    }
  }, [filters, activeTab, pagination.page, pagination.pageSize, initialLoading]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({...prev, page: 1}));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceRangeValue(INITIAL_PRICE_RANGE);
    setFilters({
      search: '',
      categoryId: 'all-categories',
      stockStatus: 'all',
      priceRange: INITIAL_PRICE_RANGE,
      isFeatured: '',
      isNewArrival: '',
      isPopular: '',
    });
    setPagination(prev => ({...prev, page: 1}));
  };
  
  const handleSoftDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to move this product to the trash?')) return;
    try {
      const res = await fetch(`/api/admin/products?id=${productId}`, { method: 'DELETE' });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to move product to trash');
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
      const res = await fetch(`/api/admin/products?id=${productId}&action=restore`, { method: 'PATCH' });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to restore product');
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
      const res = await fetch(`/api/admin/products?id=${productId}&action=delete-permanent`, { method: 'PATCH' });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to delete product permanently');
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

  const handlePageSizeChange = (size: number) => {
    setPagination({ ...pagination, pageSize: size, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const FilterControls = useMemo(() => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
                placeholder="Search by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={filters.categoryId} onValueChange={(v) => handleFilterChange('categoryId', v)}>
                <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
                <SelectContent>
                <SelectItem value="all-categories">All Categories</SelectItem>
                {categories?.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
                </SelectContent>
            </Select>
            <Select value={filters.stockStatus} onValueChange={(v) => handleFilterChange('stockStatus', v)}>
                <SelectTrigger><SelectValue placeholder="Stock Status" /></SelectTrigger>
                <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock (less than 10)</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Price Range</label>
                <span className="text-sm text-muted-foreground">
                ৳{priceRangeValue[0]} - ৳{priceRangeValue[1]}
                </span>
            </div>
            <Slider
                value={priceRangeValue}
                onValueChange={setPriceRangeValue}
                onValueCommit={(value) => handleFilterChange('priceRange', value)}
                max={INITIAL_PRICE_RANGE[1]}
                step={100}
                className="w-full"
            />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
  ), [searchQuery, filters, categories, priceRangeValue, handleFilterChange, clearFilters]);

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
        <TableCell className="min-w-[200px] font-medium">{product.name}</TableCell>
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
                <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleSoftDelete(product.id)}><Trash2 className="h-4 w-4" /></Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => handleRestore(product.id)}><RotateCw className="mr-2 h-4 w-4" /> Restore</Button>
                <Button variant="destructive" size="sm" onClick={() => handlePermanentDelete(product.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
              </>
            )}
          </div>
        </TableCell>
      </TableRow>
    ))
  );

  if (initialLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="text-red-500 text-center p-4">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
        <div className="flex items-center gap-2">
            <div className="md:hidden">
                <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
                    </SheetTrigger>
                    <SheetContent className="w-[85vw]">
                        <SheetHeader><SheetTitle>Filter Products</SheetTitle></SheetHeader>
                        <div className="py-4">{FilterControls}</div>
                    </SheetContent>
                </Sheet>
            </div>
            <Button onClick={openAddDialog}><Plus className="mr-2 h-4 w-4" /> Add</Button>
        </div>
      </div>

      <div className="hidden md:block p-4 border rounded-lg bg-card text-card-foreground">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Filter Products</h3>
        </div>
        {FilterControls}
      </div>

      <Tabs value={activeTab} onValueChange={(tab) => { setActiveTab(tab); setPagination(p => ({ ...p, page: 1})); }}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="trashed">Trashed</TabsTrigger>
        </TabsList>
        <div className="relative mt-4">
            {isFiltering && 
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            }
            <TabsContent value="active" className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <div className="overflow-x-auto border rounded-lg">
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
                    {products.length > 0 ? renderProductRows(products) : <TableRow><TableCell colSpan={7} className="text-center h-24">No products found.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </div>
            </TabsContent>
            <TabsContent value="trashed" className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <div className="overflow-x-auto border rounded-lg">
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
                    {products.length > 0 ? renderProductRows(products) : <TableRow><TableCell colSpan={7} className="text-center h-24">No products found.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </div>
            </TabsContent>
        </div>
      </Tabs>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {products.length > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0}
          -
          {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount} products.
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Rows per page:</span>
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={(value) => handlePageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder={pagination.pageSize.toString()} />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 50, 100, 200].map(size => (
                  <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1}>Previous</Button>
            <span className="text-sm font-medium">Page {pagination.page} of {pagination.totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>Next</Button>
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