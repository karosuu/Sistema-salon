import type { Weekday } from "@prisma/client";

import { BUSINESS_LOCALE, BUSINESS_TIMEZONE } from "@/lib/constants";

/**
 * Reglas de zona horaria:
 * - El negocio opera en America/Costa_Rica (UTC-6, sin DST).
 * - Horarios recurrentes (apertura, disponibilidad) se guardan como HH:mm locales.
 * - Citas y bloqueos se guardan como DateTime UTC.
 * - Toda presentación al usuario se formatea en America/Costa_Rica.
 */
export const TIMEZONE = BUSINESS_TIMEZONE;

const dateFormatter = new Intl.DateTimeFormat(BUSINESS_LOCALE, {
  timeZone: BUSINESS_TIMEZONE,
  dateStyle: "long",
});

const timeFormatter = new Intl.DateTimeFormat(BUSINESS_LOCALE, {
  timeZone: BUSINESS_TIMEZONE,
  timeStyle: "short",
});

const dateTimeFormatter = new Intl.DateTimeFormat(BUSINESS_LOCALE, {
  timeZone: BUSINESS_TIMEZONE,
  dateStyle: "long",
  timeStyle: "short",
});

export function formatDateCR(date: Date): string {
  return dateFormatter.format(date);
}

export function formatTimeCR(date: Date): string {
  return timeFormatter.format(date);
}

export function formatDateTimeCR(date: Date): string {
  return dateTimeFormatter.format(date);
}

export const COSTA_RICA_OFFSET = "-06:00";

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatYmd(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function costaRicaDayStartUtc(ymd: string): Date {
  return new Date(`${ymd}T00:00:00${COSTA_RICA_OFFSET}`);
}

export function costaRicaLocalToUtc(ymd: string, hhmm: string): Date {
  const time = hhmm.trim().slice(0, 5);
  return new Date(`${ymd}T${time}:00${COSTA_RICA_OFFSET}`);
}

export function formatYmdLong(ymd: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    return ymd;
  }
  return formatDateCR(costaRicaLocalToUtc(ymd, "12:00"));
}

export function utcToCostaRicaYmd(date: Date): string {
  const parts = getCostaRicaDateParts(date);
  return formatYmd(parts.year, parts.month, parts.day);
}

export function addCalendarDays(ymd: string, days: number): string {
  const start = costaRicaDayStartUtc(ymd);
  const shifted = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
  return utcToCostaRicaYmd(shifted);
}

export function weekdayFromYmd(ymd: string): Weekday {
  const utcNoonEquivalent = new Date(`${ymd}T12:00:00${COSTA_RICA_OFFSET}`);
  const jsDay = utcNoonEquivalent.getUTCDay();
  const map: Weekday[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  const weekday = map[jsDay];
  if (!weekday) {
    throw new Error("No se pudo determinar el día de la semana.");
  }
  return weekday;
}

export function addMinutesUtc(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function utcIntervalToLocalMinutes(
  interval: { start: Date; end: Date },
  ymd: string,
): { startMin: number; endMin: number } | null {
  const dayStart = costaRicaDayStartUtc(ymd);
  const dayEnd = costaRicaDayStartUtc(addCalendarDays(ymd, 1));
  const start = Math.max(interval.start.getTime(), dayStart.getTime());
  const end = Math.min(interval.end.getTime(), dayEnd.getTime());
  if (end <= start) {
    return null;
  }
  return {
    startMin: Math.round((start - dayStart.getTime()) / 60000),
    endMin: Math.round((end - dayStart.getTime()) / 60000),
  };
}

export function getCostaRicaDateParts(date: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes) => {
    const value = parts.find((part) => part.type === type)?.value;
    if (!value) {
      throw new Error(`No se pudo leer la parte ${type} de la fecha.`);
    }
    return Number(value);
  };

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
  };
}
