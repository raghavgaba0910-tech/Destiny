const IST_OFFSET_MINUTES = 5 * 60 + 30
const SLOT_TIMES = [
  { hour: 10, minute: 0 },
  { hour: 12, minute: 0 },
  { hour: 15, minute: 0 },
  { hour: 17, minute: 0 },
] as const

const istDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function createProfessionalSchedule(
  professionalId: string,
  from = new Date(),
  weekdays = 21,
): { professionalId: string; startTime: Date }[] {
  if (!Number.isInteger(weekdays) || weekdays < 1) {
    throw new RangeError('Weekday count must be a positive integer.')
  }

  const [year, month, day] = istDateFormatter.format(from).split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  const slots: { professionalId: string; startTime: Date }[] = []
  let weekdaysAdded = 0

  while (weekdaysAdded < weekdays) {
    const weekday = date.getUTCDay()
    if (weekday !== 0 && weekday !== 6) {
      for (const { hour, minute } of SLOT_TIMES) {
        const startTime = new Date(Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
          hour,
          minute - IST_OFFSET_MINUTES,
        ))
        if (startTime > from) slots.push({ professionalId, startTime })
      }
      weekdaysAdded += 1
    }
    date.setUTCDate(date.getUTCDate() + 1)
  }

  return slots
}

export function isProfessionalScheduleTime(value: Date): boolean {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(value)
  const hour = Number(parts.find((part) => part.type === 'hour')?.value)
  const minute = Number(parts.find((part) => part.type === 'minute')?.value)
  return minute === 0 && SLOT_TIMES.some((time) => time.hour === hour)
}
