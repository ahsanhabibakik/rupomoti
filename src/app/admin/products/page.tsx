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
  X as XIcon,
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ProductTableSkeleton } from '@/components/admin/ProductTableSkeleton';

const INITIAL_PRICE_RANGE = [0, 50000];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('active');
  
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
    setFilters(prev => ({...prev, search: debouncedSearchQuery, page: 1}));
  }, [debouncedSearchQuery]);

  const fetchProducts = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
        setIsLoading(true);
    }
    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            if (key === 'priceRange') {
                if (value[0] > INITIAL_PRICE_RANGE[0]) searchParams.set('minPrice', value[0].toString());
                if (value[1] < INITIAL_PRICE_RANGE[1]) searchParams.set('maxPrice', value[1].toString());
            } else if (key === 'categoryId' && value !== 'all-categories') {
                searchParams.set(key, String(value));
            } else if (key === 'stockStatus' && value !== 'all') {
                searchParams.set(key, String(value));
            } else if (key === 'isFeatured' && value !== 'all-featured') {
                searchParams.set(key, String(value));
            } else if (key === 'isNewArrival' && value !== 'all-new-arrival') {
                searchParams.set(key, String(value));
            } else if (key === 'isPopular' && value !== 'all-popular') {
                searchParams.set(key, String(value));
            } else if (key === 'search' && value) {
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
        if (isInitialLoad) {
            setIsLoading(false);
        }
    }
  }, [filters, activeTab, pagination.page, pagination.pageSize]);

  useEffect(() => {
    fetchProducts(true);
  }, [fetchProducts]);

  useEffect(() => {
    if (!isLoading) {
        fetchProducts(false);
    }
  }, [filters, activeTab, pagination.page, pagination.pageSize, isLoading, fetchProducts]);
  
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
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
  };

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'search' && value) return true;
      if (key === 'categoryId' && value !== 'all-categories') return true;
      if (key === 'stockStatus' && value !== 'all') return true;
      if (key === 'priceRange' && (value[0] !== INITIAL_PRICE_RANGE[0] || value[1] !== INITIAL_PRICE_RANGE[1])) return true;
      if (key === 'isFeatured' && value && value !== 'all-featured') return true;
      if (key === 'isNewArrival' && value && value !== 'all-new-arrival') return true;
      if (key === 'isPopular' && value && value !== 'all-popular') return true;
      return false;
    }).length;
  }, [filters]);
  
  const handleSoftDelete = useCallback(async (productId: string) => {
    if (!confirm('Are you sure you want to move this product to the trash?')) return;
    showToast.promise(
        fetch(`/api/admin/products?id=${productId}`, { method: 'DELETE' })
        .then(async res => {
            if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
            return res.json();
        })
        .then(() => fetchProducts()),
        { loading: 'Moving to trash...', success: 'Product moved to trash', error: (e) => e.message }
    );
  }, [fetchProducts]);

  const handleRestore = useCallback(async (productId: string) => {
    if (!confirm('Are you sure you want to restore this product?')) return;
    showToast.promise(
        fetch(`/api/admin/products?id=${productId}&action=restore`, { method: 'PATCH' })
        .then(async res => {
            if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
            return res.json();
        })
        .then(() => fetchProducts()),
        { loading: 'Restoring product...', success: 'Product restored', error: (e) => e.message }
    );
  }, [fetchProducts]);

  const handlePermanentDelete = useCallback(async (productId: string) => {
    if (!confirm('This action is irreversible. Are you sure you want to permanently delete this product?')) return;
    showToast.promise(
        fetch(`/api/admin/products?id=${productId}&action=delete-permanent`, { method: 'PATCH' })
        .then(async res => {
            if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
            return res.json();
        })
        .then(() => fetchProducts()),
        { loading: 'Deleting permanently...', success: 'Product deleted', error: (e) => e.message }
    );
  }, [fetchProducts]);

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  }, []);

  const openAddDialog = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handlePageSizeChange = (size: number) => {
    setPagination(p => ({ ...p, pageSize: size, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const FilterControls = () => (
    <div className="space-y-4 p-1">
        <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={filters.categoryId} onValueChange={(v) => handleFilterChange('categoryId', v)}>
                <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
                <SelectContent>
                <SelectItem value="all-categories">All Categories</SelectItem>
                {categories?.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <label className="text-sm font-medium">Stock Status</label>
            <Select value={filters.stockStatus} onValueChange={(v) => handleFilterChange('stockStatus', v)}>
                <SelectTrigger><SelectValue placeholder="Stock Status" /></SelectTrigger>
                <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock (&lt;10)</SelectItem>
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
        <div className="space-y-2">
            <label className="text-sm font-medium">Status Flags</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Select value={filters.isFeatured} onValueChange={(v) => handleFilterChange('isFeatured', v)}>
                    <SelectTrigger><SelectValue placeholder="Featured" /></SelectTrigger>
            <SelectContent>
                      <SelectItem value="all-featured">Any</SelectItem>
              <SelectItem value="true">Featured</SelectItem>
              <SelectItem value="false">Not Featured</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.isNewArrival} onValueChange={(v) => handleFilterChange('isNewArrival', v)}>
                    <SelectTrigger><SelectValue placeholder="New Arrival" /></SelectTrigger>
            <SelectContent>
                      <SelectItem value="all-new-arrival">Any</SelectItem>
              <SelectItem value="true">New Arrival</SelectItem>
              <SelectItem value="false">Not New Arrival</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.isPopular} onValueChange={(v) => handleFilterChange('isPopular', v)}>
                    <SelectTrigger><SelectValue placeholder="Popular" /></SelectTrigger>
            <SelectContent>
                      <SelectItem value="all-popular">Any</SelectItem>
              <SelectItem value="true">Popular</SelectItem>
              <SelectItem value="false">Not Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
        </div>
        <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={clearFilters}>Clear All Filters</Button>
        </div>
      </div>
  );

  const productRows = useMemo(() => products.map((product) => (
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
    )), [products, activeTab, handleEdit, handleSoftDelete, handleRestore, handlePermanentDelete]);
  
  if (error) return <div className="text-red-500 text-center p-4">Error: {error}. Please try refreshing the page.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
        <Button onClick={openAddDialog}><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
      </div>
      
      {/* Filter Bar */}
      <div className="flex items-center gap-2">
          <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
          </div>
          <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="relative">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">{activeFilterCount}</Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <FilterControls />
            </PopoverContent>
          </Popover>
      </div>

      <Tabs value={activeTab} onValueChange={(tab) => { setActiveTab(tab); setPagination(p => ({ ...p, page: 1})); }}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="trashed">Trashed</TabsTrigger>
        </TabsList>
        <div className="mt-4">
            {isLoading ? (
                <ProductTableSkeleton />
            ) : (
                <TabsContent value={activeTab} className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
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
                        <TableBody>{productRows.length > 0 ? productRows : <TableRow><TableCell colSpan={7} className="text-center h-24">No products found.</TableCell></TableRow>}</TableBody>
                    </Table>
                </div>
                </TabsContent>
            )}
        </div>
      </Tabs>

      {!isLoading && <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
            <span className="text-sm font-medium">Page {pagination.page} of {pagination.totalPages || 1}</span>
            <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>Next</Button>
          </div>
        </div>
      </div>}

      {isDialogOpen && <ProductDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingProduct(null);
            fetchProducts(false);
          }
        }}
        product={editingProduct}
      />}
    </div>
  );
} 