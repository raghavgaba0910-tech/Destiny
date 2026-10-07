import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { MailDeliveryError, sendSmtpTestEmail } from '@/lib/mail'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin sign-in required.' }, { status: 403 })
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
