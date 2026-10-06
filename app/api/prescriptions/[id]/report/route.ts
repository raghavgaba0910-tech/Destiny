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

function medicineRows(value: unknown): string {
  if (!Array.isArray(value)) return ''
  return value.flatMap((item) => {
    if (typeof item === 'string') return [`<tr><td>${escapeHtml(item)}</td><td>As directed by prescriber</td></tr>`]
    if (!item || typeof item !== 'object' || !('name' in item) || typeof item.name !== 'string') return []
    const dose = 'dose' in item && typeof item.dose === 'string' ? item.dose : ''
    const frequency = 'frequency' in item && typeof item.frequency === 'string' ? item.frequency.replaceAll('_', ' ').toLowerCase() : ''
    const duration = 'duration' in item && typeof item.duration === 'string' ? item.duration : ''
    return [`<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml([dose, frequency, duration].filter(Boolean).join(' · '))}</td></tr>`]
  }).join('')
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'PATIENT') return new Response('Patient sign-in required.', { status: 401 })
  const { id } = await params
  const prescription = await db.prescription.findFirst({
    where: { id, patientId: session.user.id },
    include: {
      appointment: {
        select: {
          patientName: true,
          professional: {
            select: { professionalCode: true, type: true, user: { select: { name: true } } },
          },
        },
      },
    },
  })
  if (!prescription) return new Response('Prescription report not found.', { status: 404 })
  const medicines = medicineRows(prescription.medicines)
  const role = prescription.appointment.professional.type.toLowerCase()
  const html = `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Destiny prescription and care report</title>
<style>body{font:16px Arial,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;color:#17182a}table{width:100%;border-collapse:collapse;margin:24px 0}th,td{text-align:left;vertical-align:top;border-bottom:1px solid #ddd;padding:12px 4px}.muted{color:#666;line-height:1.6}.block{margin:24px 0;padding:16px;background:#f6f5f2;border-radius:12px}@media print{button{display:none}}</style>
<h1>Destiny · Prescription and follow-up report</h1>
<p class="muted">This record is for the patient and clinician named below. It is not a diagnosis or emergency service.</p>
<h2>Patient</h2><p>${escapeHtml(prescription.appointment.patientName)}</p>
<h2>${medicines ? 'Prescribing clinician' : 'Follow-up plan by'}</h2><p>${escapeHtml(prescription.appointment.professional.user.name)} · ${escapeHtml(role)} · Destiny ID ${escapeHtml(prescription.appointment.professional.professionalCode)}</p>
<p class="muted">Issued ${escapeHtml(prescription.createdAt.toLocaleString('en-IN'))}</p>
${medicines ? `<h2>Medication schedule</h2><table><thead><tr><th>Medicine</th><th>Dose, frequency, duration</th></tr></thead><tbody>${medicines}</tbody></table>` : '<p class="block">No medication was prescribed. This report contains follow-up guidance only.</p>'}
<h2>Follow-up</h2><p>${prescription.followUpRequired ? 'A follow-up session is recommended.' : 'No follow-up session was recommended.'}</p>
${prescription.nextSessionAt ? `<p>Suggested next session: ${escapeHtml(prescription.nextSessionAt.toLocaleDateString('en-IN'))}</p>` : '<p>No next-session date was set.</p>'}
${prescription.followUpNotes ? `<div class="block"><strong>Care guidance</strong><p>${escapeHtml(prescription.followUpNotes).replaceAll('\n', '<br>')}</p></div>` : ''}
<p class="muted">Medication should be used only as directed by the prescriber. Destiny does not dispense medicines or replace professional care.</p>
<button onclick="window.print()">Print / save as PDF</button></html>`
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store' },
  })
}
