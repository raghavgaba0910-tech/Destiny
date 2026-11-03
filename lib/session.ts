export const DEFAULT_SESSION_DURATION_MINUTES = 60

export function isJoinWindowOpen(
  startTime: Date,
  now = new Date(),
  durationMinutes = DEFAULT_SESSION_DURATION_MINUTES
): boolean {
  const differenceInMinutes = (startTime.getTime() - now.getTime()) / 60_000
  return differenceInMinutes <= 10 && differenceInMinutes >= -durationMinutes
}

