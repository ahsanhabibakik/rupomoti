import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'
import type { NextRequest } from 'next/server'

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

export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isApiMedia = request.nextUrl.pathname.startsWith('/api/media');
  const session = request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token');

  if ((isAdminRoute || isApiMedia) && !session) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/media/:path*']
} 