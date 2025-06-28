"use client"

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
  MessageSquare
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { showToast } from '@/lib/toast'
import { ProfileEditModal } from '@/components/account/ProfileEditModal'
import { ReviewModal } from '@/components/account/ReviewModal'

const tabs = [
  // Main tabs
  { id: 'profile', label: 'Profile', icon: User, category: 'main' },
  { id: 'orders', label: 'Orders', icon: Package, category: 'main' },
  { id: 'wishlist', label: 'Wishlist', icon: Heart, category: 'main' },
  { id: 'reviews', label: 'Reviews', icon: Star, category: 'main' },
  // Secondary tabs
  { id: 'addresses', label: 'Addresses', icon: MapPin, category: 'secondary' },
  { id: 'payment', label: 'Payment', icon: CreditCard, category: 'secondary' },
  { id: 'settings', label: 'Settings', icon: Settings, category: 'secondary' },
]

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')

  // Dynamic data states - ensure all are arrays
  const [profile, setProfile] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [wishlist, setWishlist] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  
  // Form states
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', email: '' })
  const [addressForm, setAddressForm] = useState({
    name: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'Bangladesh'
  })
  const [paymentForm, setPaymentForm] = useState({
    cardholderName: '', cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '', isDefault: false
  })
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [editingReview, setEditingReview] = useState<any>(null)
  const [editingAddress, setEditingAddress] = useState<any>(null)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [editingPayment, setEditingPayment] = useState<any>(null)
  // Helper function to check if user can review a product
  const canReviewProduct = (productId: string) => {
    return orders.some((order: any) => 
      order.status === 'DELIVERED' && 
      order.items.some((item: any) => item.productId === productId) &&
      !reviews.some((review: any) => review.productId === productId)
    )
  }

  // Helper function to get review for a product
  const getProductReview = (productId: string) => {
    return reviews.find((review: any) => review.productId === productId)
  }

  // Helper function to format order status
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'SHIPPED': return 'bg-blue-100 text-blue-800'
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-purple-100 text-purple-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const [loading, setLoading] = useState({
    profile: false,
    orders: false,
    wishlist: false,
    reviews: false,
    addresses: false,
    payments: false,
    settings: false,
  })
  const [error, setError] = useState({
    profile: '',
    orders: '',
    wishlist: '',
    reviews: '',
    addresses: '',
    payments: '',
    settings: '',
  })

  // Fetch profile
  useEffect(() => {
    if (activeTab === 'profile') {
      setLoading((l) => ({ ...l, profile: true }))
      fetch('/api/auth/me')
        .then((r) => r.json())
        .then((data) => {
          setProfile(data)
          setProfileForm({ 
            name: data.name || '', 
            phone: data.phone || '', 
            email: data.email || '' 
          })
        })
        .catch(() => setError((e) => ({ ...e, profile: 'Failed to load profile' })))
        .finally(() => setLoading((l) => ({ ...l, profile: false })))
    }
  }, [activeTab])

  // Fetch orders
  useEffect(() => {
    if (activeTab === 'orders') {
      setLoading((l) => ({ ...l, orders: true }))
      fetch('/api/orders/user')
        .then((r) => r.json())
        .then((data) => {
          // Ensure orders is always an array
          setOrders(Array.isArray(data) ? data : [])
        })
        .catch(() => {
          setError((e) => ({ ...e, orders: 'Failed to load orders' }))
          setOrders([]) // Ensure it's an array even on error
        })
        .finally(() => setLoading((l) => ({ ...l, orders: false })))
    }
  }, [activeTab])

  // Fetch wishlist
  useEffect(() => {
    if (activeTab === 'wishlist') {
      setLoading((l) => ({ ...l, wishlist: true }))
      fetch('/api/wishlist')
        .then((r) => r.json())
        .then((data) => {
          // Ensure wishlist is always an array
          setWishlist(Array.isArray(data) ? data : [])
        })
        .catch(() => {
          setError((e) => ({ ...e, wishlist: 'Failed to load wishlist' }))
          setWishlist([]) // Ensure it's an array even on error
        })
        .finally(() => setLoading((l) => ({ ...l, wishlist: false })))
    }
  }, [activeTab])

  // Fetch reviews
  useEffect(() => {
    if (activeTab === 'reviews') {
      setLoading((l) => ({ ...l, reviews: true }))
      fetch('/api/reviews?mine=1')
        .then((r) => r.json())
        .then((data) => {
          // Ensure reviews is always an array
          setReviews(Array.isArray(data) ? data : [])
        })
        .catch(() => {
          setError((e) => ({ ...e, reviews: 'Failed to load reviews' }))
          setReviews([]) // Ensure it's an array even on error
        })
        .finally(() => setLoading((l) => ({ ...l, reviews: false })))
    }
  }, [activeTab])

  // Fetch addresses
  useEffect(() => {
    if (activeTab === 'addresses') {
      setLoading((l) => ({ ...l, addresses: true }))
      fetch('/api/addresses')
        .then((r) => r.json())
        .then((data) => {
          // Ensure addresses is always an array
          setAddresses(Array.isArray(data) ? data : [])
        })
        .catch(() => {
          setError((e) => ({ ...e, addresses: 'Failed to load addresses' }))
          setAddresses([]) // Ensure it's an array even on error
        })
        .finally(() => setLoading((l) => ({ ...l, addresses: false })))
    }
  }, [activeTab])

  // Fetch payment methods
  useEffect(() => {
    if (activeTab === 'payment') {
      setLoading((l) => ({ ...l, payments: true }))
      fetch('/api/payment-methods')
        .then((r) => r.json())
        .then((data) => {
          // Ensure payments is always an array
          setPayments(Array.isArray(data) ? data : [])
        })
        .catch(() => {
          setError((e) => ({ ...e, payments: 'Failed to load payment methods' }))
          setPayments([]) // Ensure it's an array even on error
        })
        .finally(() => setLoading((l) => ({ ...l, payments: false })))
    }
  }, [activeTab])

  // Fetch settings
  useEffect(() => {
    if (activeTab === 'settings') {
      setLoading((l) => ({ ...l, settings: true }))
      fetch('/api/settings')
        .then((r) => r.json())
        .then(setSettings)
        .catch(() => setError((e) => ({ ...e, settings: 'Failed to load settings' })))
        .finally(() => setLoading((l) => ({ ...l, settings: false })))
    }
  }, [activeTab])

  // Profile update
  const handleProfileUpdate = async (e: any) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      })
      if (res.ok) {
        const updatedProfile = await res.json()
        setProfile(updatedProfile)
        showToast.success('Profile updated successfully!')
      } else {
        const errorData = await res.json()
        showToast.error(errorData.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      showToast.error('Failed to update profile')
    }
  }

  // Address CRUD
  const handleAddAddress = () => {
    setEditingAddress(null)
    setAddressForm({
      name: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'Bangladesh'
    })
    setShowAddressModal(true)
  }

  const handleEditAddress = (address: any) => {
    setEditingAddress(address)
    setAddressForm({
      name: address.name,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country
    })
    setShowAddressModal(true)
  }

  const handleSaveAddress = async (e: any) => {
    e.preventDefault()
    console.log('Saving address:', { editingAddress, addressForm })
    
    try {
      const method = editingAddress ? 'PUT' : 'POST'
      const body = editingAddress 
        ? { id: editingAddress.id, ...addressForm } 
        : addressForm
      
      console.log('API request:', { method, body })
      
      const res = await fetch('/api/addresses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      
      const responseData = await res.json()
      console.log('API response:', { status: res.status, data: responseData })
      
      if (res.ok) {
        if (editingAddress) {
          setAddresses(addresses.map(a => a.id === editingAddress.id ? responseData : a))
        } else {
          setAddresses([responseData, ...addresses])
        }
        setShowAddressModal(false)
        showToast.success(`Address ${editingAddress ? 'updated' : 'added'} successfully!`)
      } else {
        showToast.error(responseData.error || `Failed to ${editingAddress ? 'update' : 'add'} address`)
      }
    } catch (error) {
      console.error('Error saving address:', error)
      showToast.error(`Failed to ${editingAddress ? 'update' : 'add'} address`)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    
    console.log('Deleting address:', addressId)
    
    try {
      const res = await fetch('/api/addresses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: addressId }),
      })
      
      const responseData = await res.json()
      console.log('Delete response:', { status: res.status, data: responseData })
      
      if (res.ok) {
        setAddresses(addresses.filter(a => a.id !== addressId))
        showToast.success('Address deleted successfully!')
      } else {
        showToast.error(responseData.error || 'Failed to delete address')
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      showToast.error('Failed to delete address')
    }
  }

  // Review functions
  const handleOpenReviewModal = (product: any, existingReview?: any) => {
    setSelectedProduct(product)
    setEditingReview(existingReview || null)
    setShowReviewModal(true)
  }

  const handleReviewSubmitted = () => {
    // Refresh reviews data
    fetch('/api/reviews?mine=1')
      .then((r) => r.json())
      .then((data) => {
        setReviews(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        setReviews([])
      })
  }

  const handleEditReview = async (reviewId: string, rating: number, comment: string) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, rating, comment }),
      })
      if (res.ok) {
        setReviews(reviews.map(r => r.id === reviewId ? { ...r, rating, comment } : r))
        showToast.success('Review updated!')
      }
    } catch (error) {
      showToast.error('Failed to update review')
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    try {
      const res = await fetch('/api/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId }),
      })
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== reviewId))
        showToast.success('Review deleted!')
      }
    } catch (error) {
      showToast.error('Failed to delete review')
    }
  }

  // Order details function
  const handleViewOrderDetails = (order: any) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  // Payment Method CRUD
  const handleAddPaymentMethod = () => {
    setEditingPayment(null)
    setPaymentForm({
      cardholderName: '', cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '', isDefault: false
    })
    setShowPaymentModal(true)
  }

  const handleEditPaymentMethod = (payment: any) => {
    setEditingPayment(payment)
    setPaymentForm({
      cardholderName: payment.cardholderName,
      cardNumber: payment.cardNumber,
      expiryMonth: payment.expiryMonth,
      expiryYear: payment.expiryYear,
      cvv: '', // Don&apos;t populate CVV for security
      isDefault: payment.isDefault
    })
    setShowPaymentModal(true)
  }

  const handleSavePaymentMethod = async (e: any) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/payment-methods', {
        method: editingPayment ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPayment ? { id: editingPayment.id, ...paymentForm } : paymentForm),
      })
      if (res.ok) {
        const newPayment = await res.json()
        if (editingPayment) {
          setPayments(payments.map(p => p.id === editingPayment.id ? newPayment : p))
        } else {
          setPayments([newPayment, ...payments])
        }
        setShowPaymentModal(false)
        showToast.success(`Payment method ${editingPayment ? 'updated' : 'added'} successfully!`)
      }
    } catch (error) {
      showToast.error(`Failed to ${editingPayment ? 'update' : 'add'} payment method`)
    }
  }

  const handleDeletePaymentMethod = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return
    try {
      const res = await fetch('/api/payment-methods', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: paymentId }),
      })
      if (res.ok) {
        setPayments(payments.filter(p => p.id !== paymentId))
        showToast.success('Payment method deleted successfully!')
      }
    } catch (error) {
      showToast.error('Failed to delete payment method')
    }
  }

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
                      {isAdmin ? 'Admin' : 'Manager'}
                    </span>
                  )}
                </div>
              </div>

              {/* Two Column Mobile Navigation */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {/* Main Column */}
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2">Main</h3>
                  {tabs.filter(tab => tab.category === 'main').map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary text-background'
                            : 'text-foreground hover:bg-secondary'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Secondary Column */}
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2">More</h3>
                  {tabs.filter(tab => tab.category === 'secondary').map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary text-background'
                            : 'text-foreground hover:bg-secondary'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Admin Dashboard & Sign out */}
              <div className="border-t pt-3 space-y-2">
                {isAdminOrManager && (
                  <Link
                    href="/admin"
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-accent bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-background rounded-2xl shadow-sm p-6 sticky top-6">
              <div className="flex items-center space-x-4 mb-6">
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
                      <Shield size={10} />
                      {isAdmin ? 'Admin' : 'Manager'}
                    </span>
                  )}
                </div>
              </div>

              <nav className="space-y-1">
                {isAdminOrManager && (
                  <Link
                    href="/admin"
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-accent bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-background'
                          : 'text-foreground hover:bg-secondary'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}

                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign out</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-background rounded-2xl shadow-sm p-4 md:p-6"
            >
              {activeTab === 'profile' && (
                loading.profile ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pearl-600"></div>
                  </div>
                ) : error.profile ? (
                  <div className="text-center py-8">
                    <div className="text-red-500 mb-4">{error.profile}</div>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700"
                    >
                      Try Again
                    </button>
                  </div>
                ) : profile ? (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Profile Information
                      </h3>
                      <button
                        onClick={() => setShowProfileEdit(true)}
                        className="px-4 py-2 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </button>
                    </div>
                    
                    {!showProfileEdit ? (
                      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative w-20 h-20">
                            <Image
                              src={profile.image || '/images/default-avatar.png'}
                              alt="Profile"
                              fill
                              className="rounded-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{profile.name}</h4>
                            <p className="text-gray-600">{profile.email}</p>
                            {profile.phone && <p className="text-gray-600">{profile.phone}</p>}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <p className="text-gray-900">{profile.name}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <p className="text-gray-900">{profile.email}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                            <p className="text-gray-900">{new Date(profile.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleProfileUpdate} className="bg-white border rounded-lg p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                              Full Name
                            </label>
                            <input
                              type="text"
                              id="name"
                              value={profileForm.name}
                              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pearl-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address
                            </label>
                            <input
                              type="email"
                              id="email"
                              value={profileForm.email}
                              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pearl-500 focus:border-transparent"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pearl-500 focus:border-transparent"
                            placeholder="+880 1XXX XXX XXX"
                          />
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setShowProfileEdit(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700 flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Save Changes
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : null
              )}

              {activeTab === 'orders' && (
                loading.orders ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pearl-600"></div>
                  </div>
                ) : error.orders ? (
                  <div className="text-center py-8">
                    <div className="text-red-500 mb-4">{error.orders}</div>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Order History
                    </h3>
                    
                    {orders.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h4>
                        <p className="text-gray-600 mb-6">Start shopping to see your order history</p>
                        <Link href="/shop">
                          <button className="px-6 py-3 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700">
                            Start Shopping
                          </button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {orders.map((order: any) => (
                          <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            {/* Order Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-gray-900">Order #{order.orderNumber}</h4>
                                  <p className="text-sm text-gray-600">
                                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {order.status}
                                  </span>
                                  <p className="text-lg font-semibold text-gray-900 mt-1">
                                    ৳{order.total.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-6">
                              <div className="space-y-4">
                                {order.items?.map((item: any) => (
                                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="relative w-20 h-20 flex-shrink-0">
                                      <Image
                                        src={item.product?.images?.[0] || '/images/placeholder.jpg'}
                                        alt={item.product?.name || 'Product'}
                                        fill
                                        className="rounded-lg object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-medium text-gray-900 truncate">
                                        {item.product?.name || 'Product'}
                                      </h5>
                                      <p className="text-sm text-gray-500">
                                        Quantity: {item.quantity} × ৳{item.price}
                                      </p>
                                      <p className="text-sm font-medium text-gray-900">
                                        Total: ৳{(item.quantity * item.price).toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                      {order.status === 'DELIVERED' && canReviewProduct(item.productId) && (
                                        <button
                                          onClick={() => handleOpenReviewModal(item.product)}
                                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                        >
                                          Leave Review
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Order Details */}
                              <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h5 className="font-medium text-gray-900 mb-3">Order Details</h5>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span>৳{order.subtotal.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Delivery Fee:</span>
                                        <span>৳{order.deliveryFee.toLocaleString()}</span>
                                      </div>
                                      {order.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                          <span>Discount:</span>
                                          <span>-৳{order.discount.toLocaleString()}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between font-medium pt-2 border-t">
                                        <span>Total:</span>
                                        <span>৳{order.total.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h5 className="font-medium text-gray-900 mb-3">Delivery Information</h5>
                                    <div className="space-y-2 text-sm">
                                      <p><span className="text-gray-600">Address:</span> {order.deliveryAddress}</p>
                                      <p><span className="text-gray-600">Payment:</span> {order.paymentMethod}</p>
                                      {order.trackingId && (
                                        <p><span className="text-gray-600">Tracking:</span> {order.trackingId}</p>
                                      )}
                                      {order.courierName && (
                                        <p><span className="text-gray-600">Courier:</span> {order.courierName}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 flex flex-wrap gap-3">
                                  <Link href={`/order-tracking/${order.orderNumber}`}>
                                    <button className="px-4 py-2 border border-pearl-600 text-pearl-600 rounded-lg hover:bg-pearl-50 transition-colors">
                                      Track Order
                                    </button>
                                  </Link>
                                  {order.status === 'DELIVERED' && (
                                    <button className="px-4 py-2 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700 transition-colors">
                                      Download Invoice
                                    </button>
                                  )}
                                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                    Contact Support
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}

              {activeTab === 'reviews' && (
                loading.reviews ? (
                  <div>Loading reviews...</div>
                ) : error.reviews ? (
                  <div className="text-red-500">{error.reviews}</div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      My Reviews
                    </h3>
                    <div className="space-y-4">
                      {reviews.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Star className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                          <p>You haven&apos;t written any reviews yet.</p>
                        </div>
                      ) : (
                        reviews.map((review) => (
                          <div key={review.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                <div className="relative w-16 h-16">
                                  <Image
                                    src={review.product?.images?.[0] || '/images/placeholder.jpg'}
                                    alt={review.product?.name || 'Product'}
                                    fill
                                    className="rounded-lg object-cover"
                                  />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {review.product?.name || 'Product'}
                                  </h4>
                                  <div className="flex items-center mt-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                    <span className="ml-2 text-sm text-gray-500">
                                      {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleOpenReviewModal(review.product, review)}
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit Review"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Review"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              )}

              {activeTab === 'addresses' && (
                loading.addresses ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pearl-600"></div>
                  </div>
                ) : error.addresses ? (
                  <div className="text-center py-8">
                    <div className="text-red-500 mb-4">{error.addresses}</div>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700"
                    >
                      Try Again
                    </button>
                  </div>
                ) : !session ? (
                  <div className="text-center py-12 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-yellow-800 mb-4">Please sign in to manage your addresses</div>
                    <button 
                      onClick={() => router.push('/signin')}
                      className="px-6 py-3 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700"
                    >
                      Sign In
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Saved Addresses
                      </h3>
                      <button
                        onClick={handleAddAddress}
                        className="px-4 py-2 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add New Address
                      </button>
                    </div>
                    
                    {/* Debug Info */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm">
                        <p>Debug: Session user ID: {session?.user?.id || 'No session'}</p>
                        <p>Debug: Addresses count: {addresses.length}</p>
                      </div>
                    )}
                    
                    {addresses.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <MapPin className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h4>
                        <p className="text-gray-600 mb-6">Add your first address to make checkout faster</p>
                        <button
                          onClick={handleAddAddress}
                          className="px-6 py-3 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700"
                        >
                          Add Your First Address
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map((address) => (
                          <div key={address.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-pearl-100 rounded-full flex items-center justify-center">
                                  <MapPin className="w-5 h-5 text-pearl-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{address.name}</h4>
                                  <p className="text-sm text-gray-500">{address.phone}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditAddress(address)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit address"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAddress(address.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete address"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                              <p>{address.street}</p>
                              <p>{address.city}, {address.state} {address.postalCode}</p>
                              <p>{address.country}</p>
                            </div>
                            {address.isDefault && (
                              <div className="mt-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Default Address
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}

              {/* Address Modal */}
              {showAddressModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                  <form onSubmit={handleSaveAddress} className="bg-white rounded-lg p-6 w-full max-w-md space-y-6 shadow-xl">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAddressModal(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Close"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your full name"
                          value={addressForm.name}
                          onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pearl-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          placeholder="+880 1XXX XXX XXX"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pearl-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          placeholder="House/Flat number, Street name"
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pearl-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            placeholder="City"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pearl-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State/Division *
                          </label>
                          <input
                            type="text"
                            placeholder="State/Division"
                            value={addressForm.state}
                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pearl-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            placeholder="Postal Code"
                            value={addressForm.postalCode}
                            onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pearl-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country *
                          </label>
                          <input
                            type="text"
                            placeholder="Country"
                            value={addressForm.country}
                            onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pearl-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 justify-end pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setShowAddressModal(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700 transition-colors flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {editingAddress ? 'Update' : 'Add'} Address
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Payment Method Modal */}
              {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                  <form onSubmit={handleSavePaymentMethod} className="bg-white rounded-lg p-6 w-full max-w-md space-y-6 shadow-xl">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {editingPayment ? 'Edit Payment Method' : 'Add Payment Method'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowPaymentModal(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Close"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          placeholder="Name on card"
                          value={paymentForm.cardholderName}
                          onChange={(e) => setPaymentForm({ ...paymentForm, cardholderName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pearl-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={paymentForm.cardNumber}
                          onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pearl-500 focus:border-transparent"
                          maxLength={19}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Month *
                          </label>
                          <select
                            value={paymentForm.expiryMonth}
                            onChange={(e) => setPaymentForm({ ...paymentForm, expiryMonth: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pearl-500 focus:border-transparent"
                            required
                          >
                            <option value="">MM</option>
                            {[...Array(12)].map((_, i) => (
                              <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                {String(i + 1).padStart(2, '0')}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Year *
                          </label>
                          <select
                            value={paymentForm.expiryYear}
                            onChange={(e) => setPaymentForm({ ...paymentForm, expiryYear: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pearl-500 focus:border-transparent"
                            required
                          >
                            <option value="">YYYY</option>
                            {[...Array(10)].map((_, i) => {
                              const year = new Date().getFullYear() + i
                              return (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            placeholder="123"
                            value={paymentForm.cvv}
                            onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pearl-500 focus:border-transparent"
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center pt-2">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={paymentForm.isDefault}
                          onChange={(e) => setPaymentForm({ ...paymentForm, isDefault: e.target.checked })}
                          className="h-4 w-4 text-pearl-600 focus:ring-pearl-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                          Set as default payment method
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 justify-end pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setShowPaymentModal(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700 transition-colors flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {editingPayment ? 'Update' : 'Add'} Payment Method
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'wishlist' && (
                loading.wishlist ? (
                  <div>Loading wishlist...</div>
                ) : error.wishlist ? (
                  <div className="text-red-500">{error.wishlist}</div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Wishlist
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {wishlist.length === 0 ? (
                        <div className="col-span-2 text-center py-8 text-gray-500">
                          <Heart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                          <p>Your wishlist is empty.</p>
                        </div>
                      ) : (
                        wishlist.map((item) => (
                          <div key={item.id} className="border rounded-lg p-4">
                            <div className="relative w-full h-48 mb-4">
                              <Image
                                src={item.product?.images?.[0] || '/images/placeholder.jpg'}
                                alt={item.product?.name || 'Product'}
                                fill
                                className="rounded-lg object-cover"
                              />
                            </div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              {item.product?.name || 'Product'}
                            </h4>
                            <p className="text-sm font-medium text-gray-900 mb-4">
                              ৳{item.product?.price || 0}
                            </p>
                            <button className="w-full px-4 py-2 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700">
                              Add to Cart
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              )}

              {activeTab === 'payment' && (
                loading.payments ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pearl-600"></div>
                  </div>
                ) : error.payments ? (
                  <div className="text-center py-8">
                    <div className="text-red-500 mb-4">{error.payments}</div>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Payment Methods
                      </h3>
                      <button
                        onClick={handleAddPaymentMethod}
                        className="px-4 py-2 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Payment Method
                      </button>
                    </div>
                    
                    {payments.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <CreditCard className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No payment methods saved</h4>
                        <p className="text-gray-600 mb-6">Add a payment method for faster checkout</p>
                        <button
                          onClick={handleAddPaymentMethod}
                          className="px-6 py-3 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700"
                        >
                          Add Payment Method
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {payments.map((payment) => (
                          <div key={payment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                                  <CreditCard className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {payment.cardholderName}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {payment.cardNumber} • Expires {payment.expiryMonth}/{payment.expiryYear}
                                  </p>
                                  {payment.isDefault && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                      Default
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditPaymentMethod(payment)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit payment method"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeletePaymentMethod(payment.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete payment method"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}

              {activeTab === 'settings' && (
                loading.settings ? (
                  <div>Loading settings...</div>
                ) : error.settings ? (
                  <div className="text-red-500">{error.settings}</div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Account Settings
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">
                          Email Notifications
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Order Updates
                              </p>
                              <p className="text-sm text-gray-500">
                                Get notified about your order status
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                defaultChecked
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pearl-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pearl-600"></div>
                            </label>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Promotional Emails
                              </p>
                              <p className="text-sm text-gray-500">
                                Receive updates about new products and offers
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pearl-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pearl-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">
                          Password
                        </h4>
                        <button className="px-4 py-2 border border-pearl-600 text-pearl-600 rounded-lg hover:bg-pearl-50">
                          Change Password
                        </button>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">
                          Delete Account
                        </h4>
                        <p className="text-sm text-gray-500 mb-4">
                          Once you delete your account, there is no going back.
                          Please be certain.
                        </p>
                        <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
        profile={profile}
        onUpdate={(updatedProfile) => {
          setProfile(updatedProfile)
          setProfileForm({
            name: updatedProfile.name || '',
            phone: updatedProfile.phone || '',
            email: updatedProfile.email || ''
          })
        }}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false)
          setSelectedProduct(null)
          setEditingReview(null)
        }}
        product={selectedProduct}
        existingReview={editingReview}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  )
}