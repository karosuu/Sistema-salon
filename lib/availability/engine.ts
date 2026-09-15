export const SLOT_STEP_MIN = 15;
export const BOOKING_HORIZON_DAYS = 60;
export const ANY_PROFESSIONAL_ID = "any";

export const SLOT_BLOCKING_STATUSES = ["PENDING", "CONFIRMED"] as const;

export type TimeWindow = {
  startMin: number;
  endMin: number;
};

export type DayHours = {
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
};

export type ProfessionalDayHours = {
  startsAt: string;
  endsAt: string;
  isOff: boolean;
};

export type SlotEngineInput = {
  durationMin: number;
  stepMin?: number;
  salon: DayHours | null;
  professional: ProfessionalDayHours | null;
  busy: TimeWindow[];
  /** Minutos desde medianoche (hora local) a partir de los cuales sí se puede reservar. */
  earliestStartMin?: number;
};

export function hhmmToMinutes(value: string): number {
  const [hoursRaw, minutesRaw] = value.trim().slice(0, 5).split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return 0;
  }
  return hours * 60 + minutes;
}

export function minutesToHhmm(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function intervalsOverlap(a: TimeWindow, b: TimeWindow): boolean {
  return a.startMin < b.endMin && b.startMin < a.endMin;
}

export function intervalFitsDuration(
  startMin: number,
  durationMin: number,
  busy: TimeWindow[],
  windowEndMin: number,
): boolean {
  const candidate = { startMin, endMin: startMin + durationMin };
  if (candidate.endMin > windowEndMin) {
    return false;
  }
  return !busy.some((block) => intervalsOverlap(candidate, block));
}

export function toWindowFromHours(hours: DayHours): TimeWindow | null {
  if (hours.isClosed) {
    return null;
  }
  const startMin = hhmmToMinutes(hours.opensAt);
  const endMin = hhmmToMinutes(hours.closesAt);
  if (endMin <= startMin) {
    return null;
  }
  return { startMin, endMin };
}

export function toWindowFromProfessional(
  hours: ProfessionalDayHours,
): TimeWindow | null {
  if (hours.isOff) {
    return null;
  }
  const startMin = hhmmToMinutes(hours.startsAt);
  const endMin = hhmmToMinutes(hours.endsAt);
  if (endMin <= startMin) {
    return null;
  }
  return { startMin, endMin };
}

export function intersectWindows(
  a: TimeWindow | null,
  b: TimeWindow | null,
): TimeWindow | null {
  if (!a || !b) {
    return null;
  }
  const startMin = Math.max(a.startMin, b.startMin);
  const endMin = Math.min(a.endMin, b.endMin);
  if (endMin <= startMin) {
    return null;
  }
  return { startMin, endMin };
}

export function subtractBusy(window: TimeWindow, busy: TimeWindow[]): TimeWindow[] {
  const clipped = busy
    .filter((block) => intervalsOverlap(window, block))
    .map((block) => ({
      startMin: Math.max(block.startMin, window.startMin),
      endMin: Math.min(block.endMin, window.endMin),
    }))
    .sort((left, right) => left.startMin - right.startMin);

  const free: TimeWindow[] = [];
  let cursor = window.startMin;

  for (const block of clipped) {
    if (block.startMin > cursor) {
      free.push({ startMin: cursor, endMin: block.startMin });
    }
    cursor = Math.max(cursor, block.endMin);
  }

  if (cursor < window.endMin) {
    free.push({ startMin: cursor, endMin: window.endMin });
  }

  return free;
}

export function computeSlotStartMinutes(input: SlotEngineInput): number[] {
  const stepMin = input.stepMin ?? SLOT_STEP_MIN;
  const durationMin = input.durationMin;
  if (durationMin <= 0) {
    return [];
  }

  const window = intersectWindows(
    input.salon ? toWindowFromHours(input.salon) : null,
    input.professional ? toWindowFromProfessional(input.professional) : null,
  );

  if (!window) {
    return [];
  }

  const earliest = input.earliestStartMin ?? 0;
  const free = subtractBusy(window, input.busy);
  const starts: number[] = [];

  for (const fragment of free) {
    const first = Math.max(fragment.startMin, earliest);
    const aligned = Math.ceil(first / stepMin) * stepMin;
    for (let start = aligned; start + durationMin <= fragment.endMin; start += stepMin) {
      if (intervalFitsDuration(start, durationMin, input.busy, window.endMin)) {
        starts.push(start);
      }
    }
  }

  return starts;
}

export function mergeSlotStarts(
  groups: Array<{ professionalId: string; starts: number[] }>,
): number[] {
  const unique = new Set<number>();
  for (const group of groups) {
    for (const start of group.starts) {
      unique.add(start);
    }
  }
  return [...unique].sort((a, b) => a - b);
}

export function pickProfessionalForStart(
  groups: Array<{ professionalId: string; starts: number[] }>,
  startMin: number,
): string | null {
  const available = groups
    .filter((group) => group.starts.includes(startMin))
    .map((group) => group.professionalId)
    .sort((a, b) => a.localeCompare(b));
  return available[0] ?? null;
}

export function isAppointmentOverlapError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("23P01") ||
    message.includes("Appointment_no_professional_overlap") ||
    (typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002")
  );
}

export function generateReservationCode(random: () => number = Math.random): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let body = "";
  for (let i = 0; i < 6; i += 1) {
    const index = Math.floor(random() * alphabet.length) % alphabet.length;
    body += alphabet[index] ?? "A";
  }
  return `PC-${body}`;
}
