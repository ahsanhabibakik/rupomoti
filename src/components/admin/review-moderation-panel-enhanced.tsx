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
import { Textarea } from '@/components/ui/textarea';
import {
  Star,
  Check,
  X,
  Search,
  RefreshCw,
  Download,
  FileText,
  Printer,
  Calendar as CalendarIcon,
  Filter,
  MoreVertical,
  User,
  MessageSquare,
  Shield
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewerName: string;
  reviewerEmail?: string;
  reviewerImage?: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  moderatedAt?: string;
  moderationNote?: string;
  moderatorId?: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
}

interface ReviewFilters {
  search: string;
  status: string;
  rating: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export function ReviewModerationPanel() {
  const [filters, setFilters] = useState<ReviewFilters>({
    search: '',
    status: 'PENDING',
    rating: 'all',
    dateFrom: null,
    dateTo: null,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject'>('approve');
  const [moderationNote, setModerationNote] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const queryClient = useQueryClient();

  // Fetch reviews with advanced filtering
  const { data: reviewsData, isLoading, refetch } = useQuery({
    queryKey: ['reviews', filters, currentPage, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        search: filters.search,
        status: filters.status === 'all' ? '' : filters.status,
        rating: filters.rating === 'all' ? '' : filters.rating,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.dateFrom && { dateFrom: filters.dateFrom.toISOString() }),
        ...(filters.dateTo && { dateTo: filters.dateTo.toISOString() }),
      });
      
      const response = await fetch(`/api/admin/reviews?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    }
  });

  // Moderate review mutation
  const moderateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, action, note }: { reviewId: string; action: 'approve' | 'reject'; note?: string }) => {
      const response = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          action,
          moderationNote: note
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to moderate review');
      }
      
      return response.json();
    },
    onSuccess: () => {
      showToast.success('Review moderated successfully');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (error) => {
      showToast.error(error instanceof Error ? error.message : 'Failed to moderate review');
    }
  });

  // Bulk moderate reviews mutation
  const bulkModerateMutation = useMutation({
    mutationFn: async ({ reviewIds, action, note }: { reviewIds: string[]; action: 'approve' | 'reject'; note?: string }) => {
      const response = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewIds,
          action,
          moderationNote: note
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to moderate reviews');
      }
      
      return response.json();
    },
    onSuccess: () => {
      showToast.success('Reviews moderated successfully');
      setSelectedReviews(new Set());
      setModerationNote('');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (error) => {
      showToast.error(error instanceof Error ? error.message : 'Failed to moderate reviews');
    }
  });

  // Event handlers
  const handleSelectAll = useCallback(() => {
    if (selectedReviews.size === reviewsData?.reviews?.length) {
      setSelectedReviews(new Set());
    } else {
      const allIds = new Set(reviewsData?.reviews?.map((review: Review) => review.id) || []);
      setSelectedReviews(allIds);
    }
  }, [selectedReviews.size, reviewsData?.reviews]);

  const handleSelectReview = useCallback((reviewId: string) => {
    const newSelected = new Set(selectedReviews);
    if (newSelected.has(reviewId)) {
      newSelected.delete(reviewId);
    } else {
      newSelected.add(reviewId);
    }
    setSelectedReviews(newSelected);
  }, [selectedReviews]);

  const handleBulkAction = useCallback(async (action: 'approve' | 'reject') => {
    if (selectedReviews.size === 0) return;

    const reviewIds = Array.from(selectedReviews);
    await bulkModerateMutation.mutateAsync({ reviewIds, action, note: moderationNote });
    setShowBulkDialog(false);
  }, [selectedReviews, bulkModerateMutation, moderationNote]);

  const handleFilterChange = useCallback((key: keyof ReviewFilters, value: string | Date | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'PENDING',
      rating: 'all',
      dateFrom: null,
      dateTo: null,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setCurrentPage(1);
  }, []);

  // Export functions
  const exportToCSV = useCallback(() => {
    if (!reviewsData?.reviews?.length) return;

    const headers = [
      'Product',
      'Reviewer',
      'Rating',
      'Title',
      'Comment',
      'Status',
      'Created At',
      'Moderated At',
      'Moderation Note'
    ];

    const csvData = reviewsData.reviews.map((review: Review) => [
      review.product.name,
      review.isAnonymous ? 'Anonymous' : review.reviewerName,
      review.rating,
      review.title || '',
      review.comment || '',
      review.status,
      format(new Date(review.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      review.moderatedAt ? format(new Date(review.moderatedAt), 'yyyy-MM-dd HH:mm:ss') : '',
      review.moderationNote || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reviews-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  }, [reviewsData]);

  const exportToPDF = useCallback(() => {
    if (!reviewsData?.reviews?.length) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Reviews Report', 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 20, 30);

    const tableData = reviewsData.reviews.map((review: Review) => [
      review.product.name.substring(0, 20) + (review.product.name.length > 20 ? '...' : ''),
      review.isAnonymous ? 'Anonymous' : review.reviewerName,
      review.rating.toString(),
      review.title?.substring(0, 20) + (review.title && review.title.length > 20 ? '...' : '') || '',
      review.status,
      format(new Date(review.createdAt), 'yyyy-MM-dd')
    ]);

    autoTable(doc, {
      head: [['Product', 'Reviewer', 'Rating', 'Title', 'Status', 'Created']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`reviews-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  }, [reviewsData]);

  const printTable = useCallback(() => {
    if (!reviewsData?.reviews?.length) return;

    const printContent = `
      <html>
        <head>
          <title>Reviews Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .status { padding: 4px 8px; border-radius: 4px; }
            .pending { background-color: #fef3c7; color: #d97706; }
            .approved { background-color: #dcfce7; color: #166534; }
            .rejected { background-color: #fee2e2; color: #dc2626; }
            .rating { color: #f59e0b; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>Reviews Report</h1>
          <p>Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}</p>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Reviewer</th>
                <th>Rating</th>
                <th>Title</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              ${reviewsData.reviews.map((review: Review) => `
                <tr>
                  <td>${review.product.name}</td>
                  <td>${review.isAnonymous ? 'Anonymous' : review.reviewerName}</td>
                  <td class="rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</td>
                  <td>${review.title || ''}</td>
                  <td><span class="status ${review.status.toLowerCase()}">${review.status}</span></td>
                  <td>${format(new Date(review.createdAt), 'yyyy-MM-dd')}</td>
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
  }, [reviewsData]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="text-green-600 border-green-600">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="text-red-600 border-red-600">Rejected</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Review Moderation</h1>
            <p className="text-muted-foreground">Loading reviews...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const reviews = reviewsData?.reviews || [];
  const totalCount = reviewsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Review Moderation</h1>
          <p className="text-muted-foreground">
            Manage and moderate customer reviews ({totalCount} total)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
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
                    placeholder="Search reviews..."
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
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Rating</label>
                <Select value={filters.rating} onValueChange={(value) => handleFilterChange('rating', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
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
                      onSelect={(date) => handleFilterChange('dateFrom', date)}
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
                      onSelect={(date) => handleFilterChange('dateTo', date)}
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
      {selectedReviews.size > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <span className="font-medium">
                  {selectedReviews.size} review{selectedReviews.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkAction('approve');
                    setShowBulkDialog(true);
                  }}
                  className="text-green-600 hover:text-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkAction('reject');
                    setShowBulkDialog(true);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject Selected
                </Button>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">Moderation Note (Optional)</label>
              <Textarea
                value={moderationNote}
                onChange={(e) => setModerationNote(e.target.value)}
                placeholder="Add a note about your moderation decision..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedReviews.size === reviews.length && reviews.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all reviews"
                    />
                  </TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review: Review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedReviews.has(review.id)}
                        onCheckedChange={() => handleSelectReview(review.id)}
                        aria-label={`Select review ${review.id}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {review.title && (
                          <div className="font-medium mb-1">{review.title}</div>
                        )}
                        {review.comment && (
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {review.comment}
                          </div>
                        )}
                        {review.moderationNote && (
                          <div className="text-xs text-blue-600 mt-1 italic">
                            Note: {review.moderationNote}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{review.product.name}</div>
                      <div className="text-sm text-muted-foreground">/{review.product.slug}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {review.isAnonymous ? 'Anonymous' : review.reviewerName}
                          </div>
                          {!review.isAnonymous && review.reviewerEmail && (
                            <div className="text-sm text-muted-foreground">{review.reviewerEmail}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell>{getStatusBadge(review.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(review.createdAt), 'HH:mm')}
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
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                View Full Review
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Review Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold">Product</h4>
                                  <p>{review.product.name}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">Reviewer</h4>
                                  <p>{review.isAnonymous ? 'Anonymous' : review.reviewerName}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">Rating</h4>
                                  {renderStars(review.rating)}
                                </div>
                                {review.title && (
                                  <div>
                                    <h4 className="font-semibold">Title</h4>
                                    <p>{review.title}</p>
                                  </div>
                                )}
                                {review.comment && (
                                  <div>
                                    <h4 className="font-semibold">Comment</h4>
                                    <p className="whitespace-pre-wrap">{review.comment}</p>
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-semibold">Status</h4>
                                  {getStatusBadge(review.status)}
                                </div>
                                <div>
                                  <h4 className="font-semibold">Submitted</h4>
                                  <p>{format(new Date(review.createdAt), 'PPP pp')}</p>
                                </div>
                                {review.moderationNote && (
                                  <div>
                                    <h4 className="font-semibold">Moderation Note</h4>
                                    <p>{review.moderationNote}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          {review.status === 'PENDING' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => moderateReviewMutation.mutate({ 
                                  reviewId: review.id, 
                                  action: 'approve' 
                                })}
                                className="text-green-600"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => moderateReviewMutation.mutate({ 
                                  reviewId: review.id, 
                                  action: 'reject' 
                                })}
                                className="text-red-600"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {reviews.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No reviews found</h3>
              <p className="text-muted-foreground">
                {filters.search || filters.status !== 'PENDING' || filters.rating !== 'all' || filters.dateFrom || filters.dateTo
                  ? 'Try adjusting your filters.'
                  : 'No reviews to moderate at the moment.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Bulk Action Dialog */}
      <AlertDialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === 'approve' ? 'Approve Reviews' : 'Reject Reviews'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === 'approve' 
                ? `Are you sure you want to approve ${selectedReviews.size} review${selectedReviews.size !== 1 ? 's' : ''}?`
                : `Are you sure you want to reject ${selectedReviews.size} review${selectedReviews.size !== 1 ? 's' : ''}?`
              }
              {moderationNote && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <strong>Note:</strong> {moderationNote}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleBulkAction(bulkAction)}
              className={bulkAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {bulkAction === 'approve' ? 'Approve Reviews' : 'Reject Reviews'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
