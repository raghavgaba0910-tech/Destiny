import { auth } from './auth'
import { NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/register']

export default auth((req) => {
  const { nextUrl, auth: session } = req as any
  const isPublic = PUBLIC_PATHS.some(p => nextUrl.pathname === p) || nextUrl.pathname.startsWith('/api/auth')

  if (!isPublic && !session) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
