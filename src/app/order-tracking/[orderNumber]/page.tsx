'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  ArrowLeft,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface OrderStatus {
  status: string
  timestamp: string
  description: string
  location?: string
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  deliveryAddress: string
  trackingId?: string
  courierName?: string
  courierTrackingCode?: string
  courierStatus?: string
  courierInfo?: any
  createdAt: string
  updatedAt: string
  items: any[]
}

const statusSteps = [
  { key: 'PENDING', label: 'Order Placed', icon: Package, color: 'bg-gray-500' },
  { key: 'PROCESSING', label: 'Processing', icon: Clock, color: 'bg-yellow-500' },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck, color: 'bg-blue-500' },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle, color: 'bg-green-500' }
]

export default function OrderTrackingPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [trackingHistory, setTrackingHistory] = useState<OrderStatus[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [params.orderNumber])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/track/${params.orderNumber}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch order')
      }
      
      setOrder(data.order)
      setTrackingHistory(data.trackingHistory || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const refreshTracking = async () => {
    setRefreshing(true)
    await fetchOrder()
    setRefreshing(false)
  }

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(step => step.key === status)
  }

  const getCurrentStep = () => {
    if (!order) return 0
    return getStatusIndex(order.status)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pearl-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
          <Link href="/account">
            <button className="px-6 py-3 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700">
              Back to Account
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/account" className="inline-flex items-center text-pearl-600 hover:text-pearl-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Account
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
              <p className="text-gray-600 mt-2">Order #{order.orderNumber}</p>
            </div>
            <button
              onClick={refreshTracking}
              disabled={refreshing}
              className="px-4 py-2 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700 disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tracking Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Status</h2>
              
              {/* Progress Steps */}
              <div className="relative mb-8">
                <div className="flex justify-between">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon
                    const isCompleted = index <= getCurrentStep()
                    const isCurrent = index === getCurrentStep()
                    
                    return (
                      <div key={step.key} className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isCompleted ? step.color : 'bg-gray-200'
                        } ${isCurrent ? 'ring-4 ring-pearl-200' : ''}`}>
                          <Icon className={`w-6 h-6 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <p className={`text-sm mt-2 text-center ${
                          isCompleted ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </p>
                      </div>
                    )
                  })}
                </div>
                
                {/* Progress Line */}
                <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 -z-10">
                  <div 
                    className="h-full bg-pearl-600 transition-all duration-500"
                    style={{ width: `${(getCurrentStep() / (statusSteps.length - 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Tracking History */}
              {trackingHistory.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Tracking History</h3>
                  <div className="space-y-4">
                    {trackingHistory.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="w-3 h-3 bg-pearl-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.description}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                          {item.location && (
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {item.location}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold">৳{order.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Delivery Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Delivery Address:</p>
                  <p className="text-sm">{order.deliveryAddress}</p>
                </div>
                {order.trackingId && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tracking ID:</p>
                    <p className="text-sm font-mono">{order.trackingId}</p>
                  </div>
                )}
                {order.courierName && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Courier:</p>
                    <p className="text-sm">{order.courierName}</p>
                  </div>
                )}
                {order.courierTrackingCode && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Courier Tracking:</p>
                    <p className="text-sm font-mono">{order.courierTrackingCode}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <Image
                        src={item.product?.images?.[0] || '/images/placeholder.jpg'}
                        alt={item.product?.name || 'Product'}
                        fill
                        className="rounded object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product?.name || 'Product'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} × ৳{item.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 border border-pearl-600 text-pearl-600 rounded-lg hover:bg-pearl-50 transition-colors flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact Support
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 