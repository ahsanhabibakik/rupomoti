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
  ShoppingCart,
  Crown,
  Award,
  Gem
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-pearl-essence">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pearl-essence-500 mx-auto mb-4"></div>
          <p className="text-pearl-essence-600 text-sm">Loading your account...</p>
        </div>
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
      <div className="min-h-screen bg-theme-primary py-6 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center gap-3 mb-4"
            >
              <Crown className="w-8 h-8 text-theme-gold-light" />
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-theme-primary">
                Your Account
              </h1>
              <Crown className="w-8 h-8 text-theme-gold-light" />
            </motion.div>
            <p className="text-theme-secondary max-w-2xl mx-auto">
              Manage your precious jewelry collection, track your orders, and personalize your experience with Rupomoti.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Mobile/Tablet Navigation */}
            <div className="lg:hidden">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-pearl-essence-100/90 backdrop-blur-sm rounded-xl shadow-pearl-essence p-4 mb-6 border border-pearl-essence-300/50"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative w-12 h-12">
                    <Image
                      src={session?.user?.image || '/images/default-avatar.png'}
                      alt="Profile"
                      fill
                      className="rounded-full object-cover ring-2 ring-rose-gold-400/50 shadow-rose-gold"
                    />
                    {isAdminOrManager && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-rose-gold rounded-full flex items-center justify-center">
                        <Gem className="w-2.5 h-2.5 text-pearl-essence-50" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-pearl-essence-700">
                      {session?.user?.name}
                    </h2>
                    <p className="text-xs text-pearl-essence-600">{session?.user?.email}</p>
                    {isAdminOrManager && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 text-xs bg-gradient-rose-gold text-pearl-essence-50 rounded-full shadow-rose-gold">
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
                        className={`flex items-center gap-2 p-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'bg-gradient-champagne text-pearl-essence-50 shadow-champagne transform scale-105'
                            : 'text-pearl-essence-600 hover:text-pearl-essence-700 hover:bg-pearl-essence-200/50 hover:shadow-pearl-essence'
                        }`}
                      >
                        <Icon size={14} />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-pearl-essence-100/90 backdrop-blur-sm rounded-xl shadow-pearl-essence p-6 sticky top-6 border border-pearl-essence-300/50"
              >
                {/* Profile Section */}
                <div className="flex items-center space-x-4 mb-8">
                  <div className="relative w-16 h-16">
                    <Image
                      src={session?.user?.image || '/images/default-avatar.png'}
                      alt="Profile"
                      fill
                      className="rounded-full object-cover ring-2 ring-rose-gold-400/50 shadow-rose-gold"
                    />
                    {isAdminOrManager && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-rose-gold rounded-full flex items-center justify-center">
                        <Gem className="w-3 h-3 text-pearl-essence-50" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-pearl-essence-700">
                      {session?.user?.name}
                    </h2>
                    <p className="text-sm text-pearl-essence-600">{session?.user?.email}</p>
                    {isAdminOrManager && (
                      <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 text-xs bg-gradient-rose-gold text-pearl-essence-50 rounded-full shadow-rose-gold">
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
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'bg-gradient-champagne text-pearl-essence-50 shadow-champagne transform scale-105'
                            : 'text-pearl-essence-600 hover:text-pearl-essence-700 hover:bg-pearl-essence-200/50 hover:shadow-pearl-essence'
                        }`}
                      >
                        <Icon size={16} />
                        {tab.label}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-rose-gold-600 hover:bg-rose-gold-50 hover:text-rose-gold-700 transition-all duration-300 mt-6 border-t border-pearl-essence-300/50 pt-4"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </nav>
              </motion.div>
            </div>

            {/* Main Content */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-pearl-essence-100/90 backdrop-blur-sm rounded-xl shadow-pearl-essence p-6 md:p-8 border border-pearl-essence-300/50">
                {/* Content based on active tab */}
                {activeTab === 'profile' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <User className="w-6 h-6 text-pearl-essence-500" />
                        <h3 className="text-xl font-semibold text-pearl-essence-700">
                          Profile Information
                        </h3>
                      </div>
                      <Button
                        onClick={() => setShowProfileEdit(true)}
                        className="bg-gradient-champagne hover:bg-gradient-rose-gold text-pearl-essence-50 shadow-champagne"
                        size="sm"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                    
                    {loading.profile ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pearl-essence-500 mx-auto mb-4"></div>
                        <p className="text-pearl-essence-600">Loading profile information...</p>
                      </div>
                    ) : error.profile ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-rose-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="w-8 h-8 text-rose-gold-600" />
                        </div>
                        <p className="text-rose-gold-600 mb-4">{error.profile}</p>
                        <Button
                          onClick={fetchProfileData}
                          variant="outline"
                          className="border-rose-gold-400 text-rose-gold-600 hover:bg-rose-gold-50"
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-pearl-essence-600 mb-2">
                              Full Name
                            </label>
                            <div className="bg-pearl-essence-50/50 rounded-lg p-3 border border-pearl-essence-300/30">
                              <p className="text-pearl-essence-700 font-medium">{session?.user?.name || 'Not provided'}</p>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-pearl-essence-600 mb-2">
                              Email
                            </label>
                            <div className="bg-pearl-essence-50/50 rounded-lg p-3 border border-pearl-essence-300/30">
                              <p className="text-pearl-essence-700 font-medium">{session?.user?.email}</p>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-pearl-essence-600 mb-2">
                              Phone
                            </label>
                            <div className="bg-pearl-essence-50/50 rounded-lg p-3 border border-pearl-essence-300/30">
                              <p className="text-pearl-essence-700 font-medium">{profile?.phone || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-pearl-essence-600 mb-2">
                              Date of Birth
                            </label>
                            <div className="bg-pearl-essence-50/50 rounded-lg p-3 border border-pearl-essence-300/30">
                              <p className="text-pearl-essence-700 font-medium">{profile?.dateOfBirth || 'Not provided'}</p>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-pearl-essence-600 mb-2">
                              Member Since
                            </label>
                            <div className="bg-pearl-essence-50/50 rounded-lg p-3 border border-pearl-essence-300/30">
                              <p className="text-pearl-essence-700 font-medium">
                                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Recently joined'}
                              </p>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-pearl-essence-600 mb-2">
                              Preferred Style
                            </label>
                            <div className="bg-pearl-essence-50/50 rounded-lg p-3 border border-pearl-essence-300/30">
                              <p className="text-pearl-essence-700 font-medium">{profile?.preferredStyle || 'Not specified'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-pearl-essence-600 mb-2">
                            Bio
                          </label>
                          <div className="bg-pearl-essence-50/50 rounded-lg p-3 border border-pearl-essence-300/30">
                            <p className="text-pearl-essence-700">{profile?.bio || 'Tell us about yourself and your jewelry preferences...'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <Package className="w-6 h-6 text-pearl-essence-500" />
                      <h3 className="text-xl font-semibold text-pearl-essence-700">
                        Order History
                      </h3>
                      {orders.length > 0 && (
                        <Badge className="bg-gradient-champagne text-pearl-essence-50 ml-2">
                          {orders.length} order{orders.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>

                    {loading.orders ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pearl-essence-500 mx-auto mb-4"></div>
                        <p className="text-pearl-essence-600">Loading your orders...</p>
                      </div>
                    ) : error.orders ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-rose-gold-400 mx-auto mb-4" />
                        <p className="text-rose-gold-600 mb-4">{error.orders}</p>
                        <Button
                          onClick={fetchOrders}
                          variant="outline"
                          className="border-rose-gold-400 text-rose-gold-600 hover:bg-rose-gold-50"
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-pearl-essence-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-pearl-essence-600 mb-2">No orders yet</h4>
                        <p className="text-pearl-essence-500 mb-6">Start shopping to see your orders here</p>
                        <Link href="/shop">
                          <Button className="bg-gradient-champagne hover:bg-gradient-rose-gold text-pearl-essence-50 shadow-champagne">
                            Browse Jewelry
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="bg-pearl-essence-50/50 rounded-lg p-4 border border-pearl-essence-300/30">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium text-pearl-essence-700">Order #{order.id}</h4>
                                <p className="text-sm text-pearl-essence-600">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge
                                className={
                                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                  order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                  order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-pearl-essence-200 text-pearl-essence-700'
                                }
                              >
                                {order.status}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-pearl-essence-700 font-medium">
                                ${order.total?.toFixed(2) || '0.00'}
                              </p>
                              <Link href={`/order-tracking?id=${order.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-pearl-essence-400 text-pearl-essence-600 hover:bg-pearl-essence-100"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Wishlist Tab */}
                {activeTab === 'wishlist' && (
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <Heart className="w-6 h-6 text-pearl-essence-500" />
                      <h3 className="text-xl font-semibold text-pearl-essence-700">
                        My Wishlist
                      </h3>
                      {wishlistItems.length > 0 && (
                        <Badge className="bg-gradient-champagne text-pearl-essence-50 ml-2">
                          {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>

                    {wishlistLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pearl-essence-500 mx-auto mb-4"></div>
                        <p className="text-pearl-essence-600">Loading your wishlist...</p>
                      </div>
                    ) : wishlistError ? (
                      <div className="text-center py-12">
                        <Heart className="w-16 h-16 text-rose-gold-400 mx-auto mb-4" />
                        <p className="text-rose-gold-600 mb-4">Failed to load wishlist</p>
                        <Button
                          onClick={() => window.location.reload()}
                          variant="outline"
                          className="border-rose-gold-400 text-rose-gold-600 hover:bg-rose-gold-50"
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : wishlistItems.length === 0 ? (
                      <div className="text-center py-12">
                        <Heart className="w-16 h-16 text-pearl-essence-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-pearl-essence-600 mb-2">Your wishlist is empty</h4>
                        <p className="text-pearl-essence-500 mb-6">Save your favorite jewelry pieces here</p>
                        <Link href="/shop">
                          <Button className="bg-gradient-champagne hover:bg-gradient-rose-gold text-pearl-essence-50 shadow-champagne">
                            Discover Jewelry
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {wishlistItems.map((item) => (
                          <div key={item.id} className="bg-pearl-essence-50/50 rounded-lg p-4 border border-pearl-essence-300/30 group hover:shadow-pearl-essence transition-all duration-300">
                            <div className="relative mb-3">
                              <Image
                                src={item.product?.images?.[0] || '/images/placeholder.jpg'}
                                alt={item.product?.name || 'Product'}
                                width={200}
                                height={200}
                                className="w-full h-40 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => handleRemoveFromWishlist(item.productId)}
                                className="absolute top-2 right-2 w-8 h-8 bg-rose-gold-100 rounded-full flex items-center justify-center text-rose-gold-600 hover:bg-rose-gold-200 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove from wishlist"
                                aria-label="Remove from wishlist"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <h4 className="font-medium text-pearl-essence-700 mb-2">{item.product?.name || 'Product'}</h4>
                            <p className="text-pearl-essence-600 text-sm mb-3">
                              ${item.product?.price?.toFixed(2) || '0.00'}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleAddToCart(item.product)}
                                className="flex-1 bg-gradient-champagne hover:bg-gradient-rose-gold text-pearl-essence-50 shadow-champagne"
                                size="sm"
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Add to Cart
                              </Button>
                              <Link href={`/product/${item.product?.slug || item.productId}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-pearl-essence-400 text-pearl-essence-600 hover:bg-pearl-essence-100"
                                >
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-pearl-essence-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-pearl-essence-700 mb-2">Reviews Section</h3>
                    <p className="text-pearl-essence-600">Your jewelry reviews will appear here</p>
                  </div>
                )}

                {/* Addresses Tab */}
                {activeTab === 'addresses' && (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-pearl-essence-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-pearl-essence-700 mb-2">Address Management</h3>
                    <p className="text-pearl-essence-600">Manage your shipping addresses</p>
                  </div>
                )}

                {/* Payment Methods Tab */}
                {activeTab === 'payment' && (
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 text-pearl-essence-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-pearl-essence-700 mb-2">Payment Methods</h3>
                    <p className="text-pearl-essence-600">Manage your payment preferences</p>
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="text-center py-12">
                    <Settings className="w-16 h-16 text-pearl-essence-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-pearl-essence-700 mb-2">Account Settings</h3>
                    <p className="text-pearl-essence-600">Customize your account preferences</p>
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
          fetchReviews()
          setShowReviewModal(false)
          setSelectedProduct(null)
          setEditingReview(null)
        }}
      />
    </>
  )
}
