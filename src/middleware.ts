import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'catalog-auth'
const COOKIE_VALUE = 'authenticated'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/gate' || request.nextUrl.pathname === '/api/gate') {
    return NextResponse.next()
  }

  const auth = request.cookies.get(COOKIE_NAME)
  if (auth?.value === COOKIE_VALUE) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL('/gate', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|covers/).*)'],
}
