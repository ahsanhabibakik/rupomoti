'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'

interface ShippingProvider {
  id: string
  name: string
  code: string
  apiKey: string
  apiSecret: string
  isActive: boolean
  apiUrl: string
  apiVersion: string
  authType: string
  webhookUrl: string
  orderCount: number
  completedOrders: number
  failedOrders: number
  pendingOrders: number
  averageDeliveryTime: number
  successRate: number
}

export default function ShippingProvidersPage() {
  const { toast } = useToast()
  const [shippingProviders, setShippingProviders] = useState<ShippingProvider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingProvider, setEditingProvider] = useState<ShippingProvider | null>(null)
  const [newProvider, setNewProvider] = useState<Omit<ShippingProvider, 'id'>>({
    name: '',
    code: '',
    apiKey: '',
    apiSecret: '',
    isActive: true,
    apiUrl: '',
    apiVersion: '',
    authType: 'BASIC',
    webhookUrl: '',
    orderCount: 0,
    completedOrders: 0,
    failedOrders: 0,
    pendingOrders: 0,
    averageDeliveryTime: 0,
    successRate: 0
  })

  const fetchShippingProviders = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/shipping-providers')
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setShippingProviders(data.providers)
    } catch (error) {
      console.error('Error fetching shipping providers:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch shipping providers',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchShippingProviders()
  }, [fetchShippingProviders])

  const handleCreateProvider = async () => {
    try {
      const response = await fetch('/api/admin/shipping-providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newProvider,
          isActive: true,
          orderCount: 0,
          completedOrders: 0,
          failedOrders: 0,
          pendingOrders: 0,
          averageDeliveryTime: 0,
          successRate: 0
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setShippingProviders(prev => [...prev, data.provider])
      setNewProvider({
        name: '',
        code: '',
        apiKey: '',
        apiSecret: '',
        isActive: true,
        apiUrl: '',
        apiVersion: '',
        authType: 'BASIC',
        webhookUrl: '',
        orderCount: 0,
        completedOrders: 0,
        failedOrders: 0,
        pendingOrders: 0,
        averageDeliveryTime: 0,
        successRate: 0
      })

      toast({
        title: 'Success',
        description: 'Shipping provider created successfully',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error creating shipping provider:', error)
      toast({
        title: 'Error',
        description: 'Failed to create shipping provider',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteProvider = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/shipping-providers/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setShippingProviders(prev => prev.filter((p) => p.id !== id))
      toast({
        title: 'Success',
        description: 'Shipping provider deleted successfully',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error deleting shipping provider:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete shipping provider',
        variant: 'destructive'
      })
    }
  }

  const handleViewOrders = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/shipping-providers/${id}/orders`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      console.log('Provider orders:', data.orders)
      // TODO: Implement proper view orders UI
    } catch (error) {
      console.error('Error viewing orders:', error)
      toast({
        title: 'Error',
        description: 'Failed to view orders',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Shipping Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newProvider.name}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={newProvider.code}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, code: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="apiUrl">API URL</Label>
                <Input
                  id="apiUrl"
                  value={newProvider.apiUrl}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, apiUrl: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="apiVersion">API Version</Label>
                <Input
                  id="apiVersion"
                  value={newProvider.apiVersion}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, apiVersion: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="authType">Auth Type</Label>
                <Select
                  value={newProvider.authType}
                  onValueChange={(value) =>
                    setNewProvider({ ...newProvider, authType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select auth type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASIC">Basic</SelectItem>
                    <SelectItem value="OAUTH2">OAuth 2.0</SelectItem>
                    <SelectItem value="API_KEY">API Key</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={newProvider.isActive}
                  onCheckedChange={(checked) =>
                    setNewProvider({ ...newProvider, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={newProvider.apiKey}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, apiKey: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="apiSecret">API Secret</Label>
                <Input
                  id="apiSecret"
                  type="password"
                  value={newProvider.apiSecret}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, apiSecret: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={newProvider.webhookUrl}
                onChange={(e) =>
                  setNewProvider({ ...newProvider, webhookUrl: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={handleCreateProvider}>
                Create Provider
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Providers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-4">
              {shippingProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{provider.name}</h3>
                      <Badge
                        variant={provider.isActive ? 'default' : 'secondary'}
                      >
                        {provider.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {provider.code} • {provider.apiUrl}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrders(provider.id)}
                    >
                      View Orders
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProvider(provider)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProvider(provider.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
