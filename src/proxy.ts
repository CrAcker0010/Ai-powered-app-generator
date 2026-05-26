import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Authentication redirection is fully disabled to allow guest access without compulsion.
  return NextResponse.next()
}

export const config = {
  // Apply middleware to all routes except API routes, static files, and Next.js internals
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
