import "server-only";

import { randomBytes } from "node:crypto";

import { AppointmentStatus } from "@prisma/client";

import { generateReservationCode, isAppointmentOverlapError } from "@/lib/availability/engine";
import { isSlotOpen, listAvailableSlots } from "@/lib/data/availability";
import { prisma } from "@/lib/db";
import { ConflictError } from "@/lib/errors";
import { normalizePhone } from "@/lib/phone";
import { err, ok, type Result } from "@/lib/result";
import { addMinutesUtc, utcToCostaRicaYmd } from "@/lib/timezone";
import type { PublicBookingInput } from "@/lib/validations/appointment";

export type BookingRecord = {
  id: string;
  code: string;
  status: AppointmentStatus;
  startsAt: Date;
  endsAt: Date;
  priceCrc: number;
  durationMin: number;
  notes: string | null;
  customer: { id: string; name: string; phone: string; email: string | null };
  service: { id: string; name: string };
  professional: { id: string; name: string };
};

const bookingInclude = {
  customer: { select: { id: true, name: true, phone: true, email: true } },
  service: { select: { id: true, name: true } },
  professional: { select: { id: true, name: true } },
} as const;

function manageToken(): string {
  return randomBytes(24).toString("hex");
}

function toBooking(row: {
  id: string;
  code: string;
  status: AppointmentStatus;
  startsAt: Date;
  endsAt: Date;
  priceCrc: number;
  durationMin: number;
  notes: string | null;
  customer: { id: string; name: string; phone: string; email: string | null };
  service: { id: string; name: string };
  professional: { id: string; name: string };
}): BookingRecord {
  return row;
}

async function upsertCustomer(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  input: { name: string; phone: string; email?: string },
) {
  const phone = normalizePhone(input.phone);
  const email = input.email?.trim() ? input.email.trim() : null;
  const existing = await tx.customer.findFirst({ where: { phone } });

  if (existing) {
    return tx.customer.update({
      where: { id: existing.id },
      data: {
        name: input.name.trim(),
        ...(email ? { email } : {}),
      },
    });
  }

  return tx.customer.create({
    data: {
      name: input.name.trim(),
      phone,
      email,
    },
  });
}

async function uniqueCode(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateReservationCode();
    const found = await tx.appointment.findFirst({
      where: { code },
      select: { id: true },
    });
    if (!found) {
      return code;
    }
  }
  return `PC-${randomBytes(4).toString("hex").toUpperCase().slice(0, 6)}`;
}

export async function createPublicBooking(
  input: PublicBookingInput,
  now = new Date(),
): Promise<Result<BookingRecord>> {
  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, isActive: true },
  });
  if (!service) {
    return err("Ese servicio ya no está disponible.");
  }

  const startsAt = new Date(input.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    return err("La fecha y hora de la cita no son válidas.");
  }

  const ymd = utcToCostaRicaYmd(startsAt);
  const slots = await listAvailableSlots({
    serviceId: service.id,
    professionalId: input.professionalId,
    ymd,
    now,
  });
  const match = slots.find((slot) => slot.startsAt === startsAt.toISOString());
  if (!match) {
    return err(
      "Ese horario acaba de ocuparse o ya no está disponible. Elegí otro, por favor.",
    );
  }

  const professionalId = match.assignedProfessionalId;
  const endsAt = addMinutesUtc(startsAt, service.durationMin);

  try {
    const row = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${professionalId}))
      `;

      const stillOpen = await isSlotOpen({
        serviceId: service.id,
        professionalId,
        startsAt,
        now,
      });
      if (!stillOpen) {
        throw new ConflictError(
          "Ese horario acaba de ocuparse. Elegí otro, por favor.",
        );
      }

      const customer = await upsertCustomer(tx, {
        name: input.customerName,
        phone: input.customerPhone,
        email: input.customerEmail,
      });

      return tx.appointment.create({
        data: {
          code: await uniqueCode(tx),
          customerId: customer.id,
          serviceId: service.id,
          professionalId,
          startsAt,
          endsAt,
          priceCrc: service.priceCrc,
          durationMin: service.durationMin,
          status: AppointmentStatus.CONFIRMED,
          notes: input.notes?.trim() ? input.notes.trim() : null,
          manageToken: manageToken(),
          confirmedAt: now,
        },
        include: bookingInclude,
      });
    });

    return ok(toBooking(row));
  } catch (error) {
    if (error instanceof ConflictError) {
      return err(error.message);
    }
    if (isAppointmentOverlapError(error)) {
      return err("Ese horario acaba de ocuparse. Elegí otro, por favor.");
    }
    throw error;
  }
}

export async function getBookingByCode(code: string): Promise<BookingRecord | null> {
  const row = await prisma.appointment.findUnique({
    where: { code },
    include: bookingInclude,
  });
  return row ? toBooking(row) : null;
}
