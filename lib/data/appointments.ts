import "server-only";

import { AppointmentStatus } from "@prisma/client";

import { isAppointmentOverlapError, SLOT_BLOCKING_STATUSES } from "@/lib/availability/engine";
import { isSlotOpen } from "@/lib/data/availability";
import { prisma } from "@/lib/db";
import { ConflictError } from "@/lib/errors";
import { err, ok, type Result } from "@/lib/result";
import { addCalendarDays, costaRicaDayStartUtc } from "@/lib/timezone";

export type AdminAppointment = {
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
  createdAt: Date;
};

const include = {
  customer: { select: { id: true, name: true, phone: true, email: true } },
  service: { select: { id: true, name: true } },
  professional: { select: { id: true, name: true } },
} as const;

function mapRow(row: AdminAppointment): AdminAppointment {
  return row;
}

export async function listAdminAppointments(filters?: {
  status?: AppointmentStatus;
  professionalId?: string;
  ymd?: string;
}): Promise<AdminAppointment[]> {
  const where: {
    status?: AppointmentStatus;
    professionalId?: string;
    startsAt?: { gte: Date; lt: Date };
  } = {};

  if (filters?.status) {
    where.status = filters.status;
  }
  if (filters?.professionalId) {
    where.professionalId = filters.professionalId;
  }
  if (filters?.ymd) {
    const start = costaRicaDayStartUtc(filters.ymd);
    const end = costaRicaDayStartUtc(addCalendarDays(filters.ymd, 1));
    where.startsAt = { gte: start, lt: end };
  }

  const rows = await prisma.appointment.findMany({
    where,
    include,
    orderBy: { startsAt: "asc" },
  });

  return rows.map(mapRow);
}

export async function getAdminAppointment(id: string): Promise<AdminAppointment | null> {
  const row = await prisma.appointment.findUnique({
    where: { id },
    include,
  });
  return row ? mapRow(row) : null;
}

export async function listCalendarAppointments(ymd: string): Promise<AdminAppointment[]> {
  return listAdminAppointments({ ymd });
}

export async function setAppointmentStatusRecord(
  id: string,
  status: AppointmentStatus,
): Promise<Result<AdminAppointment>> {
  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) {
    return err("No encontramos esa cita.");
  }

  const now = new Date();
  const data: {
    status: AppointmentStatus;
    cancelledAt?: Date | null;
    completedAt?: Date | null;
    confirmedAt?: Date | null;
  } = { status };

  if (status === AppointmentStatus.CANCELLED) {
    data.cancelledAt = now;
  }
  if (status === AppointmentStatus.COMPLETED) {
    data.completedAt = now;
  }
  if (status === AppointmentStatus.CONFIRMED && !existing.confirmedAt) {
    data.confirmedAt = now;
  }

  const row = await prisma.appointment.update({
    where: { id },
    data,
    include,
  });

  return ok(mapRow(row));
}

export async function rescheduleAppointmentRecord(
  id: string,
  startsAt: Date,
): Promise<Result<AdminAppointment>> {
  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) {
    return err("No encontramos esa cita.");
  }
  if (
    existing.status === AppointmentStatus.CANCELLED ||
    existing.status === AppointmentStatus.COMPLETED ||
    existing.status === AppointmentStatus.NO_SHOW
  ) {
    return err("Esa cita ya no se puede reprogramar.");
  }

  const endsAt = new Date(startsAt.getTime() + existing.durationMin * 60 * 1000);

  try {
    const row = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${existing.professionalId}))
      `;

      const open = await isSlotOpen({
        serviceId: existing.serviceId,
        professionalId: existing.professionalId,
        startsAt,
        ignoreAppointmentId: id,
      });
      if (!open) {
        throw new ConflictError(
          "Ese horario acaba de ocuparse. Elegí otro, por favor.",
        );
      }

      return tx.appointment.update({
        where: { id },
        data: { startsAt, endsAt },
        include,
      });
    });

    return ok(mapRow(row));
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

export function isBlockingStatus(status: AppointmentStatus): boolean {
  return (SLOT_BLOCKING_STATUSES as readonly AppointmentStatus[]).includes(status);
}
