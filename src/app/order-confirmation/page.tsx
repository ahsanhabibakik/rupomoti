'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Package, Phone, MapPin, CreditCard, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'

interface OrderDetails {
  orderNumber: string
  status: string
  paymentMethod: string
  total: number
  createdAt: string
  customer: {
    name: string
    phone: string
    address: string
  }
  deliveryZone: string
}

export default function OrderConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderNumber = searchParams?.get('orderNumber')
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderNumber) {
      router.push('/shop')
      return
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/track/${orderNumber}`)
        if (response.ok) {
          const data = await response.json()
          setOrderDetails(data)
        } else {
          throw new Error('Order not found')
        }
      } catch (error) {
        console.error('Error fetching order:', error)
        router.push('/shop')
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderNumber, router])

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'CASH_ON_DELIVERY':
        return 'Cash on Delivery'
      case 'MOBILE_BANKING':
        return 'Mobile Banking (bKash)'
      case 'BANK_TRANSFER':
        return 'Bank Transfer'
      default:
        return method
    }
  }

  const getDeliveryZoneDisplay = (zone: string) => {
    switch (zone) {
      case 'INSIDE_DHAKA':
        return 'Inside Dhaka'
      case 'PERIPHERAL_DHAKA':
        return 'Peripheral Dhaka'
      case 'OUTSIDE_DHAKA':
        return 'Outside Dhaka'
      default:
        return zone
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Order not found</h2>
          <p className="text-gray-500 mb-4">The order you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/shop')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your order. We'll contact you soon to confirm the details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-semibold text-lg">#{orderDetails.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium">
                    {new Date(orderDetails.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {orderDetails.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-lg text-primary">
                    {formatPrice(orderDetails.total)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Customer Name</p>
                <p className="font-medium">{orderDetails.customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="font-medium">{orderDetails.customer.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivery Address</p>
                <p className="font-medium">{orderDetails.customer.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivery Zone</p>
                <p className="font-medium">{getDeliveryZoneDisplay(orderDetails.deliveryZone)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Payment Method</p>
                <p className="font-medium">{getPaymentMethodDisplay(orderDetails.paymentMethod)}</p>
              </div>
              
              {orderDetails.paymentMethod === 'MOBILE_BANKING' && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Payment Instructions:</h4>
                  <p className="text-sm text-blue-800">
                    Send payment to: <strong>01712345678</strong> (bKash)<br />
                    Include your order number <strong>#{orderDetails.orderNumber}</strong> in the reference.
                  </p>
                </div>
              )}
              
              {orderDetails.paymentMethod === 'BANK_TRANSFER' && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Bank Details:</h4>
                  <p className="text-sm text-blue-800">
                    <strong>Bank:</strong> Dutch Bangla Bank Ltd.<br />
                    <strong>Account:</strong> 135-110-12345<br />
                    <strong>Account Name:</strong> Rupomoti Fashion House<br />
                    Include order number <strong>#{orderDetails.orderNumber}</strong> in transfer details.
                  </p>
                </div>
              )}
              
              {orderDetails.paymentMethod === 'CASH_ON_DELIVERY' && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">Cash on Delivery:</h4>
                  <p className="text-sm text-green-800">
                    A representative will call you to confirm the order. You can pay when the product is delivered to your doorstep.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Order Confirmation</h4>
                  <p className="text-sm text-gray-600">
                    Our team will call you within 24 hours to confirm your order details and delivery address.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Processing</h4>
                  <p className="text-sm text-gray-600">
                    Once confirmed, we'll prepare your order and arrange for delivery.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Delivery</h4>
                  <p className="text-sm text-gray-600">
                    Your order will be delivered to your specified address. Please have the exact amount ready if you chose cash on delivery.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button
            variant="outline"
            onClick={() => router.push('/order-tracking')}
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            Track Your Order
          </Button>
          
          <Button
            onClick={() => router.push('/shop')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Button>
        </div>

        {/* Contact Information */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-medium mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you have any questions about your order, please contact us:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>+880 1234567890</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>support@rupomoti.com</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}