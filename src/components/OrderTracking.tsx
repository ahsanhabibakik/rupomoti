'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Package, Truck, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

interface TrackingInfo {
  orderNumber: string
  status: string
  trackingNumber?: string
  trackingUrl?: string
  providerName?: string
  createdAt: string
  updatedAt: string
  courierTrackingCode?: string
  courierName?: string
  steadfastInfo?: any
}

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState('')
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const trackOrder = async () => {
    if (!orderNumber) return
    
    setLoading(true)
    setError('')
    
    try {
      // Use the existing tracking API that works with order numbers
      const response = await fetch(`/api/orders/tracking/${orderNumber}`)
      
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
      case 'confirmed': 
      case 'processing': return 'default'
      case 'shipped': return 'default'
      case 'delivered': return 'default'
      case 'cancelled': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'shipped': return <Truck className="h-4 w-4" />
      case 'processing':
      case 'confirmed': return <Clock className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  // Generate tracking URL for known providers
  const getTrackingUrl = (trackingNumber: string, provider: string) => {
    const providers: Record<string, string> = {
      'fedex': `https://www.fedex.com/fedextrack/?tracknumber=${trackingNumber}`,
      'ups': `https://www.ups.com/track?tracknum=${trackingNumber}`,
      'dhl': `https://www.dhl.com/track?trackingNumber=${trackingNumber}`,
      'usps': `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${trackingNumber}`,
      'steadfast': `https://steadfast.com.bd/track-parcel/${trackingNumber}`
    }
    return providers[provider.toLowerCase()] || ''
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
        <p className="text-muted-foreground">Enter your order number to see real-time tracking updates</p>
      </div>
      
      {/* Order Number Input */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Order Number (e.g., RUP-12345)"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
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
            <div className="grid gap-4">
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
              
              {/* Courier Information */}
              {trackingInfo.courierName && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Courier:</span>
                  <span>{trackingInfo.courierName}</span>
                </div>
              )}
              
              {trackingInfo.courierTrackingCode && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Tracking Number:</span>
                  <span className="font-mono text-sm">{trackingInfo.courierTrackingCode}</span>
                </div>
              )}
              
              {/* Steadfast Integration */}
              {trackingInfo.steadfastInfo?.trackingId && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Steadfast Tracking:</span>
                  <span className="font-mono text-sm">{trackingInfo.steadfastInfo.trackingId}</span>
                </div>
              )}
              
              {/* Tracking Links */}
              {trackingInfo.courierTrackingCode && trackingInfo.courierName && (
                <div className="pt-2">
                  <Button asChild className="w-full">
                    <a 
                      href={getTrackingUrl(trackingInfo.courierTrackingCode, trackingInfo.courierName)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      Track on {trackingInfo.courierName} Website
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              )}
              
              {trackingInfo.steadfastInfo?.trackingId && (
                <div className="pt-2">
                  <Button asChild variant="outline" className="w-full">
                    <a 
                      href={`https://steadfast.com.bd/track-parcel/${trackingInfo.steadfastInfo.trackingId}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      Track on Steadfast
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
            
            {/* Additional Info */}
            {!trackingInfo.courierTrackingCode && !trackingInfo.steadfastInfo?.trackingId && trackingInfo.status !== 'DELIVERED' && (
              <p className="text-muted-foreground text-sm text-center">
                Tracking information will be available once your order is shipped.
              </p>
            )}
            
            {/* View Full Details */}
            <div className="pt-4 border-t">
              <Button asChild variant="outline" className="w-full">
                <Link href={`/order-tracking/${trackingInfo.orderNumber}`}>
                  View Full Order Details
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
