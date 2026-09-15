import "server-only";

import { AppointmentStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { addCalendarDays, costaRicaDayStartUtc, utcToCostaRicaYmd } from "@/lib/timezone";

export async function getDashboardSummary() {
  const now = new Date();
  const today = utcToCostaRicaYmd(now);
  const start = costaRicaDayStartUtc(today);
  const end = costaRicaDayStartUtc(addCalendarDays(today, 1));

  const [todayAppointments, pendingCount, upcoming, customerCount] = await Promise.all([
    prisma.appointment.findMany({
      where: { startsAt: { gte: start, lt: end } },
      include: {
        customer: { select: { name: true } },
        service: { select: { name: true } },
        professional: { select: { name: true } },
      },
      orderBy: { startsAt: "asc" },
    }),
    prisma.appointment.count({ where: { status: AppointmentStatus.PENDING } }),
    prisma.appointment.findMany({
      where: {
        startsAt: { gte: now },
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      },
      include: {
        customer: { select: { name: true } },
        service: { select: { name: true } },
        professional: { select: { name: true } },
      },
      orderBy: { startsAt: "asc" },
      take: 8,
    }),
    prisma.customer.count(),
  ]);

  return { todayAppointments, pendingCount, upcoming, customerCount, today };
}
