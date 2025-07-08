'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DataTablePagination } from '@/components/ui/DataTablePagination';
import {
  Plus,
  Search,
  RefreshCw,
  Download,
  FileText,
  Printer,
  Calendar as CalendarIcon,
  Filter,
  MoreVertical,
  X,
  Edit,
  Trash2,
  Eye,
  EyeOff,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
  };
}

interface CategoryFilters {
  search: string;
  status: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Define Dialog component for editing/adding categories
function CategoryDialog({
  isOpen,
  onClose,
  category,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSave: (category: Partial<Category>) => void;
}) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    image: category?.image || '',
    isActive: category?.isActive !== undefined ? category.isActive : true,
    sortOrder: category?.sortOrder || 0
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Reset form when category changes
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        image: category.image || '',
        isActive: category.isActive !== undefined ? category.isActive : true,
        sortOrder: category.sortOrder || 0
      });
    }
  }, [category]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSave({
        id: category?.id,
        ...formData
      });
    } catch (error) {
      console.error('Error saving category:', error);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{category ? 'Edit Category' : 'Add Category'}</AlertDialogTitle>
          <AlertDialogDescription>
            {category ? 'Update the category details below.' : 'Fill in the details to create a new category.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Category name"
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Category description"
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="image" className="text-sm font-medium">Image URL</label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => handleChange('image', e.target.value)}
              placeholder="Image URL"
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="sortOrder" className="text-sm font-medium">Sort Order</label>
            <Input
              id="sortOrder"
              type="number"
              value={formData.sortOrder.toString()}
              onChange={(e) => handleChange('sortOrder', parseInt(e.target.value) || 0)}
              placeholder="Sort order"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange('isActive', checked === true)}
            />
            <label htmlFor="isActive" className="text-sm font-medium">Active</label>
          </div>
        </div>
        
        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name.trim()}>
            {isSubmitting ? (
              <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Saving</>
            ) : (
              <>Save</>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function CategoriesPage() {
  const [filters, setFilters] = useState<CategoryFilters>({
    search: '',
    status: 'all',
    dateFrom: null,
    dateTo: null,
    sortBy: 'sortOrder',
    sortOrder: 'asc'
  });
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate' | 'delete'>('activate');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch categories with advanced filtering
  const { data: categoriesData, isLoading, refetch } = useQuery({
    queryKey: ['categories', filters, currentPage, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        search: filters.search,
        status: filters.status === 'all' ? '' : filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.dateFrom && { dateFrom: filters.dateFrom.toISOString() }),
        ...(filters.dateTo && { dateTo: filters.dateTo.toISOString() }),
      });
      
      const response = await fetch(`/api/admin/categories?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    }
  });

  // Bulk update categories mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ action, categoryIds }: { action: string; categoryIds: string[] }) => {
      const response = await fetch('/api/admin/categories/bulk-update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, categoryIds })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update categories');
      }
      
      return response.json();
    },
    onSuccess: () => {
      showToast.success('Categories updated successfully');
      setSelectedCategories(new Set());
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      showToast.error(error instanceof Error ? error.message : 'Failed to update categories');
    }
  });

  // Bulk delete categories mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (categoryIds: string[]) => {
      const response = await fetch('/api/admin/categories/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryIds })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete categories');
      }
      
      return response.json();
    },
    onSuccess: () => {
      showToast.success('Categories deleted successfully');
      setSelectedCategories(new Set());
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      showToast.error(error instanceof Error ? error.message : 'Failed to delete categories');
    }
  });

  // Event handlers
  const handleSelectAll = useCallback(() => {
    if (selectedCategories.size === categoriesData?.categories?.length) {
      setSelectedCategories(new Set());
    } else {
      const allIds = new Set(categoriesData?.categories?.map((category: Category) => category.id) || []);
      setSelectedCategories(allIds as Set<string>);
    }
  }, [selectedCategories.size, categoriesData?.categories]);

  const handleSelectCategory = useCallback((categoryId: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  }, [selectedCategories]);

  const handleBulkAction = useCallback(async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedCategories.size === 0) return;

    const categoryIds = Array.from(selectedCategories);
    
    if (action === 'delete') {
      await bulkDeleteMutation.mutateAsync(categoryIds);
    } else {
      await bulkUpdateMutation.mutateAsync({ action, categoryIds });
    }
    
    setShowBulkDialog(false);
  }, [selectedCategories, bulkUpdateMutation, bulkDeleteMutation]);

  const handleFilterChange = useCallback((key: keyof CategoryFilters, value: string | Date | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      dateFrom: null,
      dateTo: null,
      sortBy: 'sortOrder',
      sortOrder: 'asc'
    });
    setCurrentPage(1);
  }, []);

  // Export functions
  const exportToCSV = useCallback(() => {
    if (!categoriesData?.categories?.length) return;

    const headers = [
      'Name',
      'Slug',
      'Description',
      'Products Count',
      'Status',
      'Sort Order',
      'Created At',
      'Updated At'
    ];

    const csvData = categoriesData.categories.map((category: Category) => [
      category.name,
      category.slug,
      category.description || '',
      category._count.products,
      category.isActive ? 'Active' : 'Inactive',
      category.sortOrder,
      format(new Date(category.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      format(new Date(category.updatedAt), 'yyyy-MM-dd HH:mm:ss')
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map((cell: any) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `categories-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  }, [categoriesData]);

  const exportToPDF = useCallback(() => {
    if (!categoriesData?.categories?.length) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Categories Report', 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 20, 30);

    const tableData = categoriesData.categories.map((category: Category) => [
      category.name,
      category.slug,
      category.description?.substring(0, 30) + (category.description && category.description.length > 30 ? '...' : '') || '',
      category._count.products.toString(),
      category.isActive ? 'Active' : 'Inactive',
      category.sortOrder.toString(),
      format(new Date(category.createdAt), 'yyyy-MM-dd')
    ]);

    autoTable(doc, {
      head: [['Name', 'Slug', 'Description', 'Products', 'Status', 'Order', 'Created']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`categories-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  }, [categoriesData]);

  const printTable = useCallback(() => {
    if (!categoriesData?.categories?.length) return;

    const printContent = `
      <html>
        <head>
          <title>Categories Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .status { padding: 4px 8px; border-radius: 4px; }
            .active { background-color: #dcfce7; color: #166534; }
            .inactive { background-color: #fef3c7; color: #d97706; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>Categories Report</h1>
          <p>Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Products</th>
                <th>Status</th>
                <th>Order</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              ${categoriesData.categories.map((category: Category) => `
                <tr>
                  <td>${category.name}</td>
                  <td>${category.slug}</td>
                  <td>${category.description?.substring(0, 50) + (category.description && category.description.length > 50 ? '...' : '') || ''}</td>
                  <td>${category._count.products}</td>
                  <td><span class="status ${category.isActive ? 'active' : 'inactive'}">${category.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>${category.sortOrder}</td>
                  <td>${format(new Date(category.createdAt), 'yyyy-MM-dd')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }, [categoriesData]);

  const handleEditCategory = useCallback((category: Category) => {
    // Set form data for editing
    setEditingCategory(category);
    setIsEditDialogOpen(true);
  }, []);

  const handleAddCategory = useCallback(() => {
    setEditingCategory(null);
    setIsEditDialogOpen(true);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Categories</h1>
            <p className="text-muted-foreground">Loading categories...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const categories = categoriesData?.categories || [];
  const totalCount = categoriesData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Manage product categories ({totalCount} total)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleAddCategory}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportToCSV}>
                <FileText className="h-4 w-4 mr-2" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={printTable}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filters</span>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Date From</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom || undefined}
                      onSelect={(date) => handleFilterChange('dateFrom', date || null)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Date To</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? format(filters.dateTo, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo || undefined}
                      onSelect={(date) => handleFilterChange('dateTo', date || null)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedCategories.size > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="font-medium">
                  {selectedCategories.size} categor{selectedCategories.size !== 1 ? 'ies' : 'y'} selected
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkAction('activate');
                    setShowBulkDialog(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkAction('deactivate');
                    setShowBulkDialog(true);
                  }}
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Deactivate
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setBulkAction('delete');
                    setShowBulkDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCategories.size === categories.length && categories.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all categories"
                    />
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category: Category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCategories.has(category.id)}
                        onCheckedChange={() => handleSelectCategory(category.id)}
                        aria-label={`Select category ${category.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {category.image && (
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100">
                            <OptimizedImage
                              src={category.image}
                              alt={category.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-muted-foreground">
                            <Link href={`/shop/${category.slug}`} target="_blank" className="hover:underline text-blue-600 flex items-center gap-1">
                              <span className="truncate max-w-[140px]">/{category.slug}</span>
                            </Link>
                          </div>
                          {category.description && (
                            <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                              {category.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category._count?.products || 0}</span>
                        <span className="text-sm text-muted-foreground">products</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={category.isActive ? 'default' : 'secondary'}
                        className={category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{category.sortOrder}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(category.createdAt), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(category.createdAt), 'HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Category
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => bulkUpdateMutation.mutate({ 
                              action: category.isActive ? 'deactivate' : 'activate', 
                              categoryIds: [category.id] 
                            })}
                          >
                            {category.isActive ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => bulkDeleteMutation.mutate([category.id])}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Category
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {categories.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No categories found</h3>
              <p className="text-muted-foreground">
                {filters.search || filters.status !== 'all' || filters.dateFrom || filters.dateTo
                  ? 'Try adjusting your filters.'
                  : 'Start by creating your first category.'}
              </p>
              {!(filters.search || filters.status !== 'all' || filters.dateFrom || filters.dateTo) && (
                <Button onClick={handleAddCategory} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <DataTablePagination
          page={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRecords={totalCount}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Bulk Action Dialog */}
      <AlertDialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === 'activate' ? 'Activate Categories' : 
               bulkAction === 'deactivate' ? 'Deactivate Categories' : 'Delete Categories'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === 'activate' 
                ? `Are you sure you want to activate ${selectedCategories.size} categor${selectedCategories.size !== 1 ? 'ies' : 'y'}?`
                : bulkAction === 'deactivate'
                ? `Are you sure you want to deactivate ${selectedCategories.size} categor${selectedCategories.size !== 1 ? 'ies' : 'y'}?`
                : `Are you sure you want to delete ${selectedCategories.size} categor${selectedCategories.size !== 1 ? 'ies' : 'y'}? This action cannot be undone and will affect all associated products.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleBulkAction(bulkAction)}
              className={bulkAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {bulkAction === 'activate' ? 'Activate' : 
               bulkAction === 'deactivate' ? 'Deactivate' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Category Edit Dialog */}
      <CategoryDialog 
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        category={editingCategory}
        onSave={async (updatedCategory) => {
          try {
            const method = updatedCategory.id ? 'PUT' : 'POST';
            const url = '/api/admin/categories';
            
            const response = await fetch(url, {
              method,
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(updatedCategory)
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to save category');
            }
            
            setIsEditDialogOpen(false);
            setEditingCategory(null);
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            showToast.success(updatedCategory.id ? 'Category updated successfully' : 'Category created successfully');
          } catch (error) {
            console.error('Failed to save category:', error);
            showToast.error(error instanceof Error ? error.message : 'Failed to save category');
          }
        }}
      />

      {/* Category Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (editingCategory) {
                  bulkDeleteMutation.mutate([editingCategory.id]);
                  setIsDeleteDialogOpen(false);
                  setEditingCategory(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
