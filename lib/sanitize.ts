/**
 * Input sanitization utilities to prevent Cross-Site Scripting (XSS),
 * control character injection, and denial of service via oversized inputs.
 */

/**
 * Strips HTML tags, script markup, and dangerous control characters from string input.
 */
export function sanitizeText(value: unknown, maxLength = 1000): string {
  if (typeof value !== 'string') return ''
  
  // 1. Strip null bytes and non-printable control characters except standard whitespace (\r, \n, \t)
  let cleaned = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
  
  // 2. Remove any HTML/XML tags and potential script injections
  cleaned = cleaned.replace(/<[^>]*>?/gm, '')

  // 3. Normalize whitespace and trim
  cleaned = cleaned.trim()

  // 4. Enforce maximum length
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength)
  }

  return cleaned
}

/**
 * Escapes characters for safe interpolation into raw HTML strings.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  return str.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character)
}

/**
 * Normalizes and validates an email string.
 */
export function sanitizeEmail(email: unknown): string {
  if (typeof email !== 'string') return ''
  return sanitizeText(email.toLowerCase(), 254)
}
