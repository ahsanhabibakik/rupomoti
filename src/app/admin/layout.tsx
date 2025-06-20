'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
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
  Truck,
  FileText,
  Bell,
  Shield,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'

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
  { name: 'Reports', href: '/admin/reports', icon: FileText },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Roles & Permissions', href: '/admin/roles', icon: Shield },
]

interface SidebarProps {
  className?: string
  onNavigate?: () => void
}

function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname()

  const handleLinkClick = () => {
    if (onNavigate) {
      onNavigate()
    }
  }

  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      <div className="flex items-center justify-center h-16 px-4 border-b bg-gradient-to-r from-primary to-primary/80">
        <Link href="/admin" onClick={handleLinkClick}>
          <h1 className="text-xl font-bold text-white">Rupomoti Admin</h1>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                'flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 mr-3 transition-colors",
                isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
              )} />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <ChevronLeft className="w-4 h-4 ml-auto rotate-180" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t bg-gray-50">
        <Suspense fallback={<div className="h-8 animate-pulse bg-gray-200 rounded" />}>
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">System Status</span>
              <Badge variant="outline" className="text-xs">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                Online
              </Badge>
            </div>
          </div>
        </Suspense>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Loading admin dashboard...</p>
      </div>
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

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/signin?callbackUrl=${encodeURIComponent(pathname || '')}`)
    }
  }, [status, router, pathname])

  if (status === 'loading') {
    return <LoadingSpinner />
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access Required</h1>
          <p className="text-gray-600 mb-6">Please sign in with an admin account to access the dashboard</p>
          <Link
            href="/signin"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary/90 transition-colors"
          >
            Sign In to Admin
          </Link>
        </div>
      </div>
    )
  }

  const userRole = session.user?.role
  if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-2">You do not have permission to access this page</p>
          <p className="text-sm text-gray-500 mb-6">Admin or Manager access required</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full sm:w-auto"
            >
              Go Back
            </Button>
            <Link href="/">
              <Button className="w-full sm:w-auto">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <Sidebar onNavigate={() => setIsMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {session.user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:border-r lg:border-gray-200">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:pl-64">
          <main className="p-4 sm:p-6 lg:p-8">
            <Suspense fallback={<LoadingSpinner />}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
} 