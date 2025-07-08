'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Package,
  AlertTriangle,
  Clock,
  Star,
  ShoppingCart,
  X,
  Check,
  RefreshCw,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  metadata?: Record<string, any>;
}

interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const getNotificationIcon = (type: string, priority: string) => {
  const iconClass = `h-4 w-4 ${
    priority === 'URGENT' ? 'text-red-500' :
    priority === 'HIGH' ? 'text-orange-500' :
    priority === 'NORMAL' ? 'text-blue-500' :
    'text-gray-500'
  }`;

  switch (type) {
    case 'order':
      return <ShoppingCart className={iconClass} />;
    case 'pending':
      return <Clock className={iconClass} />;
    case 'inventory':
      return <Package className={iconClass} />;
    case 'review':
      return <Star className={iconClass} />;
    default:
      return <Bell className={iconClass} />;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'URGENT':
      return <Badge variant="destructive" className="text-xs"><Zap className="h-3 w-3 mr-1" />Urgent</Badge>;
    case 'HIGH':
      return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800"><AlertTriangle className="h-3 w-3 mr-1" />High</Badge>;
    case 'NORMAL':
      return <Badge variant="outline" className="text-xs">Normal</Badge>;
    case 'LOW':
      return <Badge variant="outline" className="text-xs text-gray-500">Low</Badge>;
    default:
      return null;
  }
};

export default function AdminNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationsData, isLoading, refetch } = useQuery<NotificationsResponse>({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const response = await fetch('/api/admin/notifications?limit=20');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds, isRead: true }),
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.priority === 'URGENT').length;

  const handleMarkAllAsRead = () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length > 0) {
      markAsReadMutation.mutate(unreadIds);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate([notificationId]);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    const { metadata } = notification;
    if (metadata?.orderId) {
      window.open(`/admin/orders?search=${metadata.orderNumber}`, '_blank');
    } else if (metadata?.productId) {
      window.open(`/admin/products?search=${metadata.productId}`, '_blank');
    } else if (metadata?.reviewId) {
      window.open(`/admin/reviews`, '_blank');
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant={urgentCount > 0 ? "destructive" : "default"} 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Notifications</h3>
              {urgentCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {urgentCount} urgent
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markAsReadMutation.isPending}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm font-medium truncate ${
                          !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          {getPriorityBadge(notification.priority)}
                          {!notification.isRead && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                        
                        {notification.user && (
                          <p className="text-xs text-gray-500 truncate max-w-24">
                            {notification.user.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-center"
                onClick={() => {
                  setIsOpen(false);
                  window.open('/admin/notifications', '_blank');
                }}
              >
                View All Notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
