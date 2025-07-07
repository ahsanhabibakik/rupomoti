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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Trash2, 
  Search, 
  RotateCw,
  Filter,
  Download,
  Printer,
  FileText,
  Loader2,
  AlertTriangle,
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ProductTableSkeleton } from '@/components/admin/ProductTableSkeleton';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface DataTablePaginationProps {
  page: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function DataTablePagination({ 
  page, 
  totalPages, 
  totalRecords, 
  pageSize, 
  onPageChange, 
  onPageSizeChange 
}: DataTablePaginationProps) {
  const startRecord = totalRecords > 0 ? (page - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(page * pageSize, totalRecords);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="text-sm text-muted-foreground">
        Showing {startRecord}-{endRecord} of {totalRecords} records.
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50, 100, 200].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm font-medium">
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

const INITIAL_PRICE_RANGE = [0, 50000];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  
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

  // Optimized fetch function with better error handling and performance
  const fetchProducts = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
        setIsLoading(true);
        // Clear selected products when reloading to ensure consistency
        setSelectedProducts(new Set());
    }
    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            if (key === 'priceRange') {
                if (Number(value[0]) > INITIAL_PRICE_RANGE[0]) searchParams.set('minPrice', String(value[0]));
                if (Number(value[1]) < INITIAL_PRICE_RANGE[1]) searchParams.set('maxPrice', String(value[1]));
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
            } else if (key === 'designType' && value !== 'all-design-types') {
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
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
  
  const handleFilterChange = <T extends keyof typeof filters>(key: T, value: typeof filters[T]) => {
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
  
  const handleSoftDelete = useCallback((productId: string) => {
    if (!confirm('Are you sure you want to move this product to the trash?')) return;
    showToast.promise(
        fetch(`/api/admin/products?id=${productId}`, { method: 'DELETE' })
        .then(async res => {
            if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
            return res.json();
        })
        .then(() => fetchProducts(false)),
        { 
          loading: 'Moving to trash...', 
          success: 'Product moved to trash!', 
          error: 'Failed to move product to trash'
        }
    );
  }, [fetchProducts]);

  const handleRestore = useCallback((productId: string) => {
    if (!confirm('Are you sure you want to restore this product?')) return;
    showToast.promise(
        fetch(`/api/admin/products?id=${productId}&action=restore`, { method: 'PATCH' })
        .then(async res => {
            if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
            return res.json();
        })
        .then(() => fetchProducts(false)),
        { 
          loading: 'Restoring product...', 
          success: 'Product restored!', 
          error: 'Failed to restore product'
        }
    );
  }, [fetchProducts]);

  const handlePermanentDelete = useCallback((productId: string) => {
    if (!confirm('This action is irreversible. Are you sure you want to permanently delete this product?')) return;
    showToast.promise(
        fetch(`/api/admin/products?id=${productId}&action=delete-permanent`, { method: 'PATCH' })
        .then(async res => {
            if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
            return res.json();
        })
        .then(() => fetchProducts(false)),
        { 
          loading: 'Deleting permanently...', 
          success: 'Product deleted!', 
          error: 'Failed to delete product'
        }
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
    setPagination(p => ({ ...p, page: newPage }));
  };

  // Bulk operations
  // Optimized to use React.useCallback with proper dependencies
  const handleSelectAll = useCallback(() => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      // Create a Set directly from product IDs for better performance
      const productIds = new Set(products.map(p => p.id));
      setSelectedProducts(productIds);
    }
  }, [selectedProducts.size, products]);

  const handleSelectProduct = useCallback((productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  }, [selectedProducts]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedProducts.size === 0) return;
    
    try {
      const response = await fetch('/api/admin/products/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts),
          action: activeTab === 'active' ? 'soft-delete' : 'permanent-delete'
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete products');
      }

      showToast.success(`${selectedProducts.size} products deleted successfully`);
      setSelectedProducts(new Set());
      fetchProducts(false);
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : 'Failed to delete products');
    }
    setShowBulkDeleteDialog(false);
  }, [selectedProducts, activeTab, fetchProducts]);

  const handleBulkRestore = useCallback(async () => {
    if (selectedProducts.size === 0) return;
    
    try {
      const response = await fetch('/api/admin/products/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts),
          action: 'restore'
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to restore products');
      }

      showToast.success(`${selectedProducts.size} products restored successfully`);
      setSelectedProducts(new Set());
      fetchProducts(false);
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : 'Failed to restore products');
    }
  }, [selectedProducts, fetchProducts]);

  // Export functions
  const exportToPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const productsToExport = selectedProducts.size > 0 
        ? products.filter(p => selectedProducts.has(p.id))
        : products;

      // Title
      doc.setFontSize(20);
      doc.text('Products Report', 20, 20);
      
      // Date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Table data
      const tableData = productsToExport.map(product => [
        product.name,
        product.sku,
        `৳${product.price}`,
        product.stock.toString(),
        [
          product.isFeatured ? 'Featured' : '',
          product.isNewArrival ? 'New' : '',
          product.isPopular ? 'Popular' : ''
        ].filter(Boolean).join(', ') || '-'
      ]);

      // Create table
      // Using properly typed approach for jspdf-autotable
      // @ts-expect-error - jspdf-autotable extends jsPDF prototype
      doc.autoTable({
        head: [['Name', 'SKU', 'Price', 'Stock', 'Status']],
        body: tableData,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      doc.save(`products-${new Date().toISOString().split('T')[0]}.pdf`);
      showToast.success('PDF exported successfully');
    } catch {
      showToast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  }, [products, selectedProducts]);

  const exportToCSV = useCallback(() => {
    const productsToExport = selectedProducts.size > 0 
      ? products.filter(p => selectedProducts.has(p.id))
      : products;

    const csvContent = [
      ['Name', 'SKU', 'Price', 'Sale Price', 'Stock', 'Featured', 'New Arrival', 'Popular', 'Category'],
      ...productsToExport.map(product => [
        `"${product.name.replace(/"/g, '""')}"`,
        product.sku,
        product.price,
        product.salePrice || '',
        product.stock,
        product.isFeatured ? 'Yes' : 'No',
        product.isNewArrival ? 'Yes' : 'No',
        product.isPopular ? 'Yes' : 'No',
        `"${(product.category?.name || '').replace(/"/g, '""')}"`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `products-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast.success('CSV exported successfully');
  }, [products, selectedProducts]);

  const handlePrint = useCallback(() => {
    const productsToExport = selectedProducts.size > 0 
      ? products.filter(p => selectedProducts.has(p.id))
      : products;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Products Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .meta { margin-bottom: 20px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .badge { display: inline-block; padding: 2px 6px; margin: 1px; background-color: #e3f2fd; border-radius: 3px; font-size: 0.8em; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Products Report</h1>
          <div class="meta">
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Total Products: ${productsToExport.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${productsToExport.map(product => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.sku}</td>
                  <td>৳${product.price}</td>
                  <td>${product.stock}</td>
                  <td>
                    ${product.isFeatured ? '<span class="badge">Featured</span>' : ''}
                    ${product.isNewArrival ? '<span class="badge">New</span>' : ''}
                    ${product.isPopular ? '<span class="badge">Popular</span>' : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  }, [products, selectedProducts]);

  const FilterControls = () => {
    return (
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
            className="w-full" />
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
  };

  // Highly optimized product row rendering with memoization
  const productRows = useMemo(() => products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Checkbox
                  checked={selectedProducts.has(product.id)}
                  onCheckedChange={() => handleSelectProduct(product.id)}
                />
              </TableCell>
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
    )), [products, selectedProducts, activeTab, handleSelectProduct, handleEdit, handleSoftDelete, handleRestore, handlePermanentDelete]);
  
  if (error) return <div className="text-red-500 text-center p-4">Error: {error}. Please try refreshing the page.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
        <div className="flex items-center gap-2">
          {/* Export Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportToPDF}>
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToCSV}>
                <FileText className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
          <Button variant="outline" onClick={() => fetchProducts(true)}>
            <RotateCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedProducts.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedProducts.size} product{selectedProducts.size > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'active' ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowBulkDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Move to Trash ({selectedProducts.size})
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkRestore}
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  Restore ({selectedProducts.size})
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowBulkDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Permanently ({selectedProducts.size})
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedProducts(new Set())}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}
      
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
                            <TableHead className="w-12">
                              <Checkbox
                                checked={selectedProducts.size === products.length && products.length > 0}
                                onCheckedChange={handleSelectAll}
                              />
                            </TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>{productRows.length > 0 ? productRows : <TableRow><TableCell colSpan={8} className="text-center h-24">No products found.</TableCell></TableRow>}</TableBody>
                    </Table>
                </div>
                </TabsContent>
            )}
        </div>
      </Tabs>

      {!isLoading && <DataTablePagination 
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalRecords={pagination.totalCount}
        pageSize={pagination.pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />}

      {isDialogOpen && <ProductDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingProduct(null);
            fetchProducts(false);
          }
        }}
        product={editingProduct || undefined}
      />}

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Bulk {activeTab === 'active' ? 'Delete' : 'Permanent Delete'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {activeTab === 'active' 
                ? `Are you sure you want to move ${selectedProducts.size} product${selectedProducts.size > 1 ? 's' : ''} to trash? This action can be undone.`
                : `Are you sure you want to permanently delete ${selectedProducts.size} product${selectedProducts.size > 1 ? 's' : ''}? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {activeTab === 'active' ? 'Move to Trash' : 'Delete Permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 