import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add paths that require authentication here
const protectedPaths = [
  '/dashboard',
  '/apps',
  '/builder'
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the path matches any of our protected paths
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  
  if (isProtectedPath) {
    const sessionToken = request.cookies.get('session')
    
    // If no session token is found, redirect to the login page
    if (!sessionToken) {
      const loginUrl = new URL('/auth/login', request.url)
      // Optional: add a redirect param so users go back to where they tried to access after login
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // We handle authenticated redirection from /auth/login and /auth/signup on the client side
  // to avoid infinite loops caused by invalid or expired session cookies.

  return NextResponse.next()
}

export const config = {
  // Apply middleware to all routes except API routes, static files, and Next.js internals
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
