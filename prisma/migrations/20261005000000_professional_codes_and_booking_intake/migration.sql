CREATE TYPE "PatientGender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

ALTER TABLE "Professional" ADD COLUMN "professionalCode" TEXT;

WITH numbered AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (ORDER BY "id") AS number,
    "type"
  FROM "Professional"
)
UPDATE "Professional" AS professional
SET "professionalCode" =
  'DT' || LPAD(numbered.number::TEXT, 5, '0') ||
  CASE numbered."type"
    WHEN 'THERAPIST' THEN 'T'
    WHEN 'COUNSELLOR' THEN 'C'
    WHEN 'PSYCHIATRIST' THEN 'P'
  END
FROM numbered
WHERE professional."id" = numbered."id";

ALTER TABLE "Professional" ALTER COLUMN "professionalCode" SET NOT NULL;
CREATE UNIQUE INDEX "Professional_professionalCode_key" ON "Professional"("professionalCode");

ALTER TABLE "Appointment"
  ADD COLUMN "patientName" TEXT NOT NULL DEFAULT 'Patient',
  ADD COLUMN "patientAge" INTEGER NOT NULL DEFAULT 18,
  ADD COLUMN "patientGender" "PatientGender" NOT NULL DEFAULT 'OTHER',
  ADD COLUMN "sharedAssessmentId" TEXT;

UPDATE "Appointment" AS appointment
SET "patientName" = "User"."name"
FROM "User"
WHERE appointment."patientId" = "User"."id";

ALTER TABLE "Appointment"
  ALTER COLUMN "patientName" DROP DEFAULT,
  ALTER COLUMN "patientAge" DROP DEFAULT,
  ALTER COLUMN "patientGender" DROP DEFAULT;

CREATE INDEX "Appointment_sharedAssessmentId_idx" ON "Appointment"("sharedAssessmentId");
ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_sharedAssessmentId_fkey"
  FOREIGN KEY ("sharedAssessmentId") REFERENCES "Assessment"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
