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
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { showToast } from '@/lib/toast'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'reviews', label: 'My Reviews', icon: Star },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'payment', label: 'Payment Methods', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
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
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any>(null)
  
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
          setProfileForm({ name: data.name || '', phone: data.phone || '', email: data.email || '' })
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
        .then(setOrders)
        .catch(() => setError((e) => ({ ...e, orders: 'Failed to load orders' })))
        .finally(() => setLoading((l) => ({ ...l, orders: false })))
    }
  }, [activeTab])

  // Fetch wishlist
  useEffect(() => {
    if (activeTab === 'wishlist') {
      setLoading((l) => ({ ...l, wishlist: true }))
      fetch('/api/wishlist')
        .then((r) => r.json())
        .then(setWishlist)
        .catch(() => setError((e) => ({ ...e, wishlist: 'Failed to load wishlist' })))
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
    try {
      const res = await fetch('/api/addresses', {
        method: editingAddress ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAddress ? { id: editingAddress.id, ...addressForm } : addressForm),
      })
      if (res.ok) {
        const newAddress = await res.json()
        if (editingAddress) {
          setAddresses(addresses.map(a => a.id === editingAddress.id ? newAddress : a))
        } else {
          setAddresses([newAddress, ...addresses])
        }
        setShowAddressModal(false)
        showToast.success(`Address ${editingAddress ? 'updated' : 'added'} successfully!`)
      }
    } catch (error) {
      showToast.error(`Failed to ${editingAddress ? 'update' : 'add'} address`)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    try {
      const res = await fetch('/api/addresses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: addressId }),
      })
      if (res.ok) {
        setAddresses(addresses.filter(a => a.id !== addressId))
        showToast.success('Address deleted successfully!')
      }
    } catch (error) {
      showToast.error('Failed to delete address')
    }
  }

  // Review functions
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

  const canReviewProduct = (productId: string) => {
    // Ensure reviews is always an array and handle the case when it's not loaded yet
    if (!Array.isArray(reviews)) {
      return false
    }
    return !reviews.some(r => r.productId === productId)
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">
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
                  <h2 className="text-lg font-semibold text-gray-900">
                    {session?.user?.name}
                  </h2>
                  <p className="text-sm text-gray-500">{session?.user?.email}</p>
                  {isAdminOrManager && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
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
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
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
                          ? 'bg-pearl-50 text-pearl-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}

                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign out</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              {activeTab === 'profile' && (
                loading.profile ? (
                  <div>Loading profile...</div>
                ) : error.profile ? (
                  <div className="text-red-500">{error.profile}</div>
                ) : profile ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Profile Information
                    </h3>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pearl-500 focus:border-pearl-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pearl-500 focus:border-pearl-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pearl-500 focus:border-pearl-500"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pearl-500"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                ) : null
              )}

              {activeTab === 'orders' && (
                loading.orders ? (
                  <div>Loading orders...</div>
                ) : error.orders ? (
                  <div className="text-red-500">{error.orders}</div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Order History
                    </h3>
                    <div className="space-y-4">
                      {orders.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                          <p>No orders found.</p>
                        </div>
                      ) : (
                        orders.map((order: any) => (
                          <div key={order.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
                                <p className="text-sm font-medium text-gray-900">
                                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                order.status === 'DELIVERED' ? 'text-green-600 bg-green-50' :
                                order.status === 'SHIPPED' ? 'text-blue-600 bg-blue-50' :
                                'text-yellow-600 bg-yellow-50'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            
                            <div className="space-y-3">
                              {order.items?.map((item: any) => (
                                <div key={item.id} className="flex items-center space-x-4">
                                  <div className="relative w-20 h-20">
                                    <Image
                                      src={item.image || '/images/placeholder.jpg'}
                                      alt={item.name}
                                      fill
                                      className="rounded-lg object-cover"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900">
                                      {item.name}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      Quantity: {item.quantity}
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                      ৳{item.price}
                                    </p>
                                  </div>
                                  {order.status === 'DELIVERED' && canReviewProduct(item.productId) && (
                                    <button
                                      onClick={() => {/* TODO: Open review modal */}}
                                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                      Leave Review
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
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
                          <p>You haven't written any reviews yet.</p>
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
                                  onClick={() => handleEditReview(review.id, review.rating, review.comment)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="text-red-600 hover:text-red-700"
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
                  <div>Loading addresses...</div>
                ) : error.addresses ? (
                  <div className="text-red-500">{error.addresses}</div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Saved Addresses
                      </h3>
                      <button
                        onClick={handleAddAddress}
                        className="px-4 py-2 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Address
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.length === 0 ? (
                        <div className="col-span-2 text-center py-8 text-gray-500">
                          <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                          <p>No addresses saved yet.</p>
                        </div>
                      ) : (
                        addresses.map((address) => (
                          <div key={address.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="text-sm font-medium text-gray-900">
                                {address.name}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditAddress(address)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAddress(address.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              {address.street}<br />
                              {address.city}, {address.state} {address.postalCode}<br />
                              {address.country}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              Phone: {address.phone}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              )}

              {/* Address Modal */}
              {showAddressModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <form onSubmit={handleSaveAddress} className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 shadow-lg">
                    <h3 className="text-lg font-semibold mb-2">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        className="col-span-2 px-3 py-2 border rounded-lg"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="col-span-2 px-3 py-2 border rounded-lg"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        className="col-span-2 px-3 py-2 border rounded-lg"
                        required
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                        required
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Postal Code"
                        value={addressForm.postalCode}
                        onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddressModal(false)}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700"
                      >
                        {editingAddress ? 'Update' : 'Add'} Address
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
                  <div>Loading payment methods...</div>
                ) : error.payments ? (
                  <div className="text-red-500">{error.payments}</div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Payment Methods
                    </h3>
                    <div className="space-y-4">
                      {payments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <CreditCard className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                          <p>No payment methods saved.</p>
                        </div>
                      ) : (
                        payments.map((payment) => (
                          <div key={payment.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-8 bg-gray-200 rounded"></div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {payment.type} - {payment.provider}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {payment.last4 ? `**** ${payment.last4}` : 'No card number'}
                                  </p>
                                </div>
                              </div>
                              <button className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
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
    </div>
  )
} 