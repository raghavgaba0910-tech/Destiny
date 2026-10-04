import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const summary = await prisma.$transaction(async (tx) => {
    const retainedBefore = {
      users: await tx.user.count(),
      professionals: await tx.professional.count(),
      medicines: await tx.medicine.count(),
      slots: await tx.slot.count(),
    }

    const prescriptions = await tx.prescription.deleteMany()
    const appointments = await tx.appointment.deleteMany()
    const assessments = await tx.assessment.deleteMany()
    const checkins = await tx.checkIn.deleteMany()
    const orders = await tx.order.deleteMany()
    const slots = await tx.slot.updateMany({ data: { isBooked: false } })

    const retainedAfter = {
      users: await tx.user.count(),
      professionals: await tx.professional.count(),
      medicines: await tx.medicine.count(),
      slots: await tx.slot.count(),
    }
    const remainingActivity = {
      prescriptions: await tx.prescription.count(),
      appointments: await tx.appointment.count(),
      assessments: await tx.assessment.count(),
      checkins: await tx.checkIn.count(),
      orders: await tx.order.count(),
      bookedSlots: await tx.slot.count({ where: { isBooked: true } }),
    }

    if (JSON.stringify(retainedBefore) !== JSON.stringify(retainedAfter)) {
      throw new Error('Account, provider, catalog, or availability records changed during the activity reset.')
    }
    if (Object.values(remainingActivity).some((count) => count !== 0)) {
      throw new Error('Some activity records remain after the reset.')
    }

    return {
      deleted: {
        prescriptions: prescriptions.count,
        appointments: appointments.count,
        assessments: assessments.count,
        checkins: checkins.count,
        orders: orders.count,
      },
      slotsMadeAvailable: slots.count,
      preserved: retainedAfter,
      remainingActivity,
    }
  })

  console.log('Account activity cleared successfully.')
  console.log(JSON.stringify(summary, null, 2))
}

main()
  .catch((error: unknown) => {
    console.error('Could not clear account activity:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
