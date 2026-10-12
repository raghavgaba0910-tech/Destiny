CREATE INDEX "Appointment_patientId_status_idx" ON "Appointment"("patientId", "status");
CREATE INDEX "Appointment_professionalId_status_idx" ON "Appointment"("professionalId", "status");
CREATE INDEX "Assessment_userId_createdAt_idx" ON "Assessment"("userId", "createdAt");
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");
CREATE INDEX "Prescription_patientId_createdAt_idx" ON "Prescription"("patientId", "createdAt");
