import { describe, expect, it } from "vitest";

import {
  computeSlotStartMinutes,
  generateReservationCode,
  hhmmToMinutes,
  intervalsOverlap,
  mergeSlotStarts,
  minutesToHhmm,
  pickProfessionalForStart,
} from "@/lib/availability/engine";
import { costaRicaLocalToUtc, weekdayFromYmd } from "@/lib/timezone";

const salon = { opensAt: "09:00", closesAt: "18:00", isClosed: false };
const professional = { startsAt: "09:00", endsAt: "18:00", isOff: false };

describe("availability engine", () => {
  it("respeta la duración del servicio al generar huecos", () => {
    const hour = computeSlotStartMinutes({
      durationMin: 60,
      salon,
      professional,
      busy: [],
    });
    const twoHours = computeSlotStartMinutes({
      durationMin: 120,
      salon,
      professional,
      busy: [],
    });

    expect(hour[0]).toBe(hhmmToMinutes("09:00"));
    expect(hour.at(-1)).toBe(hhmmToMinutes("17:00"));
    expect(twoHours.at(-1)).toBe(hhmmToMinutes("16:00"));
    expect(twoHours.length).toBeLessThan(hour.length);
  });

  it("no genera huecos si el profesional no trabaja", () => {
    const starts = computeSlotStartMinutes({
      durationMin: 60,
      salon,
      professional: { startsAt: "09:00", endsAt: "18:00", isOff: true },
      busy: [],
    });
    expect(starts).toEqual([]);
  });

  it("no genera huecos si el salón está cerrado", () => {
    const starts = computeSlotStartMinutes({
      durationMin: 45,
      salon: { ...salon, isClosed: true },
      professional,
      busy: [],
    });
    expect(starts).toEqual([]);
  });

  it("omite intervalos ocupados y exige espacio completo para la duración", () => {
    const busy = [{ startMin: hhmmToMinutes("10:00"), endMin: hhmmToMinutes("12:00") }];
    const starts = computeSlotStartMinutes({
      durationMin: 120,
      salon,
      professional,
      busy,
    });

    expect(starts).not.toContain(hhmmToMinutes("09:00"));
    expect(starts).not.toContain(hhmmToMinutes("10:00"));
    expect(starts).not.toContain(hhmmToMinutes("10:30"));
    expect(starts).toContain(hhmmToMinutes("12:00"));
  });

  it("intersecta el horario del profesional con el del salón", () => {
    const starts = computeSlotStartMinutes({
      durationMin: 60,
      salon,
      professional: { startsAt: "13:00", endsAt: "16:00", isOff: false },
      busy: [],
    });

    expect(starts[0]).toBe(hhmmToMinutes("13:00"));
    expect(starts.at(-1)).toBe(hhmmToMinutes("15:00"));
  });

  it("respeta bloqueos y la hora actual del día", () => {
    const starts = computeSlotStartMinutes({
      durationMin: 60,
      salon,
      professional,
      busy: [{ startMin: hhmmToMinutes("09:00"), endMin: hhmmToMinutes("11:00") }],
      earliestStartMin: hhmmToMinutes("12:10"),
    });

    expect(starts[0]).toBe(hhmmToMinutes("12:15"));
  });

  it("une horarios de varios profesionales y elige uno determinista", () => {
    const groups = [
      { professionalId: "sofia", starts: [540, 600] },
      { professionalId: "ana", starts: [600, 660] },
    ];

    expect(mergeSlotStarts(groups)).toEqual([540, 600, 660]);
    expect(pickProfessionalForStart(groups, 600)).toBe("ana");
    expect(pickProfessionalForStart(groups, 540)).toBe("sofia");
    expect(pickProfessionalForStart(groups, 700)).toBeNull();
  });

  it("detecta solapes semiabiertos", () => {
    expect(
      intervalsOverlap(
        { startMin: 540, endMin: 600 },
        { startMin: 600, endMin: 660 },
      ),
    ).toBe(false);
    expect(
      intervalsOverlap(
        { startMin: 540, endMin: 601 },
        { startMin: 600, endMin: 660 },
      ),
    ).toBe(true);
  });
});

describe("timezone Costa Rica", () => {
  it("convierte hora local a UTC con offset fijo -06:00", () => {
    const utc = costaRicaLocalToUtc("2026-09-16", "11:00");
    expect(utc.toISOString()).toBe("2026-09-16T17:00:00.000Z");
    expect(weekdayFromYmd("2026-09-16")).toBe("WEDNESDAY");
  });

  it("formatea minutos como HH:mm", () => {
    expect(minutesToHhmm(16 * 60)).toBe("16:00");
  });
});

describe("reservation code", () => {
  it("genera un código legible único por secuencia", () => {
    let i = 0;
    const random = () => {
      const value = (i % 10) / 10;
      i += 1;
      return value;
    };
    expect(generateReservationCode(random)).toMatch(/^PC-[A-Z0-9]{6}$/);
  });
});
