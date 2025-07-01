"use client"

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  CreditCard,
  MapPin,
  Shield,
  Star,
  Edit,
  Trash2,
  Plus,
  Save,
  MessageSquare,
  Eye,
  ShoppingCart
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { showToast } from '@/lib/toast'
import { ProfileEditModal } from '@/components/account/ProfileEditModal'
import { ReviewModal } from '@/components/account/ReviewModal'
import { useWishlist } from '@/hooks/useWishlist'
import { useAppDispatch } from '@/redux/hooks'
import { addToCart } from '@/redux/slices/cartSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User, category: 'primary' },
  { id: 'orders', label: 'Orders', icon: Package, category: 'primary' },
  { id: 'wishlist', label: 'Wishlist', icon: Heart, category: 'primary' },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare, category: 'primary' },
  { id: 'addresses', label: 'Addresses', icon: MapPin, category: 'secondary' },
  { id: 'payment', label: 'Payment', icon: CreditCard, category: 'secondary' },
  { id: 'settings', label: 'Settings', icon: Settings, category: 'secondary' },
]

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [activeTab, setActiveTab] = useState('profile')

  // Wishlist hook
  const { wishlistItems, removeFromWishlist, isLoading: wishlistLoading, error: wishlistError } = useWishlist()

  // Dynamic data states
  const [profile, setProfile] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  
  // Loading and error states for each section
  const [loading, setLoading] = useState({
    profile: false,
    orders: false,
    reviews: false,
    addresses: false,
    payments: false,
    settings: false
  })

  const [error, setError] = useState({
    profile: '',
    orders: '',
    reviews: '',
    addresses: '',
    payments: '',
    settings: ''
  })

  // Modal states
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [editingReview, setEditingReview] = useState(null)

  // Form states
  const [editingAddress, setEditingAddress] = useState<any>(null)
  const [editingPayment, setEditingPayment] = useState<any>(null)

  // Data fetching functions
  const fetchProfileData = async () => {
    setLoading(prev => ({ ...prev, profile: true }))
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      setError(prev => ({ ...prev, profile: 'Failed to load profile data' }))
    } finally {
      setLoading(prev => ({ ...prev, profile: false }))
    }
  }

  const fetchOrders = async () => {
    setLoading(prev => ({ ...prev, orders: true }))
    try {
      const response = await fetch('/api/orders/user')
      if (response.ok) {
        const data = await response.json()
        setOrders(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      setError(prev => ({ ...prev, orders: 'Failed to load orders' }))
    } finally {
      setLoading(prev => ({ ...prev, orders: false }))
    }
  }

  const fetchReviews = async () => {
    setLoading(prev => ({ ...prev, reviews: true }))
    try {
      const response = await fetch('/api/reviews?mine=1')
      if (response.ok) {
        const data = await response.json()
        setReviews(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      setError(prev => ({ ...prev, reviews: 'Failed to load reviews' }))
    } finally {
      setLoading(prev => ({ ...prev, reviews: false }))
    }
  }

  const fetchAddresses = async () => {
    setLoading(prev => ({ ...prev, addresses: true }))
    try {
      const response = await fetch('/api/addresses')
      if (response.ok) {
        const data = await response.json()
        setAddresses(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      setError(prev => ({ ...prev, addresses: 'Failed to load addresses' }))
    } finally {
      setLoading(prev => ({ ...prev, addresses: false }))
    }
  }

  const fetchPaymentMethods = async () => {
    setLoading(prev => ({ ...prev, payments: true }))
    try {
      const response = await fetch('/api/payment-methods')
      if (response.ok) {
        const data = await response.json()
        setPayments(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      setError(prev => ({ ...prev, payments: 'Failed to load payment methods' }))
    } finally {
      setLoading(prev => ({ ...prev, payments: false }))
    }
  }

  // Effect to fetch data when tab changes
  useEffect(() => {
    if (status === 'authenticated') {
      switch (activeTab) {
        case 'profile':
          fetchProfileData()
          break
        case 'orders':
          fetchOrders()
          break
        case 'reviews':
          fetchReviews()
          break
        case 'addresses':
          fetchAddresses()
          break
        case 'payment':
          fetchPaymentMethods()
          break
      }
    }
  }, [activeTab, status])

  // Helper functions
  const handleAddToCart = (product: any) => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.images?.[0] || '/images/placeholder.jpg',
      category: 'Unknown',
      quantity: 1
    }))
    showToast.success(`"${product.name}" added to cart!`)
  }

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist(productId)
      showToast.success('Removed from wishlist')
    } catch (error) {
      showToast.error('Failed to remove from wishlist')
    }
  }

  // Authentication check
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pearl-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/signin')
    return null
  }

  const isAdmin = session?.user?.role === 'ADMIN'
  const isManager = session?.user?.role === 'MANAGER'
  const isAdminOrManager = isAdmin || isManager

  return (
    <>
      <div className="min-h-screen bg-secondary/30 py-6 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Mobile/Tablet Navigation */}
            <div className="lg:hidden">
              <div className="bg-background rounded-xl shadow-sm p-4 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative w-12 h-12">
                    <Image
                      src={session?.user?.image || '/images/default-avatar.png'}
                      alt="Profile"
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-primary">
                      {session?.user?.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                    {isAdminOrManager && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 text-xs bg-accent/20 text-accent rounded-full">
                        <Shield size={10} />
                        {session?.user?.role}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon size={14} />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <div className="bg-background rounded-xl shadow-sm p-6 sticky top-6">
                {/* Profile Section */}
                <div className="flex items-center space-x-4 mb-8">
                  <div className="relative w-16 h-16">
                    <Image
                      src={session?.user?.image || '/images/default-avatar.png'}
                      alt="Profile"
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-primary">
                      {session?.user?.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                    {isAdminOrManager && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 text-xs bg-accent/20 text-accent rounded-full">
                        <Shield size={12} />
                        {session?.user?.role}
                      </span>
                    )}
                  </div>
                </div>

                {/* Navigation Tabs */}
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon size={16} />
                        {tab.label}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-4"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-background rounded-xl shadow-sm p-6 md:p-8">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Profile Information
                      </h3>
                      <Button
                        onClick={() => setShowProfileEdit(true)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                    
                    {loading.profile ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      </div>
                    ) : error.profile ? (
                      <div className="text-red-500 text-center py-8">{error.profile}</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <p className="text-gray-900">{session?.user?.name || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <p className="text-gray-900">{session?.user?.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                          </label>
                          <p className="text-gray-900">{profile?.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth
                          </label>
                          <p className="text-gray-900">{profile?.dateOfBirth || 'Not provided'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bio
                          </label>
                          <p className="text-gray-900">{profile?.bio || 'No bio provided'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Order History
                    </h3>
                    
                    {loading.orders ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      </div>
                    ) : error.orders ? (
                      <div className="text-red-500 text-center py-8">{error.orders}</div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No orders found</p>
                        <Link href="/shop">
                          <Button className="mt-4">Start Shopping</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <Card key={order.id}>
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="font-semibold">Order #{order.orderNumber}</h4>
                                  <p className="text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <Badge 
                                  variant={
                                    order.status === 'DELIVERED' ? 'default' :
                                    order.status === 'CANCELLED' ? 'destructive' :
                                    'secondary'
                                  }
                                >
                                  {order.status}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <p className="font-medium">৳{order.total?.toLocaleString()}</p>
                                <div className="flex gap-2">
                                  <Link href={`/order-tracking/${order.orderNumber}`}>
                                    <Button variant="outline" size="sm">
                                      <Eye className="w-4 h-4 mr-2" />
                                      Track
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Wishlist Tab */}
                {activeTab === 'wishlist' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      My Wishlist
                    </h3>
                    
                    {wishlistLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      </div>
                    ) : wishlistError ? (
                      <div className="text-red-500 text-center py-8">{wishlistError}</div>
                    ) : !wishlistItems || wishlistItems.length === 0 ? (
                      <div className="text-center py-8">
                        <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Your wishlist is empty</p>
                        <Link href="/shop">
                          <Button className="mt-4">Browse Products</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {wishlistItems.map((item) => (
                          <Card key={item.id}>
                            <CardContent className="p-4">
                              <div className="flex space-x-4">
                                <div className="relative w-20 h-20 flex-shrink-0">
                                  <Image
                                    src={item.product?.images?.[0] || '/images/placeholder.jpg'}
                                    alt={item.product?.name || 'Product'}
                                    fill
                                    className="object-cover rounded-lg"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium truncate">
                                    {item.product?.name || 'Unknown Product'}
                                  </h4>
                                  <p className="text-lg font-bold text-primary">
                                    ৳{(item.product?.price)?.toLocaleString()}
                                  </p>
                                  <div className="flex gap-2 mt-3">
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddToCart(item.product)}
                                      className="flex-1"
                                    >
                                      <ShoppingCart className="w-4 h-4 mr-2" />
                                      Add to Cart
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRemoveFromWishlist(item.productId)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      My Reviews
                    </h3>
                    
                    {loading.reviews ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      </div>
                    ) : error.reviews ? (
                      <div className="text-red-500 text-center py-8">{error.reviews}</div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No reviews yet</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Purchase products to leave reviews
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <Card key={review.id}>
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="font-semibold">{review.product?.name}</h4>
                                  <div className="flex items-center mt-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                    <span className="ml-2 text-sm text-gray-500">
                                      {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedProduct(review.product)
                                    setEditingReview(review)
                                    setShowReviewModal(true)
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Addresses Tab */}
                {activeTab === 'addresses' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Saved Addresses
                      </h3>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Address
                      </Button>
                    </div>
                    
                    {loading.addresses ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      </div>
                    ) : error.addresses ? (
                      <div className="text-red-500 text-center py-8">{error.addresses}</div>
                    ) : addresses.length === 0 ? (
                      <div className="text-center py-8">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No saved addresses</p>
                        <Button className="mt-4">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Address
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((address) => (
                          <Card key={address.id}>
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="font-semibold">{address.label}</h4>
                                  {address.isDefault && (
                                    <Badge variant="secondary" className="mt-1">Default</Badge>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">
                                <p>{address.street}</p>
                                <p>{address.city}, {address.state} {address.postalCode}</p>
                                <p>{address.country}</p>
                                {address.phone && <p className="mt-2">📞 {address.phone}</p>}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Methods Tab */}
                {activeTab === 'payment' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Payment Methods
                      </h3>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Payment Method
                      </Button>
                    </div>
                    
                    {loading.payments ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      </div>
                    ) : error.payments ? (
                      <div className="text-red-500 text-center py-8">{error.payments}</div>
                    ) : payments.length === 0 ? (
                      <div className="text-center py-8">
                        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No payment methods saved</p>
                        <Button className="mt-4">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Payment Method
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {payments.map((payment) => (
                          <Card key={payment.id}>
                            <CardContent className="p-6">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                  <CreditCard className="w-8 h-8 text-gray-400" />
                                  <div>
                                    <h4 className="font-semibold">
                                      **** **** **** {payment.last4}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      {payment.brand} • Expires {payment.expMonth}/{payment.expYear}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Account Settings
                    </h3>
                    
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Email Notifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Order Updates</p>
                                <p className="text-sm text-gray-500">Get notified about order status changes</p>
                              </div>
                              <label className="flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="sr-only peer"
                                  aria-label="Enable order notifications"
                                  defaultChecked 
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Promotions</p>
                                <p className="text-sm text-gray-500">Receive promotional emails and offers</p>
                              </div>
                              <label className="flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="sr-only peer"
                                  aria-label="Enable promotional notifications"
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Privacy Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Profile Visibility</p>
                                <p className="text-sm text-gray-500">Make your profile visible to other users</p>
                              </div>
                              <label className="flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="sr-only peer"
                                  aria-label="Enable profile visibility"
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Show Reviews</p>
                                <p className="text-sm text-gray-500">Display your reviews publicly</p>
                              </div>
                              <label className="flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="sr-only peer"
                                  aria-label="Show reviews publicly"
                                  defaultChecked
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <Button variant="outline" className="w-full">
                              Change Password
                            </Button>
                            <Button variant="destructive" className="w-full">
                              Delete Account
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProfileEditModal
        isOpen={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
        profile={profile}
        onUpdate={(updatedProfile) => {
          setProfile(updatedProfile)
          setShowProfileEdit(false)
          showToast.success('Profile updated successfully!')
        }}
      />

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false)
          setSelectedProduct(null)
          setEditingReview(null)
        }}
        product={selectedProduct}
        existingReview={editingReview}
        onReviewSubmitted={() => {
          fetchReviews() // Refresh reviews after submission
          setShowReviewModal(false)
          setSelectedProduct(null)
          setEditingReview(null)
        }}
      />
    </>
  )
}
