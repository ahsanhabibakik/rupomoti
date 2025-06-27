import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      // Check if user is trying to access admin routes
      if (req.nextUrl.pathname.startsWith('/admin')) {
        // Allow access to admin login page
        if (req.nextUrl.pathname === '/admin/login') {
          return true
        }
        
        // For other admin routes, check if user is admin
        const userRole = token?.role as string
        const isAdmin = token?.isAdmin as boolean
        
        // Allow access for SUPER_ADMIN, ADMIN, MANAGER roles, or if isAdmin is true
        return isAdmin || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'MANAGER'
      }
      
      // For non-admin routes, allow access
      return true
    }
  },
  pages: {
    signIn: '/admin/login'
  }
})

export const config = {
  matcher: ['/admin/:path*']
} 