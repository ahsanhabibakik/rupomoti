import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      // TEMPORARY: Allow all access for debugging
      console.log('Middleware - checking token:', token)
      const userRole = token?.role as string
      console.log('Middleware - user role:', userRole)
      // Temporarily return true to allow all access
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