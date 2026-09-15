import { describe, expect, it } from "vitest";

import {
  customerSegment,
  lastVisitAt,
  nextAppointmentAt,
  totalSpentCrc,
  visitCount,
} from "@/lib/crm/metrics";

const day = (iso: string) => new Date(`${iso}Z`);

describe("CRM metrics", () => {
  it("no cuenta dos veces una venta ligada a una cita", () => {
    const total = totalSpentCrc(
      [{ priceCrc: 18000, status: "COMPLETED" }],
      [
        { amountCrc: 18000, appointmentId: "apt-1" },
        { amountCrc: 5000, appointmentId: null },
      ],
    );
    expect(total).toBe(23000);
  });

  it("ignora citas no completadas en el total gastado y la frecuencia", () => {
    const appointments = [
      { priceCrc: 12000, status: "CANCELLED" as const, startsAt: day("2026-09-01T15:00:00") },
      { priceCrc: 14000, status: "COMPLETED" as const, startsAt: day("2026-09-10T15:00:00") },
    ];
    expect(totalSpentCrc(appointments, [])).toBe(14000);
    expect(visitCount(appointments)).toBe(1);
    expect(lastVisitAt(appointments)?.toISOString()).toBe("2026-09-10T15:00:00.000Z");
  });

  it("calcula la próxima cita futura", () => {
    const now = day("2026-09-15T12:00:00");
    const next = nextAppointmentAt(
      [
        { startsAt: day("2026-09-14T15:00:00"), status: "CONFIRMED" },
        { startsAt: day("2026-09-20T15:00:00"), status: "PENDING" },
      ],
      now,
    );
    expect(next?.toISOString()).toBe("2026-09-20T15:00:00.000Z");
  });

  it("clasifica clientes nuevos, recurrentes e inactivos", () => {
    const now = day("2026-09-14T12:00:00");
    expect(customerSegment([], now)).toBe("sin_visitas");
    expect(
      customerSegment(
        [{ startsAt: day("2026-09-01T15:00:00"), status: "COMPLETED" }],
        now,
      ),
    ).toBe("nuevo");
    expect(
      customerSegment(
        [
          { startsAt: day("2026-01-01T15:00:00"), status: "COMPLETED" },
          { startsAt: day("2026-02-01T15:00:00"), status: "COMPLETED" },
        ],
        now,
      ),
    ).toBe("inactivo");
    expect(
      customerSegment(
        [
          { startsAt: day("2026-07-01T15:00:00"), status: "COMPLETED" },
          { startsAt: day("2026-08-20T15:00:00"), status: "COMPLETED" },
        ],
        now,
      ),
    ).toBe("recurrente");
  });
});
