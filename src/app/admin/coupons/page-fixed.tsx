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
  const formatDiscountValue = useCallback((coupon: Coupon) => {
    switch(coupon.type) {
      case 'PERCENTAGE':
        return `${coupon.value}%`;
      case 'FIXED_AMOUNT':
        return `৳${coupon.value}`;
      case 'FREE_SHIPPING':
        return 'Free Shipping';
      default:
        return `${coupon.value}`;
    }
  }, []);

  const formatDate = useCallback((date: string | null | undefined) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      return 'Invalid Date';
    }
  }, []);

  const isExpired = useCallback((date: string | null): boolean => {
    if (!date) return false;
    return new Date(date) < new Date();
  }, []);

  const getUsagePercentage = useCallback((used: number, limit: number | null): number => {
    if (!limit) return 0;
    return (used / limit) * 100;
  }, []);

  // State
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
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
      setSelectedCoupons(new Set(couponsData?.coupons?.map((c: Coupon) => c.id) || []));
    }
  }, [selectedCoupons.size, couponsData?.coupons]);

  const handleSelectCoupon = useCallback((couponId: string) => {
    const newSelected = new Set(selectedCoupons);
    if (selectedCoupons.has(couponId)) {
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

  const coupons = couponsData?.coupons || [];
  const pagination = couponsData?.pagination;

  const handleDeleteCoupon = async (coupon: Coupon) => {
    try {
      const response = await fetch(`/api/admin/coupons?couponId=${coupon.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete coupon');
      }

      showToast.success('Coupon deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setShowDeleteDialog(false);
      setSelectedCoupon(null);
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : 'Failed to delete coupon');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Coupons Management</h1>
          <p className="text-muted-foreground">
            Manage discount coupons and promotional codes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Coupon
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Filters</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search coupons..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Type Filter */}
            <div className="min-w-[150px]">
              <Select
                value={filters.type}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                  <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="min-w-[150px]">
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t flex flex-wrap gap-4">
              {/* Date From */}
              <div>
                <label className="text-sm font-medium mb-2 block">Valid From</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? format(filters.dateFrom, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom as Date}
                      onSelect={(date) => handleFilterChange('dateFrom', date || null)}
                      className="border rounded-md p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date To */}
              <div>
                <label className="text-sm font-medium mb-2 block">Valid Until</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? format(filters.dateTo, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
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
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedCoupons.size > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {selectedCoupons.size} coupon{selectedCoupons.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex gap-2">
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
                        ) : coupon.type === 'FREE_SHIPPING' ? (
                          <FileText className="h-4 w-4 text-purple-600" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-blue-600" />
                        )}
                        <div>
                          <div className="font-medium">
                            {formatDiscountValue(coupon)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {coupon.type === 'PERCENTAGE' ? 'Percentage' : 
                             coupon.type === 'FIXED_AMOUNT' ? 'Fixed Amount' : 'Free Shipping'}
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
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setSelectedCoupon(coupon);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && (
        <DataTablePagination
          table={{
            getState: () => ({ pagination: { pageIndex: currentPage - 1, pageSize } }),
            getPageCount: () => pagination.totalPages,
            getCanPreviousPage: () => pagination.hasPrev,
            getCanNextPage: () => pagination.hasNext,
            previousPage: () => setCurrentPage(prev => Math.max(1, prev - 1)),
            nextPage: () => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1)),
            setPageSize: (size: number) => {
              setPageSize(size);
              setCurrentPage(1);
            },
            getRowCount: () => pagination.totalCount,
          } as any}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the coupon "{selectedCoupon?.code}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCoupon && handleDeleteCoupon(selectedCoupon)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
