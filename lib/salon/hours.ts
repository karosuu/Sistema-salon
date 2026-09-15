import type { Weekday } from "@prisma/client";

export const WEEKDAY_ORDER: Weekday[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

export type DisplayHours = {
  weekday: Weekday;
  label: string;
  hours: string;
  isClosed: boolean;
};

export function formatHoursRange(opensAt: string, closesAt: string, isClosed: boolean): string {
  if (isClosed) {
    return "Cerrado";
  }
  return `${opensAt} – ${closesAt}`;
}

export type AvailabilityRow = {
  weekday: Weekday;
  startsAt: string;
  endsAt: string;
  isOff: boolean;
};

export const DEFAULT_PROFESSIONAL_HOURS: Record<
  Weekday,
  { startsAt: string; endsAt: string; isOff: boolean }
> = {
  MONDAY: { startsAt: "09:00", endsAt: "18:00", isOff: false },
  TUESDAY: { startsAt: "09:00", endsAt: "18:00", isOff: false },
  WEDNESDAY: { startsAt: "09:00", endsAt: "18:00", isOff: false },
  THURSDAY: { startsAt: "09:00", endsAt: "18:00", isOff: false },
  FRIDAY: { startsAt: "09:00", endsAt: "18:00", isOff: false },
  SATURDAY: { startsAt: "09:00", endsAt: "16:00", isOff: false },
  SUNDAY: { startsAt: "09:00", endsAt: "18:00", isOff: true },
};

export function defaultProfessionalAvailability(): AvailabilityRow[] {
  return WEEKDAY_ORDER.map((weekday) => ({
    weekday,
    ...DEFAULT_PROFESSIONAL_HOURS[weekday],
  }));
}

export function availabilityToDisplayHours(rows: AvailabilityRow[]): DisplayHours[] {
  const byDay = new Map(rows.map((row) => [row.weekday, row]));

  return WEEKDAY_ORDER.map((weekday) => {
    const row = byDay.get(weekday);
    const isOff = row?.isOff ?? true;
    return {
      weekday,
      label: WEEKDAY_LABELS[weekday],
      hours: isOff
        ? "No trabaja"
        : formatHoursRange(row?.startsAt ?? "09:00", row?.endsAt ?? "18:00", false),
      isClosed: isOff,
    };
  });
}
