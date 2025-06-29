import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req
  
  // Get token using NextAuth JWT which works in Edge Runtime
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isLoggedIn = !!token
  
  // Check if user is trying to access admin routes
  if (nextUrl.pathname.startsWith('/admin')) {
    // Allow access to admin login page
    if (nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }
    
    // For other admin routes, check if user is logged in and is admin
    if (!isLoggedIn) {
      const loginUrl = new URL('/admin/login', nextUrl.origin)
      return NextResponse.redirect(loginUrl)
    }
    
    const userRole = token?.role as string
    const isAdmin = token?.isAdmin as boolean
    
    // Allow access for SUPER_ADMIN, ADMIN, MANAGER roles, or if isAdmin is true
    const hasAdminAccess = isAdmin || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'MANAGER'
    
    if (!hasAdminAccess) {
      const loginUrl = new URL('/admin/login', nextUrl.origin)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // For non-admin routes, allow access
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Only match admin UI routes, not API routes
    '/admin/((?!api).)*',
    // But also include the main /admin route
    '/admin'
  ]
} 