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
// Dynamic imports for PDF export to reduce bundle size

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
    
    const productIds = Array.from(selectedProducts);
    const action = activeTab === 'active' ? 'soft-delete' : 'permanent-delete';
    
    console.log('🗑️ Bulk delete starting:', { 
      productIds, 
      action, 
      selectedProductsSize: selectedProducts.size,
      activeTab 
    });
    
    try {
      const response = await fetch('/api/admin/products/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds,
          action
        }),
      });

      console.log('🔄 Bulk delete response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Bulk delete response error:', errorData);
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Bulk delete success:', result);
      
      const message = result.message || `${selectedProducts.size} products deleted successfully`;
      showToast.success(message);
      
      setSelectedProducts(new Set());
      fetchProducts(false);
    } catch (error) {
      console.error('❌ Bulk delete error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast.error(`Failed to delete products: ${errorMessage}`);
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

  // Export functions - Enhanced with better error handling and more data
  const exportToPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      // Try different approaches for PDF export
      let doc, jsPDF;
      
      try {
        // Method 1: Standard import approach
        jsPDF = (await import('jspdf')).jsPDF;
        await import('jspdf-autotable');
        doc = new jsPDF('l', 'mm', 'a4');
      } catch (importError) {
        console.error('Failed to import PDF libraries:', importError);
        throw new Error('Failed to load PDF export libraries');
      }
      
      const productsToExport = selectedProducts.size > 0 
        ? products.filter(p => selectedProducts.has(p.id))
        : products;

      if (productsToExport.length === 0) {
        showToast.error('No products to export');
        return;
      }

      // Header
      doc.setFontSize(20);
      doc.text('Products Report - Rupomoti', 20, 20);
      
      // Metadata
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
      doc.text(`Total Products: ${productsToExport.length}`, 20, 35);
      doc.text(`Status: ${activeTab.toUpperCase()}`, 150, 35);
      
      // Prepare table data
      const tableData = productsToExport.map(product => [
        product.name.substring(0, 30) + (product.name.length > 30 ? '...' : ''),
        product.sku,
        `৳${product.price.toLocaleString()}`,
        product.salePrice ? `৳${product.salePrice.toLocaleString()}` : '-',
        product.stock.toString(),
        product.category?.name || 'No Category',
        [
          product.isFeatured ? 'Featured' : '',
          product.isNewArrival ? 'New' : '',
          product.isPopular ? 'Popular' : ''
        ].filter(Boolean).join(', ') || 'Regular',
        new Date(product.createdAt).toLocaleDateString()
      ]);

      try {
        // Try using autoTable - should work after import
        // @ts-expect-error - autoTable is dynamically added to jsPDF prototype
        doc.autoTable({
          head: [['Name', 'SKU', 'Price', 'Sale Price', 'Stock', 'Category', 'Status', 'Created']],
          body: tableData,
          startY: 45,
          styles: { 
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak'
          },
          headStyles: { 
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 25 },
            2: { cellWidth: 20 },
            3: { cellWidth: 20 },
            4: { cellWidth: 15 },
            5: { cellWidth: 30 },
            6: { cellWidth: 25 },
            7: { cellWidth: 20 }
          },
          margin: { top: 45, left: 10, right: 10 }
        });
      } catch (tableError) {
        console.error('Failed to create table, using basic PDF:', tableError);
        // Fallback: Create basic PDF without table
        doc.setFontSize(12);
        let yPos = 50;
        
        // Add headers
        doc.text('Name', 20, yPos);
        doc.text('SKU', 80, yPos);
        doc.text('Price', 120, yPos);
        doc.text('Stock', 160, yPos);
        doc.text('Category', 200, yPos);
        yPos += 10;
        
        // Add products
        productsToExport.forEach(product => {
          doc.setFontSize(10);
          doc.text(product.name.substring(0, 20), 20, yPos);
          doc.text(product.sku, 80, yPos);
          doc.text(`৳${product.price}`, 120, yPos);
          doc.text(product.stock.toString(), 160, yPos);
          doc.text(product.category?.name || 'None', 200, yPos);
          yPos += 8;
          
          // Start new page if needed
          if (yPos > 190) {
            doc.addPage();
            yPos = 20;
          }
        });
      }

      // Save the PDF
      doc.save(`products-${activeTab}-${new Date().toISOString().split('T')[0]}.pdf`);
      showToast.success('PDF exported successfully');
    } catch (error) {
      console.error('PDF Export Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast.error(`Failed to export PDF: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  }, [products, selectedProducts, activeTab]);

  // Enhanced CSV export with more product information
  const exportToCSV = useCallback(() => {
    const productsToExport = selectedProducts.size > 0 
      ? products.filter(p => selectedProducts.has(p.id))
      : products;

    const csvContent = [
      ['Name', 'SKU', 'Price', 'Sale Price', 'Stock', 'Category', 'Featured', 'New Arrival', 'Popular', 'Created Date', 'Status'],
      ...productsToExport.map(product => [
        `"${product.name.replace(/"/g, '""')}"`,
        product.sku,
        product.price,
        product.salePrice || '',
        product.stock,
        `"${(product.category?.name || 'No Category').replace(/"/g, '""')}"`,
        product.isFeatured ? 'Yes' : 'No',
        product.isNewArrival ? 'Yes' : 'No',
        product.isPopular ? 'Yes' : 'No',
        new Date(product.createdAt).toLocaleDateString(),
        activeTab.toUpperCase()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `products-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast.success('CSV exported successfully');
  }, [products, selectedProducts, activeTab]);

  // Enhanced print function with comprehensive product information
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
          <title>Products Report - Rupomoti</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #333; }
            .header { border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; }
            h1 { color: #1e40af; margin: 0; font-size: 28px; }
            .meta { margin-bottom: 25px; color: #6b7280; background: #f9fafb; padding: 15px; border-radius: 8px; }
            .meta p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; vertical-align: top; }
            th { background-color: #3b82f6; color: white; font-weight: bold; font-size: 11px; }
            tr:nth-child(even) { background-color: #f8fafc; }
            tr:hover { background-color: #e0f2fe; }
            .badge { display: inline-block; padding: 2px 8px; margin: 1px; background-color: #dbeafe; 
                     border-radius: 12px; font-size: 10px; color: #1e40af; border: 1px solid #93c5fd; }
            .price { font-weight: bold; color: #059669; }
            .stock-high { color: #059669; font-weight: bold; }
            .stock-low { color: #dc2626; font-weight: bold; }
            .stock-medium { color: #d97706; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 10px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              table { font-size: 10px; }
              th, td { padding: 6px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Products Report - Rupomoti</h1>
          </div>
          <div class="meta">
            <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Total Products:</strong> ${productsToExport.length}</p>
            <p><strong>Status:</strong> ${activeTab.toUpperCase()}</p>
            <p><strong>Selected Products:</strong> ${selectedProducts.size > 0 ? `${selectedProducts.size} selected` : 'All products'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Sale Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Status</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              ${productsToExport.map(product => `
                <tr>
                  <td><strong>${product.name}</strong></td>
                  <td><code style="background: #f3f4f6; padding: 2px 4px; border-radius: 3px;">${product.sku}</code></td>
                  <td class="price">৳${product.price.toLocaleString()}</td>
                  <td>${product.salePrice ? `৳${product.salePrice.toLocaleString()}` : '-'}</td>
                  <td class="${product.stock > 10 ? 'stock-high' : product.stock > 0 ? 'stock-medium' : 'stock-low'}">${product.stock}</td>
                  <td>${product.category?.name || 'No Category'}</td>
                  <td>
                    ${product.isFeatured ? '<span class="badge">Featured</span>' : ''}
                    ${product.isNewArrival ? '<span class="badge">New</span>' : ''}
                    ${product.isPopular ? '<span class="badge">Popular</span>' : ''}
                    ${!product.isFeatured && !product.isNewArrival && !product.isPopular ? '<span class="badge">Regular</span>' : ''}
                  </td>
                  <td>${new Date(product.createdAt).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Rupomoti - Generated from Admin Panel</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }, [products, selectedProducts, activeTab]);

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

  // Highly optimized product row rendering with memoization and enhanced mobile view
  const productRows = useMemo(() => products.map((product) => (
            <TableRow key={product.id} className="hover:bg-muted/50">
              <TableCell className="w-10">
                <Checkbox
                  checked={selectedProducts.has(product.id)}
                  onCheckedChange={() => handleSelectProduct(product.id)}
                />
              </TableCell>
              <TableCell className="p-2">
                <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={product.images[0] || '/placeholder.png'}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 48px, 64px"
                  />
                </div>
              </TableCell>
              {/* Enhanced product info cell with mobile optimization */}
              <TableCell className="min-w-[200px]">
                <div className="space-y-1">
                  <h3 className="font-medium text-sm md:text-base truncate">{product.name}</h3>
                  <div className="flex flex-col md:flex-row md:items-center gap-1 text-xs text-muted-foreground">
                    <span className="font-mono bg-muted px-2 py-1 rounded text-xs">{product.sku}</span>
                    {product.category && (
                      <span className="text-blue-600 truncate">{product.category.name}</span>
                    )}
                  </div>
                  {/* Mobile-only: Show key info */}
                  <div className="md:hidden space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-green-600">৳{product.price.toLocaleString()}</span>
                      {product.salePrice && (
                        <span className="text-sm text-muted-foreground line-through">৳{product.salePrice.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                </div>
              </TableCell>
              {/* Desktop-only columns */}
              <TableCell className="hidden md:table-cell">
                <div className="space-y-1">
                  <div className="font-semibold text-green-600">৳{product.price.toLocaleString()}</div>
                  {product.salePrice && (
                    <div className="text-sm text-muted-foreground line-through">৳{product.salePrice.toLocaleString()}</div>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  product.stock > 10 
                    ? 'bg-green-100 text-green-800' 
                    : product.stock > 0 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock}
                </span>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {product.category?.name || 'No Category'}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {product.isFeatured && <Badge variant="outline" className="text-xs">Featured</Badge>}
                  {product.isNewArrival && <Badge variant="outline" className="border-blue-500 text-blue-500 text-xs">New</Badge>}
                  {product.isPopular && <Badge variant="outline" className="border-green-500 text-green-500 text-xs">Popular</Badge>}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                {new Date(product.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
            {activeTab === 'active' ? (
              <>
                <Button variant="outline" size="sm" onClick={() => handleEdit(product)} className="h-8 px-2 text-xs">
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleSoftDelete(product.id)} className="h-8 px-2">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => handleRestore(product.id)} className="h-8 px-2 text-xs">
                  <RotateCw className="mr-1 h-3 w-3" /> Restore
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handlePermanentDelete(product.id)} className="h-8 px-2 text-xs">
                  <Trash2 className="mr-1 h-3 w-3" /> Delete
                </Button>
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

      {/* Enhanced Mobile-Optimized Bulk Actions Toolbar */}
      {selectedProducts.size > 0 && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2 md:space-y-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">
              {selectedProducts.size}
            </div>
            <span className="text-sm font-medium text-blue-900">
              {selectedProducts.size} product{selectedProducts.size > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {activeTab === 'active' ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowBulkDeleteDialog(true)}
                className="text-xs px-3 h-8"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Move to Trash ({selectedProducts.size})
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkRestore}
                  className="text-xs px-3 h-8"
                >
                  <RotateCw className="mr-1 h-3 w-3" />
                  Restore ({selectedProducts.size})
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowBulkDeleteDialog(true)}
                  className="text-xs px-3 h-8"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete Permanently ({selectedProducts.size})
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedProducts(new Set())}
              className="text-xs px-3 h-8 text-gray-600 hover:text-gray-900"
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
                            <TableHead className="w-10">
                              <Checkbox
                                checked={selectedProducts.size === products.length && products.length > 0}
                                onCheckedChange={handleSelectAll}
                              />
                            </TableHead>
                            <TableHead className="w-16">Image</TableHead>
                            <TableHead className="min-w-[200px]">Product Info</TableHead>
                            <TableHead className="hidden md:table-cell">Price</TableHead>
                            <TableHead className="hidden md:table-cell">Stock</TableHead>
                            <TableHead className="hidden lg:table-cell">Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden md:table-cell">Created</TableHead>
                            <TableHead className="w-24">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>{productRows.length > 0 ? productRows : <TableRow><TableCell colSpan={9} className="text-center h-24">No products found.</TableCell></TableRow>}</TableBody>
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