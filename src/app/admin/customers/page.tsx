"use client";

import React, { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Eye, 
  User as UserIcon, 
  Search, 
  FileText, 
  Printer, 
  Trash2, 
  CalendarIcon,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Crown,
  RefreshCw,
  X,
  AlertTriangle,
  FileSpreadsheet,
  Users,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  Shield,
  Flag,
  MoreHorizontal,
  Edit,
  Ban,
  UserCheck,
  UserX,
  Send,
  ExternalLink
} from "lucide-react";
import { format, parseISO, addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { showToast } from "@/lib/toast";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useSession } from "next-auth/react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  role: string;
  isVerified: boolean;
  isFlagged: boolean;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  createdAt: string;
  updatedAt: string;
  orders?: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
  addresses?: {
    id: string;
    street: string;
    city: string;
    state: string;
    country: string;
    isDefault: boolean;
  }[];
}

interface CustomersResponse {
  customers: Customer[];
  total: number;
  totalCount: number;
  page: number;
  totalPages: number;
}

// Skeleton loading component
function CustomerTableSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Customer Details Dialog
function CustomerDetailsDialog({
  customer,
  isOpen,
  onOpenChange,
}: {
  customer: Customer | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={customer.image || ""} alt={customer.name} />
              <AvatarFallback>
                {customer.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            Customer Details - {customer.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <p className="mt-1">{customer.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="mt-1">{customer.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p className="mt-1">{customer.phone || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                  <p className="mt-1">
                    <Badge variant={customer.role === 'VIP' ? 'default' : 'secondary'}>
                      {customer.role}
                    </Badge>
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1 flex gap-2">
                    <Badge variant={customer.isVerified ? 'default' : 'secondary'}>
                      {customer.isVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                    {customer.isFlagged && (
                      <Badge variant="destructive">Flagged</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                  <p className="mt-1">{format(parseISO(customer.createdAt), 'PPP')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Order Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total Orders</Label>
                  <p className="mt-1 text-2xl font-bold">{customer.totalOrders}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total Spent</Label>
                  <p className="mt-1 text-2xl font-bold">৳{customer.totalSpent.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Average Order Value</Label>
                  <p className="mt-1 text-lg font-semibold">৳{customer.averageOrderValue.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last Order</Label>
                  <p className="mt-1">
                    {customer.lastOrderDate 
                      ? format(parseISO(customer.lastOrderDate), 'PPP')
                      : 'No orders yet'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.orders && customer.orders.length > 0 ? (
                <div className="space-y-2">
                  {customer.orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(order.createdAt), 'PPP')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">৳{order.total.toFixed(2)}</p>
                        <Badge variant={order.status === 'DELIVERED' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No orders found</p>
              )}
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Addresses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.addresses && customer.addresses.length > 0 ? (
                <div className="space-y-2">
                  {customer.addresses.map((address) => (
                    <div key={address.id} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{address.street}</p>
                        {address.isDefault && (
                          <Badge variant="default">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.state}, {address.country}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No addresses found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CustomersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // State management
  const [searchTerm, setSearchTerm] = useState(searchParams?.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams?.get('status') || 'all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(parseInt(searchParams?.get('page') || '1'));
  const [pageSize, setPageSize] = useState(parseInt(searchParams?.get('pageSize') || '20'));

  // Fetch customers
  const { data: customersData, isLoading, error, refetch } = useQuery({
    queryKey: ['customers', searchTerm, statusFilter, dateRange, page, pageSize],
    queryFn: async (): Promise<CustomersResponse> => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateRange?.from) params.append('from', dateRange.from.toISOString());
      if (dateRange?.to) params.append('to', dateRange.to.toISOString());
      params.append('page', page.toString());
      params.append('limit', pageSize.toString());

      const response = await fetch(`/api/admin/customers?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (customerIds: string[]) => {
      const response = await fetch('/api/admin/customers/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerIds }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete customers');
      }
      return response.json();
    },
    onSuccess: () => {
      showToast.success('Customers deleted successfully');
      setSelectedCustomers([]);
      setIsDeleteDialogOpen(false);
      refetch();
    },
    onError: (error: Error) => {
      showToast.error(`Error: ${error.message}`);
    },
  });

  // Handlers
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setStatusFilter(status);
    setPage(1);
  }, []);

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    setDateRange(range);
    setPage(1);
  }, []);

  const handleSelectCustomer = useCallback((customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (!customersData?.customers) return;
    
    const allSelected = customersData.customers.every(customer => 
      selectedCustomers.includes(customer.id)
    );
    
    if (allSelected) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customersData.customers.map(customer => customer.id));
    }
  }, [customersData?.customers, selectedCustomers]);

  const handleBulkDelete = useCallback(() => {
    if (selectedCustomers.length === 0) return;
    setIsDeleteDialogOpen(true);
  }, [selectedCustomers]);

  const confirmBulkDelete = useCallback(() => {
    bulkDeleteMutation.mutate(selectedCustomers);
  }, [selectedCustomers, bulkDeleteMutation]);

  const handleViewDetails = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  }, []);

  // Export functions
  const exportToPDF = useCallback(async () => {
    if (!customersData?.customers) return;

    const doc = new jsPDF();
    const tableColumn = ['Name', 'Email', 'Phone', 'Total Orders', 'Total Spent', 'Status'];
    const tableRows = customersData.customers.map(customer => [
      customer.name,
      customer.email,
      customer.phone || 'N/A',
      customer.totalOrders.toString(),
      `৳${customer.totalSpent.toFixed(2)}`,
      customer.isVerified ? 'Verified' : 'Unverified'
    ]);

    doc.text('Customer Report', 14, 15);
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 25);
    
    // Dynamic import for autoTable
    const { default: autoTable } = await import('jspdf-autotable');
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
      },
    });

    doc.save('customers-report.pdf');
    showToast.success('PDF exported successfully');
  }, [customersData]);

  const exportToCSV = useCallback(() => {
    if (!customersData?.customers) return;

    const csvData = customersData.customers.map(customer => ({
      Name: customer.name,
      Email: customer.email,
      Phone: customer.phone || 'N/A',
      Role: customer.role,
      'Total Orders': customer.totalOrders,
      'Total Spent': customer.totalSpent.toFixed(2),
      'Average Order Value': customer.averageOrderValue.toFixed(2),
      'Last Order Date': customer.lastOrderDate ? format(parseISO(customer.lastOrderDate), 'PPP') : 'N/A',
      Status: customer.isVerified ? 'Verified' : 'Unverified',
      Flagged: customer.isFlagged ? 'Yes' : 'No',
      'Created At': format(parseISO(customer.createdAt), 'PPP'),
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'customers-report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast.success('CSV exported successfully');
  }, [customersData]);

  const handlePrint = useCallback(() => {
    if (!customersData?.customers) {
      showToast.error("No data to print");
      return;
    }

    try {
      // Create a detailed and properly sanitized print content
      const printContent = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Customer Report</title>
            <style>
              @media print {
                @page { size: portrait; margin: 0.5in; }
                body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.5; }
                h1, h2 { color: #1a365d; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
                th { background-color: #f3f4f6; padding: 8px; text-align: left; border-bottom: 2px solid #ddd; }
                td { padding: 8px; border-bottom: 1px solid #ddd; }
                .header { padding-bottom: 20px; border-bottom: 1px solid #ddd; margin-bottom: 20px; }
                .footer { margin-top: 20px; font-size: 11px; color: #666; text-align: center; }
                .text-success { color: #047857; }
                .text-warning { color: #d97706; }
                .monospace { font-family: monospace; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Customer Report</h1>
              <p>Generated on: ${format(new Date(), 'PPP pp')}</p>
              <p>Total Customers: ${customersData.totalCount}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                ${customersData.customers.map(customer => `
                  <tr>
                    <td>${customer.name || 'N/A'}</td>
                    <td class="monospace">${customer.email || 'N/A'}</td>
                    <td>${customer.phone || 'N/A'}</td>
                    <td>${customer.totalOrders || 0}</td>
                    <td>৳${(customer.totalSpent || 0).toFixed(2)}</td>
                    <td class="${customer.isVerified ? 'text-success' : 'text-warning'}">${customer.isVerified ? 'Verified' : 'Unverified'}</td>
                    <td>${format(new Date(customer.createdAt), 'PPP')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="footer">
              <p>Rupomoti Admin - Confidential Customer Report</p>
              <p>This report contains sensitive customer information and is for internal use only.</p>
            </div>
          </body>
        </html>
      `;

      // Use a separate window for printing with error handling
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showToast.error("Popup blocked! Please allow popups to print.");
        return;
      }
      
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for resources to load before printing
      printWindow.onload = function() {
        try {
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
            // Don't close the window immediately, let the user close it
          }, 250);
        } catch (err) {
          console.error("Print error:", err);
          showToast.error("Error during printing");
        }
      };
      
      showToast.success('Print dialog opened');
    } catch (error) {
      console.error("Print preparation error:", error);
      showToast.error("Failed to prepare printing");
    }
  }, [customersData]);

  // Computed values
  const allSelected = customersData?.customers && customersData.customers.length > 0 && 
    customersData.customers.every(customer => selectedCustomers.includes(customer.id));
  const someSelected = selectedCustomers.length > 0 && !allSelected;

  // Mobile view for customers
  const renderMobileView = () => (
    <div className="block md:hidden space-y-4">
      {customersData?.customers?.map((customer) => (
        <Card key={customer.id} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedCustomers.includes(customer.id)}
                onCheckedChange={() => handleSelectCustomer(customer.id)}
              />
              <Avatar className="h-10 w-10">
                <AvatarImage src={customer.image || ""} alt={customer.name} />
                <AvatarFallback>
                  {customer.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewDetails(customer)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Orders</p>
              <p className="font-medium">{customer.totalOrders}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Spent</p>
              <p className="font-medium">৳{customer.totalSpent.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge variant={customer.isVerified ? 'default' : 'secondary'}>
                {customer.isVerified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Joined</p>
              <p className="font-medium">{format(parseISO(customer.createdAt), 'MMM dd, yyyy')}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  // Desktop view for customers
  const renderDesktopView = () => (
    <div className="hidden md:block border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                className={someSelected ? "data-[state=checked]:bg-blue-600" : ""}
              />
            </TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Spent</TableHead>
            <TableHead>Avg. Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customersData?.customers?.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <Checkbox
                  checked={selectedCustomers.includes(customer.id)}
                  onCheckedChange={() => handleSelectCustomer(customer.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={customer.image || ""} alt={customer.name} />
                    <AvatarFallback>
                      {customer.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {customer.email}
                  </p>
                  {customer.phone && (
                    <p className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-center">
                  <p className="font-medium">{customer.totalOrders}</p>
                  <p className="text-xs text-muted-foreground">orders</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-center">
                  <p className="font-medium">৳{customer.totalSpent.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">total</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-center">
                  <p className="font-medium">৳{customer.averageOrderValue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">avg</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge variant={customer.isVerified ? 'default' : 'secondary'}>
                    {customer.isVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                  {customer.isFlagged && (
                    <Badge variant="destructive">Flagged</Badge>
                  )}
                  {customer.role === 'VIP' && (
                    <Badge variant="outline" className="text-yellow-600">
                      <Crown className="h-3 w-3 mr-1" />
                      VIP
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p>{format(parseISO(customer.createdAt), 'MMM dd, yyyy')}</p>
                  {customer.lastOrderDate && (
                    <p className="text-xs text-muted-foreground">
                      Last order: {format(parseISO(customer.lastOrderDate), 'MMM dd')}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(customer)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">Customers</h1>
        </div>
        <CustomerTableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">Customers</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-destructive">Error loading customers: {(error as Error).message}</p>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer base and view detailed analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{customersData?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold">
                  {customersData?.customers?.filter(c => c.isVerified).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">VIP Customers</p>
                <p className="text-2xl font-bold">
                  {customersData?.customers?.filter(c => c.totalSpent > 50000).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Flagged</p>
                <p className="text-2xl font-bold">
                  {customersData?.customers?.filter(c => c.isFlagged).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Filter */}
          <DateRangePicker
            dateRange={dateRange}
            onChange={handleDateRangeChange}
            placeholder="Filter by date"
            calendarDaysToShow={2}
            presets={[
              {
                label: 'Today',
                dateRange: {
                  from: new Date(),
                  to: new Date(),
                },
              },
              {
                label: 'Last 7 days',
                dateRange: {
                  from: addDays(new Date(), -6),
                  to: new Date(),
                },
              },
              {
                label: 'Last 30 days',
                dateRange: {
                  from: addDays(new Date(), -29),
                  to: new Date(),
                },
              },
              {
                label: 'This month',
                dateRange: {
                  from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                  to: new Date(),
                },
              },
            ]}
          />

          {/* Clear Filters */}
          {(searchTerm || statusFilter !== 'all' || dateRange) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateRange(undefined);
                setPage(1);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Export Options */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToPDF}
              disabled={!customersData?.customers?.length}
            >
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={!customersData?.customers?.length}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={!customersData?.customers?.length}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>

          {/* Bulk Actions */}
          {selectedCustomers.length > 0 && (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l">
              <Badge variant="secondary">{selectedCustomers.length} selected</Badge>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      {renderDesktopView()}
      {renderMobileView()}

      {/* Pagination */}
      {customersData && customersData.total > 0 && (
        <DataTablePagination
          page={page}
          totalPages={customersData.totalPages}
          totalRecords={customersData.total}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Empty State */}
      {customersData?.customers?.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No customers found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all' || dateRange
              ? "Try adjusting your filters to find customers."
              : "Customers will appear here once they start placing orders."}
          </p>
        </div>
      )}

      {/* Customer Details Dialog */}
      <CustomerDetailsDialog
        customer={selectedCustomer}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Bulk Delete
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCustomers.length} customer(s)? 
              This action cannot be undone and will remove all associated data including orders, reviews, and addresses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
