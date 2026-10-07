import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { createTransport, mkdir, sendMail, writeFile } = vi.hoisted(() => ({
  createTransport: vi.fn(),
  mkdir: vi.fn(),
  sendMail: vi.fn(),
  writeFile: vi.fn(),
}))

vi.mock('node:fs/promises', () => ({
  default: { mkdir, writeFile },
  mkdir,
  writeFile,
}))

vi.mock('nodemailer', () => ({
  default: { createTransport },
}))

import { MailDeliveryError, sendMailOrCreatePreview } from '@/lib/mail'

const mail = {
  id: 'mail-test',
  to: 'recipient@example.test',
  subject: 'Test message',
  html: '<p>Test message</p>',
}

describe('sendMailOrCreatePreview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mkdir.mockResolvedValue(undefined)
    writeFile.mockResolvedValue(undefined)
    vi.stubEnv('SMTP_HOST', 'smtp.example.test')
    vi.stubEnv('SMTP_PORT', '587')
    vi.stubEnv('SMTP_SECURE', 'false')
    vi.stubEnv('SMTP_USER', 'sender@example.test')
    vi.stubEnv('SMTP_PASSWORD', 'test-password')
    vi.stubEnv('MAIL_FROM', 'Destiny <sender@example.test>')
    vi.stubEnv('MAIL_PREVIEW_DIR', '.mail-previews')
    sendMail.mockResolvedValue({})
    createTransport.mockReturnValue({ sendMail })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('sends through SMTP without requiring a writable preview directory', async () => {
    mkdir.mockRejectedValue(new Error('Read-only filesystem'))

    await expect(sendMailOrCreatePreview(mail)).resolves.toEqual({
      delivery: 'sent',
      message: 'A confirmation email was sent to your registered email address.',
    })

    expect(sendMail).toHaveBeenCalledOnce()
    expect(mkdir).not.toHaveBeenCalled()
    expect(writeFile).not.toHaveBeenCalled()
  })

  it('saves an HTML preview when SMTP is not configured', async () => {
    vi.stubEnv('SMTP_HOST', '')
    vi.stubEnv('SMTP_PORT', '')
    vi.stubEnv('SMTP_USER', '')
    vi.stubEnv('SMTP_PASSWORD', '')
    vi.stubEnv('MAIL_FROM', '')

    await expect(sendMailOrCreatePreview(mail)).resolves.toMatchObject({
      delivery: 'preview',
    })

    expect(sendMail).not.toHaveBeenCalled()
    expect(mkdir).toHaveBeenCalledOnce()
    expect(writeFile).toHaveBeenCalledOnce()
  })

  it('reports preview write failure when neither SMTP nor local preview storage is available', async () => {
    vi.stubEnv('SMTP_HOST', '')
    vi.stubEnv('SMTP_PORT', '')
    vi.stubEnv('SMTP_USER', '')
    vi.stubEnv('SMTP_PASSWORD', '')
    vi.stubEnv('MAIL_FROM', '')
    mkdir.mockRejectedValue(new Error('Read-only filesystem'))

    await expect(sendMailOrCreatePreview(mail)).rejects.toMatchObject({
      name: 'MailDeliveryError',
      previewSaved: false,
    } satisfies Partial<MailDeliveryError>)
  })
})
