import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-edge'

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
  
  // For Edge Runtime, we can't use full auth with database
  // This is a simplified middleware that doesn't require database access
  // The actual auth verification will be handled by the Node.js auth in API routes
  
  // Allow access for now - auth will be verified in API routes
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