import "server-only";

import type { Weekday } from "@prisma/client";

import { prisma } from "@/lib/db";
import { err, ok, type Result } from "@/lib/result";
import { WEEKDAY_ORDER } from "@/lib/salon/hours";
import type { BlockedTimeInput, BusinessHoursInput } from "@/lib/validations/hours";

export type AdminBusinessHours = {
  weekday: Weekday;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
};

export type AdminBlockedTime = {
  id: string;
  professionalId: string | null;
  professionalName: string | null;
  startsAt: Date;
  endsAt: Date;
  reason: string | null;
  isHoliday: boolean;
};

export async function listBusinessHours(): Promise<AdminBusinessHours[]> {
  const rows = await prisma.businessHours.findMany();
  const byDay = new Map(rows.map((row) => [row.weekday, row]));
  return WEEKDAY_ORDER.map((weekday) => {
    const row = byDay.get(weekday);
    return {
      weekday,
      opensAt: row?.opensAt ?? "09:00",
      closesAt: row?.closesAt ?? "18:00",
      isClosed: row?.isClosed ?? weekday === "SUNDAY",
    };
  });
}

export async function saveBusinessHoursRecord(
  days: BusinessHoursInput["days"],
): Promise<Result<void>> {
  await prisma.$transaction(
    days.map((day) =>
      prisma.businessHours.upsert({
        where: { weekday: day.weekday },
        update: {
          opensAt: day.opensAt.slice(0, 5),
          closesAt: day.closesAt.slice(0, 5),
          isClosed: day.isClosed,
        },
        create: {
          weekday: day.weekday,
          opensAt: day.opensAt.slice(0, 5),
          closesAt: day.closesAt.slice(0, 5),
          isClosed: day.isClosed,
        },
      }),
    ),
  );
  return ok(undefined);
}

export async function listBlockedTimes(): Promise<AdminBlockedTime[]> {
  const rows = await prisma.blockedTime.findMany({
    include: { professional: { select: { name: true } } },
    orderBy: { startsAt: "asc" },
  });
  return rows.map((row) => ({
    id: row.id,
    professionalId: row.professionalId,
    professionalName: row.professional?.name ?? null,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    reason: row.reason,
    isHoliday: row.isHoliday,
  }));
}

export async function createBlockedTimeRecord(
  input: BlockedTimeInput,
): Promise<Result<{ id: string }>> {
  if (input.endsAt <= input.startsAt) {
    return err("El fin del bloqueo debe ser posterior al inicio.");
  }

  if (input.professionalId) {
    const professional = await prisma.professional.findUnique({
      where: { id: input.professionalId },
      select: { id: true },
    });
    if (!professional) {
      return err("No encontramos a esa persona del equipo.");
    }
  }

  const row = await prisma.blockedTime.create({
    data: {
      professionalId: input.professionalId || null,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      reason: input.reason?.trim() ? input.reason.trim() : null,
      isHoliday: input.isHoliday,
    },
  });

  return ok({ id: row.id });
}

export async function deleteBlockedTimeRecord(id: string): Promise<Result<void>> {
  const existing = await prisma.blockedTime.findUnique({ where: { id } });
  if (!existing) {
    return err("No encontramos ese bloqueo.");
  }
  await prisma.blockedTime.delete({ where: { id } });
  return ok(undefined);
}
