'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut, signIn } from 'next-auth/react'
import Link from 'next/link'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Orders', href: '/admin/orders', icon: ListOrdered },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'User Management', href: '/admin/users', icon: Shield },
  { name: 'Media', href: '/admin/media', icon: ImageIcon },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Coupons', href: '/admin/coupons', icon: Tag },
  { name: 'Shipping', href: '/admin/shipping', icon: Truck },
  { name: 'Reports', href: '/admin/reports', icon: FileText },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Roles & Permissions', href: '/admin/roles', icon: Shield },
]

function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-center h-16 px-4 border-b">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-bold text-primary group-hover:underline">Rupomoti Admin</span>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-2 text-sm rounded-md transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 space-y-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="w-5 h-5 mr-3" />
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
    { id: 1, text: 'New order placed by John Doe' },
    { id: 2, text: 'Stock low: Classic Pearl Necklace' },
    { id: 3, text: 'New review on "Elegant Pearl Earrings"' },
    { id: 4, text: 'Order #1233 marked as shipped' },
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
  if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
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
      {/* Notification bell and dark mode toggle */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
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
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg p-2">
              <div className="font-semibold mb-2 text-primary">Notifications</div>
              <ul className="text-sm space-y-1">
                {notifications.map((n) => (
                  <li key={n.id} className="py-1 px-2 rounded hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer">{n.text}</li>
                ))}
              </ul>
              <button onClick={() => setShowNotifications(false)} className="mt-2 text-xs text-gray-500 hover:underline">Close</button>
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
      {/* Mobile menu button - always visible on mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shadow-md border border-gray-300 bg-white/90">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block lg:bg-white lg:border-r">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="p-4 sm:p-6 md:p-8 max-w-full">
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  )
} 