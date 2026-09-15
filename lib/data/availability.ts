import "server-only";

import {
  ANY_PROFESSIONAL_ID,
  BOOKING_HORIZON_DAYS,
  SLOT_BLOCKING_STATUSES,
  SLOT_STEP_MIN,
  computeSlotStartMinutes,
  mergeSlotStarts,
  minutesToHhmm,
  pickProfessionalForStart,
  type TimeWindow,
} from "@/lib/availability/engine";
import { prisma } from "@/lib/db";
import {
  addCalendarDays,
  addMinutesUtc,
  costaRicaDayStartUtc,
  costaRicaLocalToUtc,
  getCostaRicaDateParts,
  utcIntervalToLocalMinutes,
  utcToCostaRicaYmd,
  weekdayFromYmd,
} from "@/lib/timezone";

export type PublicSlot = {
  startsAt: string;
  endsAt: string;
  startMin: number;
  label: string;
  professionalId: string;
  assignedProfessionalId: string;
  professionalName: string;
};

type SlotQuery = {
  serviceId: string;
  professionalId: string;
  ymd: string;
  now?: Date;
  ignoreAppointmentId?: string;
};

function isYmd(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function earliestStartMin(ymd: string, now: Date): number {
  const parts = getCostaRicaDateParts(now);
  const today = `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
  if (ymd > today) {
    return 0;
  }
  if (ymd < today) {
    return 24 * 60;
  }
  return parts.hour * 60 + parts.minute + 1;
}

function toBusyWindows(
  rows: Array<{ startsAt: Date; endsAt: Date }>,
  ymd: string,
): TimeWindow[] {
  return rows
    .map((row) => utcIntervalToLocalMinutes({ start: row.startsAt, end: row.endsAt }, ymd))
    .filter((row): row is TimeWindow => row !== null);
}

async function loadDayContext(ymd: string, professionalIds: string[], ignoreAppointmentId?: string) {
  const weekday = weekdayFromYmd(ymd);
  const dayStart = costaRicaDayStartUtc(ymd);
  const dayEnd = costaRicaDayStartUtc(addCalendarDays(ymd, 1));

  const [salonHours, professionals, blocked, appointments] = await Promise.all([
    prisma.businessHours.findUnique({ where: { weekday } }),
    prisma.professional.findMany({
      where: { id: { in: professionalIds } },
      select: {
        id: true,
        name: true,
        isActive: true,
        availability: {
          where: { weekday },
          select: { startsAt: true, endsAt: true, isOff: true },
        },
      },
    }),
    prisma.blockedTime.findMany({
      where: {
        startsAt: { lt: dayEnd },
        endsAt: { gt: dayStart },
        OR: [{ professionalId: null }, { professionalId: { in: professionalIds } }],
      },
      select: { professionalId: true, startsAt: true, endsAt: true },
    }),
    prisma.appointment.findMany({
      where: {
        professionalId: { in: professionalIds },
        status: { in: [...SLOT_BLOCKING_STATUSES] },
        startsAt: { lt: dayEnd },
        endsAt: { gt: dayStart },
        ...(ignoreAppointmentId ? { id: { not: ignoreAppointmentId } } : {}),
      },
      select: { professionalId: true, startsAt: true, endsAt: true },
    }),
  ]);

  return { weekday, salonHours, professionals, blocked, appointments };
}

export async function getCompatibleProfessionals(serviceId: string) {
  return prisma.professional.findMany({
    where: {
      isActive: true,
      services: { some: { serviceId, service: { isActive: true } } },
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, bio: true, photoUrl: true },
  });
}

export async function listAvailableSlots(query: SlotQuery): Promise<PublicSlot[]> {
  if (!isYmd(query.ymd)) {
    return [];
  }

  const now = query.now ?? new Date();
  const todayYmd = utcToCostaRicaYmd(now);
  const maxYmd = addCalendarDays(todayYmd, BOOKING_HORIZON_DAYS);
  if (query.ymd < todayYmd || query.ymd > maxYmd) {
    return [];
  }

  const service = await prisma.service.findFirst({
    where: { id: query.serviceId, isActive: true },
    select: { id: true, durationMin: true },
  });
  if (!service) {
    return [];
  }

  const compatible = await getCompatibleProfessionals(service.id);
  const selected =
    query.professionalId === ANY_PROFESSIONAL_ID
      ? compatible
      : compatible.filter((item) => item.id === query.professionalId);

  if (selected.length === 0) {
    return [];
  }

  const ctx = await loadDayContext(
    query.ymd,
    selected.map((item) => item.id),
    query.ignoreAppointmentId,
  );

  const salon = ctx.salonHours
    ? {
        opensAt: ctx.salonHours.opensAt,
        closesAt: ctx.salonHours.closesAt,
        isClosed: ctx.salonHours.isClosed,
      }
    : null;

  const groups = selected.map((pro) => {
    const hours = ctx.professionals.find((row) => row.id === pro.id)?.availability[0];
    const busy = toBusyWindows(
      [
        ...ctx.blocked.filter(
          (row) => row.professionalId === null || row.professionalId === pro.id,
        ),
        ...ctx.appointments.filter((row) => row.professionalId === pro.id),
      ],
      query.ymd,
    );
    const starts = computeSlotStartMinutes({
      durationMin: service.durationMin,
      stepMin: SLOT_STEP_MIN,
      salon,
      professional: hours
        ? { startsAt: hours.startsAt, endsAt: hours.endsAt, isOff: hours.isOff }
        : { startsAt: "09:00", endsAt: "18:00", isOff: true },
      busy,
      earliestStartMin: earliestStartMin(query.ymd, now),
    });
    return { professionalId: pro.id, professionalName: pro.name, starts };
  });

  if (query.professionalId === ANY_PROFESSIONAL_ID) {
    return mergeSlotStarts(groups).map((startMin) => {
      const professionalId = pickProfessionalForStart(groups, startMin) ?? selected[0]?.id ?? "";
      const professionalName =
        groups.find((group) => group.professionalId === professionalId)?.professionalName ??
        "Cualquier profesional";
      const startsAt = costaRicaLocalToUtc(query.ymd, minutesToHhmm(startMin));
      const endsAt = addMinutesUtc(startsAt, service.durationMin);
      return {
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        startMin,
        label: minutesToHhmm(startMin),
        professionalId: ANY_PROFESSIONAL_ID,
        assignedProfessionalId: professionalId,
        professionalName,
      };
    });
  }

  const group = groups[0];
  if (!group) {
    return [];
  }

  return group.starts.map((startMin) => {
    const startsAt = costaRicaLocalToUtc(query.ymd, minutesToHhmm(startMin));
    const endsAt = addMinutesUtc(startsAt, service.durationMin);
      return {
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        startMin,
        label: minutesToHhmm(startMin),
        professionalId: group.professionalId,
        assignedProfessionalId: group.professionalId,
        professionalName: group.professionalName,
      };
  });
}

export async function isSlotOpen(query: {
  serviceId: string;
  professionalId: string;
  startsAt: Date;
  now?: Date;
  ignoreAppointmentId?: string;
}): Promise<boolean> {
  const ymd = utcToCostaRicaYmd(query.startsAt);
  const slots = await listAvailableSlots({
    serviceId: query.serviceId,
    professionalId: query.professionalId,
    ymd,
    now: query.now,
    ignoreAppointmentId: query.ignoreAppointmentId,
  });
  return slots.some((slot) => slot.startsAt === query.startsAt.toISOString());
}

export { isAppointmentOverlapError as overlapError } from "@/lib/availability/engine";
