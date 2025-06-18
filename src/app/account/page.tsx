"use client"

import { useState } from 'react'
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
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'payment', label: 'Payment Methods', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')

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
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Profile Information
                  </h3>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          defaultValue={session?.user?.name || ''}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pearl-500 focus:border-pearl-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          defaultValue={session?.user?.email || ''}
                          disabled
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="role"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Account Type
                      </label>
                      <input
                        type="text"
                        id="role"
                        value={session?.user?.role || 'USER'}
                        disabled
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
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
              )}

              {activeTab === 'orders' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Order History
                  </h3>
                  <div className="space-y-4">
                    {/* Sample Order */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Order #12345</p>
                          <p className="text-sm font-medium text-gray-900">
                            Placed on March 15, 2024
                          </p>
                        </div>
                        <span className="px-3 py-1 text-sm font-medium text-green-600 bg-green-50 rounded-full">
                          Delivered
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="relative w-20 h-20">
                          <Image
                            src="/images/products/necklace-1.jpg"
                            alt="Product"
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            Classic Pearl Necklace
                          </h4>
                          <p className="text-sm text-gray-500">
                            Quantity: 1
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            ৳15,000
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Wishlist
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sample Wishlist Item */}
                    <div className="border rounded-lg p-4">
                      <div className="relative w-full h-48 mb-4">
                        <Image
                          src="/images/products/earrings-1.jpg"
                          alt="Product"
                          fill
                          className="rounded-lg object-cover"
                        />
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Pearl Drop Earrings
                      </h4>
                      <p className="text-sm font-medium text-gray-900 mb-4">
                        ৳8,000
                      </p>
                      <button className="w-full px-4 py-2 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pearl-500">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Saved Addresses
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sample Address */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-sm font-medium text-gray-900">
                          Home Address
                        </h4>
                        <button className="text-pearl-600 hover:text-pearl-700">
                          Edit
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">
                        123 Pearl Street
                        <br />
                        Dhaka, 1000
                        <br />
                        Bangladesh
                      </p>
                    </div>
                  </div>
                  <button className="mt-6 px-4 py-2 border border-pearl-600 text-pearl-600 rounded-lg hover:bg-pearl-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pearl-500">
                    Add New Address
                  </button>
                </div>
              )}

              {activeTab === 'payment' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Payment Methods
                  </h3>
                  <div className="space-y-4">
                    {/* Sample Payment Method */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-8 bg-gray-200 rounded"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              **** **** **** 1234
                            </p>
                            <p className="text-sm text-gray-500">
                              Expires 12/25
                            </p>
                          </div>
                        </div>
                        <button className="text-red-600 hover:text-red-700">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  <button className="mt-6 px-4 py-2 border border-pearl-600 text-pearl-600 rounded-lg hover:bg-pearl-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pearl-500">
                    Add New Payment Method
                  </button>
                </div>
              )}

              {activeTab === 'settings' && (
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
                      <button className="px-4 py-2 border border-pearl-600 text-pearl-600 rounded-lg hover:bg-pearl-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pearl-500">
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
                      <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 