import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req
  
  // Early return for non-admin routes to reduce processing
  if (!nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }
  
  // Fast redirect for admin login page
  if (nextUrl.pathname === '/admin/login') {
    const signinUrl = new URL('/signin', nextUrl.origin)
    signinUrl.searchParams.set('callbackUrl', '/admin')
    return NextResponse.redirect(signinUrl)
  }
  
  // Get token - optimized with faster secret resolution
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production'
  })
  
  // Fast unauthorized redirect
  if (!token) {
    const loginUrl = new URL('/signin', nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Optimized admin access check - combined condition
  const userRole = token.role as string
  const isAdmin = token.isAdmin as boolean
  const hasAdminAccess = isAdmin || ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(userRole)
  
  if (!hasAdminAccess) {
    const loginUrl = new URL('/signin', nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Allow access
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