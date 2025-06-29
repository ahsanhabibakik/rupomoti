'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut, signIn } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  Package,
  ListOrdered,
  Users,
  Image as ImageIcon,
  LogOut,
  FolderTree,
  Menu,
  X,
  Settings,
  Tag,
  Star,
  ShoppingCart,
  Truck,
  FileText,
  Bell,
  Shield,
  Moon,
  Sun,
  Home,
  ChevronRight,
  Search,
  User,
  BarChart3,
  CreditCard,
  Gift,
  MessageSquare,
  Calendar,
  TrendingUp,
  AlertCircle,
  Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, badge: null },
  { name: 'Products', href: '/admin/products', icon: Package, badge: '12' },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree, badge: null },
  { name: 'Orders', href: '/admin/orders', icon: ListOrdered, badge: '5' },
  { name: 'Customers', href: '/admin/customers', icon: Users, badge: '24' },
  { name: 'User Management', href: '/admin/users', icon: Shield, badge: null },
  { name: 'Media', href: '/admin/media', icon: ImageIcon, badge: null },
  { name: 'Reviews', href: '/admin/reviews', icon: Star, badge: '8' },
  { name: 'Coupons', href: '/admin/coupons', icon: Tag, badge: '3' },
  { name: 'Couriers', href: '/admin/couriers', icon: Truck, badge: null },
  { name: 'Shipping', href: '/admin/shipping', icon: Truck, badge: null },
  { name: 'Reports', href: '/admin/reports', icon: FileText, badge: null },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell, badge: '4' },
  { name: 'Settings', href: '/admin/settings', icon: Settings, badge: null },
  { name: 'Roles & Permissions', href: '/admin/roles', icon: Shield, badge: null },
  {
    href: '/admin/newsletter',
    label: 'Newsletter',
    icon: Mail,
    pro: true,
  },
]

const quickStats = [
  { name: 'Total Sales', value: '$12,345', change: '+12%', icon: TrendingUp },
  { name: 'Orders', value: '156', change: '+8%', icon: ShoppingCart },
  { name: 'Customers', value: '2,847', change: '+15%', icon: Users },
  { name: 'Products', value: '89', change: '+3%', icon: Package },
]

function Sidebar({ className, onClose }: { className?: string; onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with Logo and Back to Home */}
      <div className="flex items-center justify-between h-16 px-4 border-b bg-white dark:bg-neutral-800">
        <Link href="/admin" className="flex items-center gap-3 group" onClick={onClose}>
          <Image 
            src="/images/branding/logo.png" 
            alt="Rupomoti" 
            width={32} 
            height={32} 
            className="rounded-lg"
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary group-hover:underline">Rupomoti</span>
            <span className="text-xs text-gray-500">Admin Panel</span>
          </div>
        </Link>
        <Link 
          href="/" 
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
          onClick={onClose}
        >
          <Home className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-gray-50 dark:bg-neutral-700 border-gray-200 dark:border-neutral-600"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-4 py-3 text-sm rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg border border-primary/20'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:text-primary'
              )}
              onClick={onClose}
            >
              <div className="flex items-center">
                <item.icon className={cn(
                  "w-5 h-5 mr-3", 
                  isActive 
                    ? "text-primary-foreground" 
                    : "text-gray-500 group-hover:text-primary"
                )} />
                <span className="font-medium">{item.name}</span>
              </div>
              {item.badge && (
                <Badge 
                  variant={isActive ? "secondary" : "default"} 
                  className={cn(
                    "text-xs",
                    isActive 
                      ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30" 
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile & Sign Out */}
      <div className="p-4 border-t bg-gray-50 dark:bg-neutral-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Admin User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">admin@rupomoti.com</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState('light')
  const [showNotifications, setShowNotifications] = useState(false)
  const notifications = [
    { id: 1, text: 'New order placed by John Doe', time: '2 min ago', type: 'order' },
    { id: 2, text: 'Stock low: Classic Pearl Necklace', time: '15 min ago', type: 'alert' },
    { id: 3, text: 'New review on "Elegant Pearl Earrings"', time: '1 hour ago', type: 'review' },
    { id: 4, text: 'Order #1233 marked as shipped', time: '2 hours ago', type: 'order' },
  ]

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/signin?callbackUrl=${encodeURIComponent(pathname || '')}`)
    }
  }, [status, router, pathname])

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    if (stored) setTheme(stored)
    document.documentElement.classList.toggle('dark', stored === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    if (typeof window !== 'undefined') localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Admin Access Required</h1>
        <p className="text-muted-foreground">Please sign in to access the admin dashboard</p>
        <Link
          href="/signin"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Sign In
        </Link>
      </div>
    )
  }

  const userRole = session.user?.role;
  if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN' && userRole !== 'MANAGER') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to access this page</p>
        <p className="text-sm text-gray-500">Admin or Manager access required</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 dark:text-white">
      {/* Top Bar - Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="p-2">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80 max-w-[85vw]">
              <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/images/branding/logo.png" 
              alt="Rupomoti" 
              width={28} 
              height={28} 
              className="rounded-lg"
            />
            <span className="font-bold text-primary">Admin</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors relative"
            aria-label="Show notifications"
          >
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{notifications.length}</span>
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-700" />}
          </button>
        </div>
      </div>

      {/* Notification Panel - Mobile */}
      {showNotifications && (
        <div className="lg:hidden fixed top-16 left-4 right-4 z-30 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-primary">Notifications</h3>
            <button 
              onClick={() => setShowNotifications(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 cursor-pointer">
                <div className={cn(
                  "w-2 h-2 rounded-full mt-2",
                  n.type === 'order' ? "bg-blue-500" : 
                  n.type === 'alert' ? "bg-red-500" : 
                  n.type === 'review' ? "bg-green-500" : "bg-gray-500"
                )} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{n.text}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Top Bar */}
      <div className="hidden lg:flex fixed top-0 right-0 z-30 p-4 gap-2">
        <div className="relative">
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="p-2 rounded-full bg-white/80 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors relative"
            aria-label="Show notifications"
          >
            <Bell className="h-5 w-5 text-primary" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{notifications.length}</span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg p-4 z-40">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-primary">Notifications</h3>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 cursor-pointer">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2",
                      n.type === 'order' ? "bg-blue-500" : 
                      n.type === 'alert' ? "bg-red-500" : 
                      n.type === 'review' ? "bg-green-500" : "bg-gray-500"
                    )} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{n.text}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white/80 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-700" />}
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block lg:bg-white lg:border-r lg:border-gray-200 dark:lg:bg-neutral-800 dark:lg:border-neutral-700">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="lg:pt-0 pt-16">
          <main className="p-4 sm:p-6 md:p-8 max-w-full">
            <Suspense fallback={<LoadingSpinner />}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
} 