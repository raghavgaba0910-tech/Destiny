import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

const { auth } = NextAuth(authConfig)

const PUBLIC_EXACT_PATHS = new Set([
  '/',
  '/login',
  '/register',
  '/for-patients',
  '/for-professionals',
  '/professional-register',
  '/professional-login',
])

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.has(pathname)) return true
  if (pathname.startsWith('/api/auth')) return true
  if (pathname === '/api/professional-applications') return true
  return false
}

export default auth((req) => {
  const { nextUrl } = req
  const pathname = nextUrl.pathname
  const session = req.auth
  const ip = getClientIp(req)

  // 1. Handle CORS Preflight for API
  if (pathname.startsWith('/api/') && req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': nextUrl.origin,
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // 2. CSRF check on mutating API requests: verify Origin header matches Host if provided
  if (pathname.startsWith('/api/') && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
    const origin = req.headers.get('origin')
    const host = req.headers.get('host')
    if (origin && host) {
      try {
        const originUrl = new URL(origin)
        if (originUrl.host !== host) {
          return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: 'Invalid origin header.' }, { status: 400 })
      }
    }
  }

  // 3. Rate limiting for API endpoints
  if (pathname.startsWith('/api/')) {
    const isAuthEndpoint = pathname.startsWith('/api/auth')
    const limitConfig = isAuthEndpoint ? RATE_LIMITS.AUTH : RATE_LIMITS.GENERAL_API
    const rateCheck = checkRateLimit(`${ip}:${isAuthEndpoint ? 'auth' : 'api'}`, limitConfig)

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateCheck.resetMs / 1000)),
          },
        }
      )
    }
  }

  const isPublic = isPublicPath(pathname)

  // 4. Authentication Check
  if (!isPublic && !session?.user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized. Sign-in required.' }, { status: 401 })
    }
    const loginUrl = new URL('/login', nextUrl)
    return NextResponse.redirect(loginUrl)
  }

  // 5. Must Change Password Check
  if (
    session?.user?.mustChangePassword &&
    pathname !== '/change-password' &&
    pathname !== '/api/account/password' &&
    !pathname.startsWith('/api/auth')
  ) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Password change required before accessing other resources.' }, { status: 403 })
    }
    return NextResponse.redirect(new URL('/change-password', nextUrl))
  }

  // 6. Role-Based Access Control (RBAC) & Admin Route Protection
  const role = session?.user?.role

  // Admin routes: ONLY role === 'ADMIN' allowed
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (role !== 'ADMIN') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })
      }
      return NextResponse.redirect(new URL(role === 'PATIENT' ? '/dashboard' : '/pro', nextUrl))
    }
  }

  // Professional Console (/pro): ONLY professionals allowed
  if (pathname.startsWith('/pro')) {
    if (role === 'PATIENT') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', nextUrl))
    }
  }

  // Patient dashboard & journeys: redirect non-patients appropriately
  if (pathname === '/dashboard') {
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', nextUrl))
    }
    if (role && role !== 'PATIENT') {
      return NextResponse.redirect(new URL('/pro', nextUrl))
    }
  }

  const response = NextResponse.next()
  return response
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
