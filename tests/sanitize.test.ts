import { describe, expect, it } from 'vitest'
import { escapeHtml, sanitizeEmail, sanitizeText } from '@/lib/sanitize'

describe('sanitizeText', () => {
  it('strips html tags and scripts', () => {
    const malicious = '<script>alert("xss")</script>Hello <b>World</b>!'
    expect(sanitizeText(malicious)).toBe('alert("xss")Hello World!')
  })

  it('removes control characters', () => {
    const withControls = 'Clean\u0000Text\u0007Here'
    expect(sanitizeText(withControls)).toBe('CleanTextHere')
  })

  it('truncates to maxLength', () => {
    const long = 'a'.repeat(200)
    expect(sanitizeText(long, 50)).toHaveLength(50)
  })

  it('handles non-string values safely', () => {
    expect(sanitizeText(null)).toBe('')
    expect(sanitizeText(undefined)).toBe('')
    expect(sanitizeText(12345)).toBe('')
  })
})

describe('escapeHtml', () => {
  it('escapes html entities', () => {
    expect(escapeHtml('<script>alert("hello & welcome")</script>')).toBe(
      '&lt;script&gt;alert(&quot;hello &amp; welcome&quot;)&lt;/script&gt;'
    )
    expect(escapeHtml("Tom's test")).toBe('Tom&#39;s test')
  })
})

describe('sanitizeEmail', () => {
  it('lowercases and trims', () => {
    expect(sanitizeEmail('  USER@EXAMPLE.COM  ')).toBe('user@example.com')
  })
})
