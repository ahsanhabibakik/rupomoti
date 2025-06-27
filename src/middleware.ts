import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      // Allow access if user has admin or manager role  
      const userRole = token?.role as string
      console.log('Middleware - checking authorization for role:', userRole)
      const isAuthorized = userRole === 'ADMIN' || userRole === 'MANAGER'
      console.log('Middleware - authorization result:', isAuthorized)
      return isAuthorized
    }
  },
  pages: {
    signIn: '/admin/login'
  }
})

export const config = {
  matcher: ['/admin/:path*']
} 