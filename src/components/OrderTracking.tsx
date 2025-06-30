'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Package, Truck } from 'lucide-react'

interface TrackingInfo {
  orderNumber: string
  status: string
  trackingNumber?: string
  trackingUrl?: string
  providerName?: string
  createdAt: string
  updatedAt: string
}

export default function OrderTracking() {
  const [orderId, setOrderId] = useState('')
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const trackOrder = async () => {
    if (!orderId) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/shipping?orderId=${orderId}`)
      
      if (!response.ok) {
        throw new Error('Order not found')
      }
      
      const data = await response.json()
      setTrackingInfo(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track order')
      setTrackingInfo(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'secondary'
      case 'confirmed': return 'default'
      case 'shipped': return 'default'
      case 'delivered': return 'default'
      case 'cancelled': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shipped': return <Truck className="h-4 w-4" />
      case 'delivered': return <Package className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Track Your Order</h1>
      
      {/* Order ID Input */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && trackOrder()}
            />
            <Button onClick={trackOrder} disabled={loading}>
              {loading ? 'Tracking...' : 'Track Order'}
            </Button>
          </div>
          
          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Tracking Results */}
      {trackingInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(trackingInfo.status)}
              Order #{trackingInfo.orderNumber}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Status:</span>
              <Badge variant={getStatusColor(trackingInfo.status) as any}>
                {trackingInfo.status}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Order Date:</span>
              <span>{new Date(trackingInfo.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Last Updated:</span>
              <span>{new Date(trackingInfo.updatedAt).toLocaleDateString()}</span>
            </div>
            
            {trackingInfo.trackingNumber && (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Tracking Number:</span>
                  <span className="font-mono text-sm">{trackingInfo.trackingNumber}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Shipping Provider:</span>
                  <span>{trackingInfo.providerName || 'Unknown'}</span>
                </div>
                
                {trackingInfo.trackingUrl && (
                  <div className="pt-2">
                    <Button asChild className="w-full">
                      <a 
                        href={trackingInfo.trackingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        Track on {trackingInfo.providerName} Website
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </>
            )}
            
            {!trackingInfo.trackingNumber && trackingInfo.status !== 'DELIVERED' && (
              <p className="text-muted-foreground text-sm">
                Tracking information will be available once your order is shipped.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
