'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { Bell, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { showToast } from '@/lib/toast'

// Admin notifications page
interface Notification {
  id: string
  type: 'order' | 'inventory' | 'review' | 'user' | 'system'
  title: string
  message: string
  createdAt: string
  isRead: boolean
  metadata?: any
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const response = await fetch('/api/admin/notifications')
      if (!response.ok) throw new Error('Failed to fetch notifications')
      const data = await response.json()
      return data.notifications || []
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const { mutate: markAsRead } = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds, isRead: true }),
      })
      if (!response.ok) throw new Error('Failed to mark as read')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
      showToast.success('Notifications marked as read')
    },
    onError: () => {
      showToast.error('Failed to mark notifications as read')
    },
  })

  const handleMarkAllRead = () => {
    const unreadIds = notifications.filter((n: Notification) => !n.isRead).map((n: Notification) => n.id)
    if (unreadIds.length > 0) {
      markAsRead(unreadIds)
    }
  }

  const handleMarkAsRead = (id: string) => {
    markAsRead([id])
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return '🛒'
      case 'inventory': return '📦'
      case 'review': return '⭐'
      case 'user': return '👤'
      default: return '🔔'
    }
  }

  const getNotificationBadgeVariant = (type: string) => {
    switch (type) {
      case 'order': return 'default'
      case 'inventory': return 'destructive'
      case 'review': return 'secondary'
      case 'user': return 'outline'
      default: return 'default'
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground dark:text-foreground">Notifications</h1>
        <Button 
          variant="outline" 
          onClick={handleMarkAllRead}
          disabled={notifications.every((n: Notification) => n.isRead)}
        >
          <Check className="w-4 h-4 mr-2" />
          Mark All Read
        </Button>
      </div>

      <div className="grid gap-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">No notifications yet</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification: Notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all cursor-pointer hover:shadow-md ${
                notification.isRead ? 'opacity-75' : 'border-primary/50 bg-primary/5'
              }`}
              onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={getNotificationBadgeVariant(notification.type) as any}>
                          {notification.type}
                        </Badge>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
