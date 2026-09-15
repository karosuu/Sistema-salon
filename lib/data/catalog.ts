import "server-only";

import { prisma } from "@/lib/db";
import {
  availabilityToDisplayHours,
  formatHoursRange,
  WEEKDAY_LABELS,
  WEEKDAY_ORDER,
  type DisplayHours,
} from "@/lib/salon/hours";

export type PublicService = {
  id: string;
  name: string;
  description: string;
  priceCrc: number;
  durationMin: number;
  imageUrl: string | null;
};

export type PublicProfessional = {
  id: string;
  name: string;
  bio: string;
  photoUrl: string | null;
  services: Array<{ id: string; name: string }>;
  hours: DisplayHours[];
};

const DEMO_HOURS: DisplayHours[] = WEEKDAY_ORDER.map((weekday) => ({
  weekday,
  label: WEEKDAY_LABELS[weekday],
  hours: weekday === "SUNDAY" ? "Cerrado" : weekday === "SATURDAY" ? "09:00 – 16:00" : "09:00 – 18:00",
  isClosed: weekday === "SUNDAY",
}));

export async function getPublicServices(): Promise<PublicService[]> {
  try {
    const rows = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        priceCrc: true,
        durationMin: true,
        imageUrl: true,
      },
    });
    return rows;
  } catch {
    return [];
  }
}

export async function getPublicProfessionals(
  serviceId?: string,
): Promise<PublicProfessional[]> {
  try {
    const rows = await prisma.professional.findMany({
      where: {
        isActive: true,
        ...(serviceId
          ? {
              services: {
                some: {
                  serviceId,
                  service: { isActive: true },
                },
              },
            }
          : {}),
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        bio: true,
        photoUrl: true,
        availability: {
          select: {
            weekday: true,
            startsAt: true,
            endsAt: true,
            isOff: true,
          },
        },
        services: {
          select: {
            service: { select: { id: true, name: true, isActive: true } },
          },
        },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      bio: row.bio,
      photoUrl: row.photoUrl,
      hours: availabilityToDisplayHours(row.availability),
      services: row.services
        .filter((item) => item.service.isActive)
        .map((item) => ({ id: item.service.id, name: item.service.name })),
    }));
  } catch {
    return [];
  }
}

export async function getDisplayHours(): Promise<DisplayHours[]> {
  try {
    const rows = await prisma.businessHours.findMany();
    if (rows.length === 0) {
      return DEMO_HOURS;
    }

    const byDay = new Map(rows.map((row) => [row.weekday, row]));
    return WEEKDAY_ORDER.map((weekday) => {
      const row = byDay.get(weekday);
      return {
        weekday,
        label: WEEKDAY_LABELS[weekday],
        hours: row
          ? formatHoursRange(row.opensAt, row.closesAt, row.isClosed)
          : "No definido",
        isClosed: row?.isClosed ?? true,
      };
    });
  } catch {
    return DEMO_HOURS;
  }
}
