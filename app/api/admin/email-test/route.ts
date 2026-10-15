import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { MailDeliveryError, sendSmtpTestEmail } from '@/lib/mail'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin sign-in required.' }, { status: 403 })
  }

  const ip = getClientIp(request)
  const rateLimit = checkRateLimit(`email-test:${session.user.id}:${ip}`, { windowMs: 5 * 60_000, maxRequests: 3 })
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many SMTP test requests. Please wait a few minutes before trying again.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimit.resetMs / 1000)) } }
    )
  }

  try {
    const result = await sendSmtpTestEmail()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Admin-triggered SMTP test failed:', error)
    const message = error instanceof MailDeliveryError
      ? error.message
      : 'The test email could not be sent.'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
