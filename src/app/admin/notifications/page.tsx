'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, Trash2 } from 'l      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground dark:text-foreground">Notifications</h1>
        <Button 
          variant="outline" 
          onClick={() => {
            notifications.forEach(n => !n.read && markAsRead(n.id))
          }}
          disabled={notifications.every(n => n.read)}
        >
          Mark All Read
        </Button>
      </div>react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { showToast } from '@/lib/toast'

interface Notification {
  id: string
  type: 'order' | 'inventory' | 'review' | 'user' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  metadata?: any
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const response = await fetch('/api/admin/notifications')
      if (!response.ok) throw new Error('Failed to fetch notifications')
      return response.json()
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const { mutate: markAsRead } = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/notifications/${id}/read`, {
        method: 'PATCH',
      })
      if (!response.ok) throw new Error('Failed to mark as read')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
      showToast.success('Notification marked as read')
    },
  })

  const { mutate: deleteNotification } = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete notification')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
      showToast.success('Notification deleted')
    },
  })

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    orderNotifications: true,
    inventoryNotifications: true,
    reviewNotifications: true,
    marketingNotifications: false,
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '🛍️'
      case 'inventory':
        return '📦'
      case 'review':
        return '⭐'
      default:
        return '🔔'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
        <Button variant="outline" onClick={() => setNotifications([])}>
          Clear All
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No notifications</p>
                  <p className="text-sm text-muted-foreground">
                    You&apos;re all caught up! Check back later for updates.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 flex items-start gap-4 ${
                        !notification.read ? 'bg-muted/50' : ''
                      }`}
                    >
                      <div className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{notification.title}</p>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Badge variant="secondary">New</Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread">
          <Card>
            <CardContent className="p-0">
              {notifications.filter(n => !n.read).length === 0 ? (
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread">
          <Card>
            <CardContent className="p-0">
              {notifications.filter(n => !n.read).length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Check className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No unread notifications</p>
                  <p className="text-sm text-muted-foreground">
                    You&apos;re all caught up! Check back later for updates.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications
                    .filter(notification => !notification.read)
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 flex items-start gap-4 bg-muted/50"
                      >
                        <div className="text-2xl">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{notification.title}</p>
                            <span className="text-sm text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Notification Channels</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <Switch
                      id="emailNotifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, emailNotifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <Switch
                      id="pushNotifications"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, pushNotifications: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Notification Types</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="orderNotifications">Order Updates</Label>
                    <Switch
                      id="orderNotifications"
                      checked={settings.orderNotifications}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, orderNotifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inventoryNotifications">
                      Inventory Alerts
                    </Label>
                    <Switch
                      id="inventoryNotifications"
                      checked={settings.inventoryNotifications}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, inventoryNotifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reviewNotifications">Product Reviews</Label>
                    <Switch
                      id="reviewNotifications"
                      checked={settings.reviewNotifications}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, reviewNotifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="marketingNotifications">
                      Marketing Updates
                    </Label>
                    <Switch
                      id="marketingNotifications"
                      checked={settings.marketingNotifications}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, marketingNotifications: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 