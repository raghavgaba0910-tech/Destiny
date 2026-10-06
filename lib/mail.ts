import fs from 'node:fs/promises'
import path from 'node:path'
import nodemailer from 'nodemailer'

type MailMessage = {
  id: string
  to: string
  subject: string
  html: string
}

type MailResult = {
  delivery: 'sent' | 'preview'
  message: string
}

export class MailDeliveryError extends Error {
  readonly cause: unknown

  constructor(message: string, readonly previewSaved: boolean, cause: unknown) {
    super(message)
    this.name = 'MailDeliveryError'
    this.cause = cause
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character)
}

function getMailTransport() {
  const host = process.env.SMTP_HOST
  const from = process.env.MAIL_FROM
  const portText = process.env.SMTP_PORT
  const username = process.env.SMTP_USER
  const password = process.env.SMTP_PASSWORD
  const hasAnySmtpConfig = Boolean(host || from || portText || username || password)

  if (!host && !hasAnySmtpConfig) return null
  if (!host || !from) throw new Error('SMTP_HOST and MAIL_FROM are required to send email.')
  if (Boolean(username) !== Boolean(password)) throw new Error('SMTP_USER and SMTP_PASSWORD must be configured together.')

  const port = portText ? Number(portText) : 587
  if (!Number.isInteger(port) || port < 1 || port > 65_535) throw new Error('SMTP_PORT must be a valid TCP port.')

  return {
    from,
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true',
      ...(username && password ? { auth: { user: username, pass: password } } : {}),
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    }),
  }
}

export async function sendMailOrCreatePreview(mail: MailMessage): Promise<MailResult> {
  const previewDir = process.env.MAIL_PREVIEW_DIR || '.mail-previews'
  await fs.mkdir(previewDir, { recursive: true })
  const filename = path.join(previewDir, `${mail.id}.html`)
  await fs.writeFile(filename, mail.html, 'utf-8')

  let config: ReturnType<typeof getMailTransport>
  try {
    config = getMailTransport()
  } catch (error) {
    throw new MailDeliveryError('Email configuration is invalid.', true, error)
  }
  if (!config) {
    console.info(`Email delivery is not configured. Preview written to ${filename}`)
    return {
      delivery: 'preview',
      message: 'Email preview saved locally. Configure SMTP settings in .env to deliver emails to inboxes.',
    }
  }

  try {
    await config.transporter.sendMail({
      from: config.from,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
    })
  } catch (error) {
    throw new MailDeliveryError('Email provider rejected or could not deliver the message.', true, error)
  }
  return { delivery: 'sent', message: 'A confirmation email was sent to your registered email address.' }
}

export async function generateMailPreview(appointment: {
  id: string
  patientEmail: string
  patientName: string
  professionalName: string
  startTime: Date
  pricePerSession: number
}) {
  const slotTime = new Date(appointment.startTime)
  const dateLabel = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(slotTime)
  const timeLabel = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
  }).format(slotTime)
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Appointment confirmation — Destiny</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fbfaf8; color: #17182a;">
  <h1>Destiny</h1>
  <h2>Hello ${escapeHtml(appointment.patientName)}, your appointment is confirmed.</h2>
  <p><strong>Professional:</strong> ${escapeHtml(appointment.professionalName)}</p>
  <p><strong>Date:</strong> ${dateLabel}</p>
  <p><strong>Time:</strong> ${timeLabel} IST</p>
  <p><strong>Session fee:</strong> ₹${appointment.pricePerSession}</p>
  <p>View your appointments in your Destiny account.</p>
  <p style="color: #6B7280; font-size: 13px;">No payment is collected through this email. Destiny does not replace emergency care. In crisis, call Tele-MANAS at 14416 or emergency services at 112.</p>
</body>
</html>`

  return sendMailOrCreatePreview({
    id: appointment.id,
    to: appointment.patientEmail,
    subject: 'Your Destiny appointment is confirmed',
    html,
  })
}

export async function sendAssessmentConfirmation(assessment: {
  id: string
  to: string
  patientName: string
  title: string
}) {
  const resultUrl = new URL(`/assessment/result/${encodeURIComponent(assessment.id)}`, process.env.AUTH_URL || 'http://localhost:3000').toString()
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Assessment completed — Destiny</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fbfaf8; color: #17182a;">
  <h1>Destiny</h1>
  <h2>Hello ${escapeHtml(assessment.patientName)}, your check-in is complete.</h2>
  <p>Your ${escapeHtml(assessment.title)} report is ready in your private Destiny account.</p>
  <p><a href="${escapeHtml(resultUrl)}">View your care report</a></p>
  <p style="color: #6B7280; font-size: 13px;">Screening is not a diagnosis and does not replace professional or emergency care. In crisis, call Tele-MANAS at 14416 or emergency services at 112.</p>
</body>
</html>`

  return sendMailOrCreatePreview({
    id: `assessment-${assessment.id}`,
    to: assessment.to,
    subject: 'Your Destiny check-in report is ready',
    html,
  })
}

export async function sendProfessionalWelcome(professional: {
  id: string
  to: string
  name: string
  professionalCode: string
  temporaryPassword: string
}) {
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Your Destiny professional account</title></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;background:#fbfaf8;color:#17182a">
  <h1>Destiny</h1><h2>Welcome, ${escapeHtml(professional.name)}.</h2>
  <p>Your professional application is approved.</p>
  <p><strong>Destiny professional ID:</strong> ${escapeHtml(professional.professionalCode)}</p>
  <p><strong>Sign-in email:</strong> ${escapeHtml(professional.to)}</p>
  <p><strong>Temporary password:</strong> ${escapeHtml(professional.temporaryPassword)}</p>
  <p>Sign in as your professional role and change this temporary password immediately at first login.</p>
</body></html>`
  return sendMailOrCreatePreview({
    id: `professional-welcome-${professional.id}`,
    to: professional.to,
    subject: 'Your Destiny professional account is approved',
    html,
  })
}
