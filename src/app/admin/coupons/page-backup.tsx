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
  AlertTriangle,
  Copy,
  Percent,
  DollarSign
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

interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  value: number;
  minimumAmount: number | null;
  maximumDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
  description?: string;
  applicableZones: string[];
}

interface CouponFilters {
  search: string;
  type: string;
  status: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function CouponsPage() {
  // Helper functions
  // (Removed top-level declarations of formatDate, isExpired, getUsagePercentage)

  // Format date with null check
  const formatDate = useCallback((date: string | null | undefined) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      return 'Invalid Date';
    }
  }, []);

  // Helper function to check if a coupon is expired
  const isExpired = useCallback((date: string | null): boolean => {
    if (!date) return false;
    return new Date(date) < new Date();
  }, []);

  // Helper function to calculate usage percentage
  const getUsagePercentage = useCallback((used: number, limit: number | null): number => {
    if (!limit) return 0;
    return (used / limit) * 100;
  }, []);

  const [filters, setFilters] = useState<CouponFilters>({
    search: '',
    type: 'all',
    status: 'all',
    dateFrom: null,
    dateTo: null,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [selectedCoupons, setSelectedCoupons] = useState<Set<string>>(new Set());
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate' | 'delete'>('activate');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const queryClient = useQueryClient();

  // Fetch coupons with advanced filtering
  const { data: couponsData, isLoading, refetch } = useQuery({
    queryKey: ['coupons', filters, currentPage, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        search: filters.search,
        type: filters.type === 'all' ? '' : filters.type,
        status: filters.status === 'all' ? '' : filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.dateFrom && { dateFrom: filters.dateFrom.toISOString() }),
        ...(filters.dateTo && { dateTo: filters.dateTo.toISOString() }),
      });
      
      const response = await fetch(`/api/admin/coupons?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch coupons');
      }
      return response.json();
    }
  });

  // Bulk update coupons mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ action, couponIds }: { action: string; couponIds: string[] }) => {
      const response = await fetch('/api/admin/coupons/bulk-update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, couponIds })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update coupons');
      }
      
      return response.json();
    },
    onSuccess: () => {
      showToast.success('Coupons updated successfully');
      setSelectedCoupons(new Set());
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
    onError: (error) => {
      showToast.error(error instanceof Error ? error.message : 'Failed to update coupons');
    }
  });

  // Bulk delete coupons mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (couponIds: string[]) => {
      const response = await fetch('/api/admin/coupons/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponIds })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete coupons');
      }
      
      return response.json();
    },
    onSuccess: () => {
      showToast.success('Coupons deleted successfully');
      setSelectedCoupons(new Set());
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
    onError: (error) => {
      showToast.error(error instanceof Error ? error.message : 'Failed to delete coupons');
    }
  });

  // Event handlers
  const handleSelectAll = useCallback(() => {
    if (selectedCoupons.size === couponsData?.coupons?.length) {
      setSelectedCoupons(new Set());
    } else {
      const allIds = new Set<string>(couponsData?.coupons?.map((coupon: Coupon) => coupon.id) || []);
      setSelectedCoupons(allIds);
    }
  }, [selectedCoupons.size, couponsData?.coupons]);

  const handleSelectCoupon = useCallback((couponId: string) => {
    const newSelected = new Set(selectedCoupons);
    if (newSelected.has(couponId)) {
      newSelected.delete(couponId);
    } else {
      newSelected.add(couponId);
    }
    setSelectedCoupons(newSelected);
  }, [selectedCoupons]);

  const handleBulkAction = useCallback(async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedCoupons.size === 0) return;

    const couponIds = Array.from(selectedCoupons);
    
    if (action === 'delete') {
      await bulkDeleteMutation.mutateAsync(couponIds);
    } else {
      await bulkUpdateMutation.mutateAsync({ action, couponIds });
    }
    
    setShowBulkDialog(false);
  }, [selectedCoupons, bulkUpdateMutation, bulkDeleteMutation]);

  const handleFilterChange = useCallback((key: keyof CouponFilters, value: string | Date | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      type: 'all',
      status: 'all',
      dateFrom: null,
      dateTo: null,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setCurrentPage(1);
  }, []);

  const copyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    showToast.success('Coupon code copied to clipboard');
  }, []);

  // Export functions
  const exportToCSV = useCallback(() => {
    if (!couponsData?.coupons?.length) return;

    const headers = [
      'Code',
      'Type',
      'Value',
      'Min. Amount',
      'Limit',
      'Used',
      'Status',
      'Valid Until',
      'Created At'
    ];

    const csvContent = couponsData.coupons.map((coupon: Coupon) => [
      coupon.code,
      coupon.type,
      coupon.value,
      coupon.minimumAmount || 'N/A',
      coupon.isActive ? 'Active' : 'Inactive',
      coupon.usageLimit || 'Unlimited',
      coupon.usedCount || 0,
      formatDate(coupon.validUntil),
      formatDate(coupon.createdAt),
    ]);
    
    const csvData = [headers, ...csvContent]
      .map(row => row.map((cell: any) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `coupons-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  }, [couponsData, formatDate]);

  const exportToPDF = useCallback(() => {
    if (!couponsData?.coupons?.length) return;

    const doc = new jsPDF();
    
    const tableColumn = [
      'Code', 
      'Type', 
      'Value', 
      'Limit',
      'Used',
      'Status',
      'Valid Until'
    ];
    
    const tableRows = couponsData.coupons.map((coupon: Coupon) => [
      coupon.code,
      coupon.type,
      coupon.value, // Changed from formatDiscountValue(coupon) to coupon.value
      coupon.usageLimit || 'Unlimited',
      coupon.usedCount.toString(),
      coupon.isActive ? 'Active' : 'Inactive',
      formatDate(coupon.validUntil)
    ]);
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`coupons-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  }, [couponsData, formatDate]);

  const printTable = useCallback(() => {
    if (!couponsData?.coupons?.length) return;

    const printContent = `
      <html>
        <head>
          <title>Coupons Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .status { padding: 4px 8px; border-radius: 4px; }
            .active { background-color: #dcfce7; color: #166534; }
            .inactive { background-color: #fef3c7; color: #d97706; }
            .percentage { color: #059669; }
            .fixed { color: #dc2626; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>Coupons Report</h1>
          <p>Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}</p>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Usage</th>
                <th>Status</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tbody>
              ${couponsData.coupons.map((coupon: Coupon) => `
                <tr>
                  <td><strong>${coupon.code}</strong></td>
                  <td><span class="${coupon.type.toLowerCase()}">${coupon.type}</span></td>
                  <td>${coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `৳${coupon.value}`}</td>
                  <td>${coupon.usedCount}/${coupon.usageLimit || '∞'}</td>
                  <td><span class="status ${coupon.isActive ? 'active' : 'inactive'}">${coupon.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>${coupon.validUntil ? format(new Date(coupon.validUntil), 'yyyy-MM-dd') : 'No expiry date'}</td>
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
  }, [couponsData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Coupons</h1>
            <p className="text-muted-foreground">Loading coupons...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const coupons = couponsData?.coupons || [];
  const totalCount = couponsData?.pagination?.totalCount || 0;
  const totalPages = couponsData?.pagination?.totalPages || Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Coupons</h1>
          <p className="text-muted-foreground">
            Manage discount coupons and promotions ({totalCount} total)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Coupon
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search coupons..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                    <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="expired">Expired</SelectItem>
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
                      selected={filters.dateFrom as Date}
                      onSelect={(date) => handleFilterChange('dateFrom', date || null)}
                      className="border rounded-md p-3"
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
                      selected={filters.dateTo as Date}
                      onSelect={(date) => handleFilterChange('dateTo', date || null)}
                      className="border rounded-md p-3"
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
      {selectedCoupons.size > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="font-medium">
                  {selectedCoupons.size} coupon{selectedCoupons.size !== 1 ? 's' : ''} selected
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

      {/* Coupons Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCoupons.size === coupons.length && coupons.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all coupons"
                    />
                  </TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon: Coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCoupons.has(coupon.id)}
                        onCheckedChange={() => handleSelectCoupon(coupon.id)}
                        aria-label={`Select coupon ${coupon.code}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-mono font-medium bg-gray-100 px-2 py-1 rounded text-sm">
                            {coupon.code}
                          </div>
                          {coupon.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {coupon.description}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCode(coupon.code)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {coupon.type === 'PERCENTAGE' ? (
                          <Percent className="h-4 w-4 text-green-600" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-blue-600" />
                        )}
                        <div>
                          <div className="font-medium">
                            {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `৳${coupon.value}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {coupon.type === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {coupon.usedCount || 0}/{coupon.usageLimit || '∞'}
                        </div>
                        {coupon.usageLimit && (
                          <div className="w-16 bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-blue-600 h-1 rounded-full"
                              style={{ width: `${Math.min(getUsagePercentage(coupon.usedCount || 0, coupon.usageLimit), 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {coupon.validUntil && isExpired(coupon.validUntil) ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : (
                          <Badge 
                            variant={coupon.isActive ? 'default' : 'secondary'}
                            className={coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                          >
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {coupon.validUntil 
                          ? format(new Date(coupon.validUntil), 'MMM dd, yyyy')
                          : 'No expiry date'
                        }
                      </div>
                      {coupon.validUntil && (
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(coupon.validUntil), 'HH:mm')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(coupon.createdAt), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(coupon.createdAt), 'HH:mm')}
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
                          <DropdownMenuItem onClick={() => copyCode(coupon.code)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Code
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Coupon
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => bulkUpdateMutation.mutate({ 
                              action: coupon.isActive ? 'deactivate' : 'activate', 
                              couponIds: [coupon.id] 
                            })}
                          >
                            {coupon.isActive ? (
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
                            onClick={() => bulkDeleteMutation.mutate([coupon.id])}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Coupon
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {coupons.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No coupons found</h3>
              <p className="text-muted-foreground">
                {filters.search || filters.type !== 'all' || filters.status !== 'all' || filters.dateFrom || filters.dateTo
                  ? 'Try adjusting your filters.'
                  : 'Start by creating your first coupon.'}
              </p>
              {!(filters.search || filters.type !== 'all' || filters.status !== 'all' || filters.dateFrom || filters.dateTo) && (
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Coupon
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
              {bulkAction === 'activate' ? 'Activate Coupons' : 
               bulkAction === 'deactivate' ? 'Deactivate Coupons' : 'Delete Coupons'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === 'activate' 
                ? `Are you sure you want to activate ${selectedCoupons.size} coupon${selectedCoupons.size !== 1 ? 's' : ''}?`
                : bulkAction === 'deactivate'
                ? `Are you sure you want to deactivate ${selectedCoupons.size} coupon${selectedCoupons.size !== 1 ? 's' : ''}?`
                : `Are you sure you want to delete ${selectedCoupons.size} coupon${selectedCoupons.size !== 1 ? 's' : ''}? This action cannot be undone.`
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
    </div>
  );
}
