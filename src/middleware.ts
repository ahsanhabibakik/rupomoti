import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      // Allow access if user has admin or manager role
      return token?.role === 'ADMIN' || token?.role === 'MANAGER'
    }
  },
  pages: {
    signIn: '/signin'
  }
})

export const config = {
  matcher: ['/admin/:path*']
} 