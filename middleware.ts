import { auth } from './auth'
import { NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/register']

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const isPublic = PUBLIC_PATHS.some(p => nextUrl.pathname === p)
    || nextUrl.pathname === '/professional-register'
    || nextUrl.pathname === '/professional-login'
    || nextUrl.pathname === '/api/professional-applications'
    || nextUrl.pathname.startsWith('/api/auth')

  if (!isPublic && !session) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }
  if (
    session?.user.mustChangePassword
    && nextUrl.pathname !== '/change-password'
    && nextUrl.pathname !== '/api/account/password'
    && !nextUrl.pathname.startsWith('/api/auth')
  ) {
    return NextResponse.redirect(new URL('/change-password', nextUrl))
  }
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
