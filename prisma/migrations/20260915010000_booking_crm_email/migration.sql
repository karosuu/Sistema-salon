-- AlterTable Customer
ALTER TABLE "Customer" ADD COLUMN "notes" TEXT;
ALTER TABLE "Customer" ADD COLUMN "preferences" TEXT;
ALTER TABLE "Customer" ADD COLUMN "birthDate" DATE;

-- AlterTable Appointment
ALTER TABLE "Appointment" ADD COLUMN "code" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "priceCrc" INTEGER;
ALTER TABLE "Appointment" ADD COLUMN "durationMin" INTEGER;

UPDATE "Appointment" AS a
SET
  "code" = 'PC-' || upper(substr(md5(a."id"), 1, 6)),
  "priceCrc" = s."priceCrc",
  "durationMin" = s."durationMin"
FROM "Service" AS s
WHERE s."id" = a."serviceId";

ALTER TABLE "Appointment" ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE "Appointment" ALTER COLUMN "priceCrc" SET NOT NULL;
ALTER TABLE "Appointment" ALTER COLUMN "durationMin" SET NOT NULL;

CREATE UNIQUE INDEX "Appointment_code_key" ON "Appointment"("code");

ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_price_nonnegative" CHECK ("priceCrc" >= 0);

ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_duration_positive" CHECK ("durationMin" > 0);

-- CreateTable Sale
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amountCrc" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "appointmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Sale_appointmentId_key" ON "Sale"("appointmentId");
CREATE INDEX "Sale_customerId_occurredAt_idx" ON "Sale"("customerId", "occurredAt");

ALTER TABLE "Sale"
  ADD CONSTRAINT "Sale_amount_nonnegative" CHECK ("amountCrc" >= 0);

ALTER TABLE "Sale"
  ADD CONSTRAINT "Sale_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Sale"
  ADD CONSTRAINT "Sale_appointmentId_fkey"
  FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable NotificationLog
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "error" TEXT,
    "appointmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "NotificationLog_appointmentId_idx" ON "NotificationLog"("appointmentId");
CREATE INDEX "NotificationLog_eventType_status_idx" ON "NotificationLog"("eventType", "status");

ALTER TABLE "NotificationLog"
  ADD CONSTRAINT "NotificationLog_appointmentId_fkey"
  FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
