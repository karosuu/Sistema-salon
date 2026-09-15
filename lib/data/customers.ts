import "server-only";

import type { AppointmentStatus } from "@prisma/client";

import {
  customerSegment,
  lastVisitAt,
  nextAppointmentAt,
  segmentLabel,
  totalSpentCrc,
  visitCount,
  type CustomerSegment,
} from "@/lib/crm/metrics";
import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";
import { err, ok, type Result } from "@/lib/result";
import type { CustomerInput } from "@/lib/validations/customer";

export type CustomerSale = {
  id: string;
  amountCrc: number;
  description: string;
  occurredAt: Date;
  appointmentId: string | null;
};

export type CustomerAppointment = {
  id: string;
  code: string;
  status: AppointmentStatus;
  startsAt: Date;
  endsAt: Date;
  priceCrc: number;
  durationMin: number;
  serviceName: string;
  professionalName: string;
};

export type AdminCustomerListItem = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  createdAt: Date;
  visitCount: number;
  lastVisitAt: Date | null;
  nextAppointmentAt: Date | null;
  totalSpentCrc: number;
  segment: CustomerSegment;
  segmentLabel: string;
};

export type AdminCustomerDetail = AdminCustomerListItem & {
  notes: string | null;
  preferences: string | null;
  birthDate: Date | null;
  appointments: CustomerAppointment[];
  sales: CustomerSale[];
  servicesHistory: Array<{ name: string; count: number }>;
};

function metricsFrom(
  appointments: Array<{
    startsAt: Date;
    status: AppointmentStatus;
    priceCrc: number;
  }>,
  sales: Array<{ amountCrc: number; appointmentId: string | null }>,
  now: Date,
) {
  const segment = customerSegment(appointments, now);
  return {
    visitCount: visitCount(appointments),
    lastVisitAt: lastVisitAt(appointments),
    nextAppointmentAt: nextAppointmentAt(appointments, now),
    totalSpentCrc: totalSpentCrc(appointments, sales),
    segment,
    segmentLabel: segmentLabel(segment),
  };
}

export async function listAdminCustomers(query?: string): Promise<AdminCustomerListItem[]> {
  const now = new Date();
  const term = query?.trim();
  const rows = await prisma.customer.findMany({
    ...(term
      ? {
          where: {
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              { phone: { contains: term.replace(/\D/g, "") } },
              { email: { contains: term, mode: "insensitive" } },
            ],
          },
        }
      : {}),
    include: {
      appointments: {
        select: { startsAt: true, status: true, priceCrc: true },
      },
      sales: {
        select: { amountCrc: true, appointmentId: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    createdAt: row.createdAt,
    ...metricsFrom(row.appointments, row.sales, now),
  }));
}

export async function getAdminCustomer(id: string): Promise<AdminCustomerDetail | null> {
  const now = new Date();
  const row = await prisma.customer.findUnique({
    where: { id },
    include: {
      appointments: {
        include: {
          service: { select: { name: true } },
          professional: { select: { name: true } },
        },
        orderBy: { startsAt: "desc" },
      },
      sales: { orderBy: { occurredAt: "desc" } },
    },
  });

  if (!row) {
    return null;
  }

  const serviceCounts = new Map<string, number>();
  for (const appointment of row.appointments) {
    const current = serviceCounts.get(appointment.service.name) ?? 0;
    serviceCounts.set(appointment.service.name, current + 1);
  }

  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    notes: row.notes,
    preferences: row.preferences,
    birthDate: row.birthDate,
    createdAt: row.createdAt,
    appointments: row.appointments.map((item) => ({
      id: item.id,
      code: item.code,
      status: item.status,
      startsAt: item.startsAt,
      endsAt: item.endsAt,
      priceCrc: item.priceCrc,
      durationMin: item.durationMin,
      serviceName: item.service.name,
      professionalName: item.professional.name,
    })),
    sales: row.sales.map((item) => ({
      id: item.id,
      amountCrc: item.amountCrc,
      description: item.description,
      occurredAt: item.occurredAt,
      appointmentId: item.appointmentId,
    })),
    servicesHistory: [...serviceCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    ...metricsFrom(row.appointments, row.sales, now),
  };
}

export async function upsertCustomerRecord(
  input: CustomerInput,
  id?: string,
): Promise<Result<{ id: string }>> {
  const phone = normalizePhone(input.phone);
  const email = input.email?.trim() ? input.email.trim() : null;

  const duplicatePhone = await prisma.customer.findFirst({
    where: { phone, ...(id ? { id: { not: id } } : {}) },
    select: { id: true },
  });
  if (duplicatePhone) {
    return err("Ya existe un cliente con ese teléfono.");
  }

  const data = {
    name: input.name.trim(),
    phone,
    email,
    notes: input.notes?.trim() ? input.notes.trim() : null,
    preferences: input.preferences?.trim() ? input.preferences.trim() : null,
    birthDate: input.birthDate ? new Date(`${input.birthDate}T12:00:00-06:00`) : null,
  };

  if (id) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return err("No encontramos a esa persona.");
    }
    await prisma.customer.update({
      where: { id },
      data: {
        ...data,
        notes: data.notes ?? existing.notes,
        preferences: data.preferences ?? existing.preferences,
        birthDate: input.birthDate === undefined ? existing.birthDate : data.birthDate,
      },
    });
    return ok({ id });
  }

  const created = await prisma.customer.create({ data });
  return ok({ id: created.id });
}

export async function createSaleRecord(input: {
  customerId: string;
  amountCrc: number;
  description: string;
  occurredAt: Date;
}): Promise<Result<{ id: string }>> {
  const customer = await prisma.customer.findUnique({
    where: { id: input.customerId },
    select: { id: true },
  });
  if (!customer) {
    return err("No encontramos a esa persona.");
  }

  const sale = await prisma.sale.create({
    data: {
      customerId: input.customerId,
      amountCrc: input.amountCrc,
      description: input.description.trim(),
      occurredAt: input.occurredAt,
    },
  });

  return ok({ id: sale.id });
}
