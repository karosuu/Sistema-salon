import type { AppointmentStatus } from "@prisma/client";

export type SpendSource = {
  priceCrc: number;
  status: AppointmentStatus;
};

export type SaleSource = {
  amountCrc: number;
  appointmentId: string | null;
};

export type VisitSource = {
  startsAt: Date;
  status: AppointmentStatus;
};

export type CustomerSegment = "nuevo" | "recurrente" | "inactivo" | "sin_visitas";

const ACTIVE_VISIT_STATUSES: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
];

export function totalSpentCrc(appointments: SpendSource[], sales: SaleSource[]): number {
  const fromCompleted = appointments
    .filter((item) => item.status === "COMPLETED")
    .reduce((sum, item) => sum + item.priceCrc, 0);

  const fromIndependentSales = sales
    .filter((item) => item.appointmentId == null)
    .reduce((sum, item) => sum + item.amountCrc, 0);

  return fromCompleted + fromIndependentSales;
}

export function visitCount(appointments: VisitSource[]): number {
  return appointments.filter((item) => item.status === "COMPLETED").length;
}

export function lastVisitAt(appointments: VisitSource[]): Date | null {
  const completed = appointments
    .filter((item) => item.status === "COMPLETED")
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());
  return completed[0]?.startsAt ?? null;
}

export function nextAppointmentAt(appointments: VisitSource[], now: Date): Date | null {
  const upcoming = appointments
    .filter(
      (item) =>
        (item.status === "PENDING" || item.status === "CONFIRMED") &&
        item.startsAt.getTime() >= now.getTime(),
    )
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  return upcoming[0]?.startsAt ?? null;
}

export function customerSegment(
  appointments: VisitSource[],
  now: Date,
  inactiveAfterDays = 90,
): CustomerSegment {
  const completed = appointments
    .filter((item) => item.status === "COMPLETED")
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  if (completed.length === 0) {
    const hasUpcoming = appointments.some(
      (item) =>
        ACTIVE_VISIT_STATUSES.includes(item.status) &&
        item.status !== "COMPLETED",
    );
    return hasUpcoming ? "nuevo" : "sin_visitas";
  }

  if (completed.length === 1) {
    const only = completed[0];
    if (!only) {
      return "sin_visitas";
    }
    const ageDays = (now.getTime() - only.startsAt.getTime()) / 86_400_000;
    return ageDays > inactiveAfterDays ? "inactivo" : "nuevo";
  }

  const last = completed[completed.length - 1];
  if (!last) {
    return "sin_visitas";
  }
  const ageDays = (now.getTime() - last.startsAt.getTime()) / 86_400_000;
  return ageDays > inactiveAfterDays ? "inactivo" : "recurrente";
}

export function segmentLabel(segment: CustomerSegment): string {
  switch (segment) {
    case "nuevo":
      return "Nuevo";
    case "recurrente":
      return "Recurrente";
    case "inactivo":
      return "Inactivo";
    default:
      return "Sin visitas";
  }
}
