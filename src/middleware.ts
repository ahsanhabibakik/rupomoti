import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      // Allow access if user has admin role
      return token?.role === 'ADMIN'
    }
  },
  pages: {
    signIn: '/admin/login'
  }
})

export const config = {
  matcher: ['/admin/:path*']
} 