import { PrismaClient } from '@prisma/client'
import {
  createProfessionalSchedule,
  isProfessionalScheduleTime,
} from '../lib/professional-schedule'

const prisma = new PrismaClient()

async function main() {
  const now = new Date()
  const summary = await prisma.$transaction(async (tx) => {
    const professionals = await tx.professional.findMany({
      where: { isApproved: true },
      select: { id: true },
    })
    if (!professionals.length) {
      return { professionals: 0, addedSlots: 0, removedOldAvailableSlots: 0 }
    }

    const professionalIds = professionals.map(({ id }) => id)
    const existingSlots = await tx.slot.findMany({
      where: {
        professionalId: { in: professionalIds },
        startTime: { gte: now },
      },
      select: {
        id: true,
        professionalId: true,
        startTime: true,
        isBooked: true,
      },
    })

    const existingKeys = new Set(
      existingSlots.map(({ professionalId, startTime }) => `${professionalId}:${startTime.getTime()}`),
    )
    const desiredSlots = professionals.flatMap(({ id }) => createProfessionalSchedule(id, now))
    const slotsToAdd = desiredSlots.filter(({ professionalId, startTime }) =>
      !existingKeys.has(`${professionalId}:${startTime.getTime()}`),
    )
    const obsoleteSlotIds = existingSlots
      .filter(({ isBooked, startTime }) =>
        !isBooked
        && !isProfessionalScheduleTime(startTime),
      )
      .map(({ id }) => id)

    const added = await tx.slot.createMany({
      data: slotsToAdd,
      skipDuplicates: true,
    })
    const removed = obsoleteSlotIds.length
      ? await tx.slot.deleteMany({
          where: {
            id: { in: obsoleteSlotIds },
            isBooked: false,
            appointment: { is: null },
          },
        })
      : { count: 0 }

    return {
      professionals: professionals.length,
      addedSlots: added.count,
      removedOldAvailableSlots: removed.count,
    }
  }, { timeout: 60_000 })

  console.log('Professional schedules updated to 10:00, 12:00, 15:00, and 17:00 Asia/Kolkata.')
  console.log(JSON.stringify(summary, null, 2))
  console.log('Existing booked appointments were left unchanged.')
}

main()
  .catch((error: unknown) => {
    console.error('Could not update professional schedules:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
