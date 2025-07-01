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
                {/* Content based on active tab */}
                {activeTab === 'profile' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Profile Information
                    </h3>
                    <div className="text-center py-8">
                      <p className="text-gray-500">Profile content will be loaded here</p>
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Order History
                    </h3>
                    <div className="text-center py-8">
                      <p className="text-gray-500">Orders will be displayed here</p>
                    </div>
                  </div>
                )}

                {activeTab === 'wishlist' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      My Wishlist
                    </h3>
                    <div className="text-center py-8">
                      <p className="text-gray-500">Wishlist items will be shown here</p>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      My Reviews
                    </h3>
                    <div className="text-center py-8">
                      <p className="text-gray-500">Your reviews will be displayed here</p>
                    </div>
                  </div>
                )}

                {activeTab === 'addresses' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Addresses
                    </h3>
                    <div className="text-center py-8">
                      <p className="text-gray-500">Address management will be here</p>
                    </div>
                  </div>
                )}

                {activeTab === 'payment' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Payment Methods
                    </h3>
                    <div className="text-center py-8">
                      <p className="text-gray-500">Payment methods will be managed here</p>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Account Settings
                    </h3>
                    <div className="text-center py-8">
                      <p className="text-gray-500">Account settings will be configured here</p>
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
          // Refresh reviews
        }}
      />
    </>
  )
}
