import { auth } from '@/auth'
import { db } from '@/lib/db'

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character)
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'PATIENT') {
    return new Response('Patient sign-in required.', { status: 401 })
  }
  const { id } = await params
  const order = await db.order.findFirst({ where: { id, userId: session.user.id } })
  if (!order) return new Response('Receipt not found.', { status: 404 })

  const items = Array.isArray(order.items) ? order.items.flatMap((item) => {
    if (!item || typeof item !== 'object' || !('name' in item) || typeof item.name !== 'string') return []
    const price = 'price' in item && typeof item.price === 'number' ? item.price : 0
    return [`<tr><td>${escapeHtml(item.name)}</td><td>₹${price}</td></tr>`]
  }).join('') : ''
  const html = `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Destiny order receipt</title>
<style>body{font:16px Arial,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;color:#17182a}table{width:100%;border-collapse:collapse;margin:24px 0}th,td{text-align:left;border-bottom:1px solid #ddd;padding:12px 4px}.total{font-size:20px;font-weight:bold}.muted{color:#666}@media print{button{display:none}}</style>
<h1>Destiny · Order receipt</h1><p class="muted">Receipt ${escapeHtml(order.id)} · ${escapeHtml(order.createdAt.toLocaleString('en-IN'))}</p>
<h2>Delivery details</h2><p>${escapeHtml(order.recipientName ?? '')}<br>${escapeHtml(order.phoneNumber ?? '')}<br>${escapeHtml(order.address ?? '')}<br>${escapeHtml(order.postalCode ?? '')}</p>
<p>Payment mode: ${escapeHtml(order.paymentMode ?? 'Not recorded')} (no payment collected)</p>
<table><thead><tr><th>Medicine</th><th>Price</th></tr></thead><tbody>${items}</tbody></table>
<p class="total">Total: ₹${order.total}</p><p class="muted">No payment has been collected and orders are not fulfilled.</p><button onclick="window.print()">Print / save as PDF</button></html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store' },
  })
}
