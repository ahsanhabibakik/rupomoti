'use client'

import { useEffect } from 'react'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Orders', href: '/admin/orders', icon: ListOrdered },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Media', href: '/admin/media', icon: ImageIcon },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/admin/login') {
      router.push(`/admin/login?callbackUrl=${encodeURIComponent(pathname)}`)
    }
  }, [status, router, pathname])

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show login page or children based on authentication status
  if (!session && pathname === '/admin/login') {
    return children
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 border-b">
            <h1 className="text-xl font-bold text-primary">Rupomoti Admin</h1>
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

          <div className="p-4">
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
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
} 