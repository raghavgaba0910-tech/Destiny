export function isJoinWindowOpen(startTime: Date, now = new Date()): boolean {
  const differenceInMinutes = (startTime.getTime() - now.getTime()) / 60_000
  return differenceInMinutes <= 10 && differenceInMinutes >= -15
}
