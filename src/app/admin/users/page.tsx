'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import {
  Users,
  Crown,
  Shield,
  User as UserIcon,
  Search,
  Plus,
  Edit,
  Trash2,
  Key,
  AlertTriangle,
  CheckCircle,
  Phone,
  RefreshCw,
  X,
  Mail,
  Calendar,
  FileText,
  Printer,
  FileSpreadsheet,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  UserPlus,
  UserMinus,
  Settings,
  Ban,
  UserCheck,
  UserX,
  ShoppingBag,
  Star
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { showToast } from '@/lib/toast';
import { DataTablePagination } from '@/components/ui/DataTablePagination';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'MANAGER';
  image: string | null;
  isFlagged: boolean;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
    reviews: number;
  };
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Skeleton loading component
function UserTableSkeleton() {
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

interface UserFormData {
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'MANAGER';
  password: string;
  confirmPassword: string;
  id?: string;
}

// Create/Edit User Dialog
function UserDialog({
  user,
  isOpen,
  onOpenChange,
  onSave,
  currentUserRole,
}: {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (userData: UserFormData) => void;
  currentUserRole: string;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'USER' as 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'MANAGER',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email,
        role: user.role,
        password: '',
        confirmPassword: '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'USER',
        password: '',
        confirmPassword: '',
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!user) {
      // Creating new user
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else {
      // Editing existing user
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (formData.password && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const userData = {
      ...formData,
      id: user?.id,
    };

    onSave(userData);
  };

  const canEditRole = currentUserRole === 'SUPER_ADMIN';
  const availableRoles = currentUserRole === 'SUPER_ADMIN' 
    ? ['USER', 'ADMIN', 'SUPER_ADMIN', 'MANAGER']
    : ['USER'];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {user ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {user ? 'Edit User' : 'Create New User'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value as 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'MANAGER' })}
              disabled={!canEditRole}
            >
              <SelectTrigger className={!canEditRole ? 'opacity-50' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex items-center gap-2">
                      {role === 'SUPER_ADMIN' && <Crown className="h-4 w-4" />}
                      {role === 'ADMIN' && <Shield className="h-4 w-4" />}
                      {role === 'USER' && <UserIcon className="h-4 w-4" />}
                      {role.replace('_', ' ')}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!canEditRole && (
              <p className="text-sm text-muted-foreground mt-1">
                Only Super Admin can change user roles
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="password">
              {user ? 'New Password (leave blank to keep current)' : 'Password'}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={errors.password ? 'border-red-500' : ''}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={errors.confirmPassword ? 'border-red-500' : ''}
            />
            {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {user ? 'Update User' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const dynamic = 'force-dynamic';

function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Check if user has permission to access this page
  const canAccess = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';
  const currentUserRole = session?.user?.role || '';

  // API query for users with proper error handling
  const { data: usersData, isLoading, error } = useQuery<UsersResponse>({
    queryKey: ['admin-users', searchTerm, roleFilter, page, pageSize],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', pageSize.toString());
        if (searchTerm) params.set('search', searchTerm);
        if (roleFilter && roleFilter !== 'all') params.set('role', roleFilter);
        params.set('sortBy', 'createdAt');
        params.set('sortOrder', 'desc');

        const response = await fetch(`/api/admin/users?${params}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch users' }));
          throw new Error(errorData.message || 'Failed to fetch users');
        }
        
        const data = await response.json();
        
        // Validate that the response matches our expected structure
        if (!data || typeof data !== 'object' || !Array.isArray(data.users)) {
          throw new Error('Invalid response format from API');
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    },
    enabled: canAccess,
  });

  // Handlers
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

  const handleRoleChange = useCallback((role: string) => {
    setRoleFilter(role);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setStatusFilter(status);
    setPage(1);
  }, []);

  const handleSelectUser = useCallback((userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (!usersData?.users) return;
    
    const allSelected = usersData.users.every(user => 
      selectedUsers.includes(user.id)
    );
    
    if (allSelected) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(usersData.users.map(user => user.id));
    }
  }, [usersData?.users, selectedUsers]);

  const handleCreateUser = useCallback(() => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  }, []);

  const handleEditUser = useCallback((user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  }, []);

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      showToast.success('User created successfully');
      setIsDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id, ...userData }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      showToast.success('User updated successfully');
      setIsDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      showToast.success('User deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      const response = await fetch('/api/admin/users/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete users');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      showToast.success('Users deleted successfully');
      setSelectedUsers([]);
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
  });

  const handleSaveUser = useCallback((userData: UserFormData) => {
    if (userData.id) {
      updateUserMutation.mutate(userData);
    } else {
      createUserMutation.mutate(userData);
    }
  }, [createUserMutation, updateUserMutation]);

  const handleDeleteUser = useCallback(() => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  }, [selectedUser, deleteUserMutation]);

  const handleBulkDelete = useCallback(() => {
    if (selectedUsers.length > 0) {
      bulkDeleteMutation.mutate(selectedUsers);
    }
  }, [selectedUsers, bulkDeleteMutation]);

  // Export functions
  const exportToPDF = useCallback(() => {
    if (!usersData?.users) return;

    const doc = new jsPDF();
    const tableColumn = ['Name', 'Email', 'Role', 'Status', 'Last Login', 'Created'];
    const tableRows = usersData.users.map(user => [
      user.name || 'N/A',
      user.email,
      user.role.replace('_', ' '),
      user.isFlagged ? 'Flagged' : 'Active',
      'N/A', // Last login not available in current schema
      format(parseISO(user.createdAt), 'MMM dd, yyyy')
    ]);

    doc.text('User Management Report', 14, 15);
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 25);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const autoTable = (doc as any).autoTable;
    autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 40 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
      },
    });

    doc.save('users-report.pdf');
    showToast.success('PDF exported successfully');
  }, [usersData]);

  const exportToCSV = useCallback(() => {
    if (!usersData?.users) return;

    const csvData = usersData.users.map(user => ({
      Name: user.name || 'N/A',
      Email: user.email,
      Role: user.role.replace('_', ' '),
      Status: user.isFlagged ? 'Flagged' : 'Active',
      Phone: user.phone || 'Not provided',
      'Created': format(parseISO(user.createdAt), 'PPP'),
      'Created At': format(parseISO(user.createdAt), 'PPP'),
      'Orders Count': user._count?.orders || 0,
      'Reviews Count': user._count?.reviews || 0,
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'users-report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast.success('CSV exported successfully');
  }, [usersData]);

  // Check if user can perform certain actions
  const canEditUser = (user: User) => {
    if (currentUserRole !== 'SUPER_ADMIN') return false;
    if (user.role === 'SUPER_ADMIN' && user.id !== session?.user?.id) return false;
    return true;
  };

  const canDeleteUser = (user: User) => {
    if (currentUserRole !== 'SUPER_ADMIN') return false;
    if (user.role === 'SUPER_ADMIN') return false;
    if (user.id === session?.user?.id) return false;
    return true;
  };

  // Computed values
  const allSelected = usersData?.users && usersData.users.length > 0 && 
    usersData.users.every(user => selectedUsers.includes(user.id));
  const someSelected = selectedUsers.length > 0 && !allSelected;

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Lock className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">
          You don&apos;t have permission to access user management.
        </p>
        <Button onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
        </div>
        <UserTableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-destructive">Error loading users: {(error as Error).message}</p>
          <Button className="mt-4">
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
          <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateUser} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create User
          </Button>
          <Button variant="outline" size="sm" disabled={isLoading}>
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
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{usersData?.pagination?.totalCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Super Admins</p>
                <p className="text-2xl font-bold">
                  {usersData?.users?.filter(u => u.role === 'SUPER_ADMIN').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">
                  {usersData?.users?.filter(u => u.role === 'ADMIN').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">
                  {usersData?.users?.filter(u => !u.isFlagged).length || 0}
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
              placeholder="Search by name or email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Role Filter */}
          <Select value={roleFilter} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
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
              disabled={!usersData?.users?.length}
            >
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={!usersData?.users?.length}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              CSV
            </Button>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l">
              <Badge variant="secondary">{selectedUsers.length} selected</Badge>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="border rounded-lg">
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
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersData?.users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => handleSelectUser(user.id)}
                    disabled={!canDeleteUser(user)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || ""} alt={user.name || ""} />
                      <AvatarFallback>
                        {user.name?.split(" ").map((n) => n[0]).join("") || user.email.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name || 'No Name'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.role === 'SUPER_ADMIN' && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Super Admin
                      </Badge>
                    )}
                    {user.role === 'ADMIN' && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                    {user.role === 'USER' && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <UserIcon className="h-3 w-3" />
                        User
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant={user.isFlagged ? 'destructive' : 'default'}>
                      {user.isFlagged ? 'Flagged' : 'Active'}
                    </Badge>
                    {user.phone && (
                      <Badge variant="outline" className="text-blue-600">
                        <Phone className="h-3 w-3 mr-1" />
                        Phone
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>{format(parseISO(user.createdAt), 'MMM dd, yyyy')}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(user.createdAt), 'h:mm a')}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="flex items-center gap-1">
                      <ShoppingBag className="h-3 w-3" />
                      {user._count?.orders || 0} orders
                    </p>
                    <p className="flex items-center gap-1 text-muted-foreground">
                      <Star className="h-3 w-3" />
                      {user._count?.reviews || 0} reviews
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {canEditUser(user) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDeleteUser(user) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {usersData && usersData.pagination && usersData.pagination.totalCount > 0 && (
        <DataTablePagination
          page={page}
          totalPages={usersData.pagination.totalPages || 1}
          totalRecords={usersData.pagination.totalCount || 0}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Empty State */}
      {usersData?.users?.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No users found</h3>
          <p className="text-muted-foreground">
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
              ? "Try adjusting your filters to find users."
              : "Create your first user to get started."}
          </p>
        </div>
      )}

      {/* User Dialog */}
      <UserDialog
        user={selectedUser}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveUser}
        currentUserRole={currentUserRole}
      />

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Delete
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser && selectedUsers.length === 0 ? (
                `Are you sure you want to delete the user "${selectedUser.name || selectedUser.email}"?`
              ) : (
                `Are you sure you want to delete ${selectedUsers.length} user(s)?`
              )}
              {' '}This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedUser && selectedUsers.length === 0) {
                  handleDeleteUser();
                } else {
                  handleBulkDelete();
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default UsersPage;