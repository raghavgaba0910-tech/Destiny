-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH_ON_DELIVERY', 'UPI', 'CARD');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SupportCategory" AS ENUM ('APPOINTMENT_SCHEDULING', 'LIVE_SESSION', 'BILLING_REFUND_RECEIPT', 'PRIVACY_DATA_ACCOUNT', 'CLIENT_EHR_PLATFORM', 'PAYOUTS_CLAIMS_DUES', 'SESSION_INCONVENIENCE', 'CLIENT_MANAGEMENT', 'CONTACT_US', 'OTHER');

-- CreateEnum
CREATE TYPE "SupportStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "address" TEXT,
ADD COLUMN     "paymentMode" "PaymentMode",
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "recipientName" TEXT;

-- AlterTable
ALTER TABLE "Prescription" ADD COLUMN     "followUpNotes" TEXT,
ADD COLUMN     "followUpRequired" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "nextSessionAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Professional" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ProfessionalApplication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "type" "ProfType" NOT NULL,
    "experience" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "licenseImage" TEXT NOT NULL,
    "licenseMimeType" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNotes" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfessionalApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "category" "SupportCategory" NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "relatedAppointmentId" TEXT,
    "relatedOrderId" TEXT,
    "relatedAssessmentId" TEXT,
    "status" "SupportStatus" NOT NULL DEFAULT 'OPEN',
    "adminResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalApplication_email_key" ON "ProfessionalApplication"("email");

-- CreateIndex
CREATE INDEX "ProfessionalApplication_status_createdAt_idx" ON "ProfessionalApplication"("status", "createdAt");

-- CreateIndex
CREATE INDEX "SupportTicket_status_createdAt_idx" ON "SupportTicket"("status", "createdAt");

-- CreateIndex
CREATE INDEX "SupportTicket_requesterId_createdAt_idx" ON "SupportTicket"("requesterId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProfessionalApplication" ADD CONSTRAINT "ProfessionalApplication_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_relatedAppointmentId_fkey" FOREIGN KEY ("relatedAppointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_relatedOrderId_fkey" FOREIGN KEY ("relatedOrderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_relatedAssessmentId_fkey" FOREIGN KEY ("relatedAssessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
