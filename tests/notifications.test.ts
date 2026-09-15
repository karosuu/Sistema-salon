import { describe, expect, it } from "vitest";

import { isAppointmentOverlapError } from "@/lib/availability/engine";
import { buildAppointmentEmail, buildAppointmentIcs } from "@/lib/notifications/templates";
import { normalizePhone } from "@/lib/phone";

describe("phone", () => {
  it("normaliza dígitos para evitar duplicados por formato", () => {
    expect(normalizePhone("+506 7000-0001")).toBe("50670000001");
  });
});

describe("overlap errors", () => {
  it("reconoce la exclusión de PostgreSQL", () => {
    expect(isAppointmentOverlapError(new Error("23P01 Appointment_no_professional_overlap"))).toBe(true);
    expect(isAppointmentOverlapError(new Error("otro"))).toBe(false);
  });
});

describe("email templates", () => {
  const payload = {
    salonName: "Pixel-Craft Salón (DEMO)",
    salonAddress: "San José",
    salonPhone: "+506 0000-0000",
    customerName: "María Soto (DEMO)",
    serviceName: "Corte y peinado (DEMO)",
    professionalName: "Ana Vargas (DEMO)",
    startsAt: new Date("2026-09-16T17:00:00.000Z"),
    durationMin: 60,
    priceCrc: 18000,
    code: "PC-TEST01",
  };

  it("incluye los datos de la cita en HTML y texto", () => {
    const email = buildAppointmentEmail("APPOINTMENT_CONFIRMED", payload);
    expect(email.subject).toContain("PC-TEST01");
    expect(email.text).toContain("María Soto (DEMO)");
    expect(email.html).toContain("Corte y peinado (DEMO)");
    expect(email.html).toContain("Ana Vargas (DEMO)");
  });

  it("genera un ICS para agregar al calendario", () => {
    const ics = buildAppointmentIcs(payload, new Date("2026-09-16T18:00:00.000Z"));
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("PC-TEST01");
  });
});
