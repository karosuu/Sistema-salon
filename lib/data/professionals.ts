import "server-only";

import type { Weekday } from "@prisma/client";

import { prisma } from "@/lib/db";
import { err, ok, type Result } from "@/lib/result";
import {
  availabilityToDisplayHours,
  defaultProfessionalAvailability,
  type DisplayHours,
} from "@/lib/salon/hours";
import type { ProfessionalInput } from "@/lib/validations/professional";

export type AdminProfessional = {
  id: string;
  name: string;
  bio: string;
  photoUrl: string | null;
  isActive: boolean;
  appointmentCount: number;
  serviceIds: string[];
  services: Array<{ id: string; name: string; isActive: boolean }>;
  availability: Array<{
    weekday: Weekday;
    startsAt: string;
    endsAt: string;
    isOff: boolean;
  }>;
  hours: DisplayHours[];
  updatedAt: Date;
};

function toPhotoUrl(value: string): string | null {
  return value.trim() === "" ? null : value.trim();
}

function toHhmm(value: string): string {
  const trimmed = value.trim();
  return trimmed.length >= 5 ? trimmed.slice(0, 5) : trimmed;
}

function mapProfessional(row: {
  id: string;
  name: string;
  bio: string;
  photoUrl: string | null;
  isActive: boolean;
  updatedAt: Date;
  services: Array<{
    service: { id: string; name: string; isActive: boolean };
  }>;
  availability: Array<{
    weekday: Weekday;
    startsAt: string;
    endsAt: string;
    isOff: boolean;
  }>;
  _count: { appointments: number };
}): AdminProfessional {
  const availability = defaultProfessionalAvailability().map((day) => {
    const existing = row.availability.find((item) => item.weekday === day.weekday);
    return existing ?? { ...day, isOff: true };
  });

  return {
    id: row.id,
    name: row.name,
    bio: row.bio,
    photoUrl: row.photoUrl,
    isActive: row.isActive,
    appointmentCount: row._count.appointments,
    serviceIds: row.services.map((item) => item.service.id),
    services: row.services.map((item) => item.service),
    availability,
    hours: availabilityToDisplayHours(availability),
    updatedAt: row.updatedAt,
  };
}

const professionalInclude = {
  services: {
    select: {
      service: { select: { id: true, name: true, isActive: true } },
    },
  },
  availability: true,
  _count: { select: { appointments: true } },
} as const;

export async function listAdminProfessionals(): Promise<AdminProfessional[]> {
  const rows = await prisma.professional.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    include: professionalInclude,
  });

  return rows.map(mapProfessional);
}

export async function getAdminProfessional(
  id: string,
): Promise<AdminProfessional | null> {
  const row = await prisma.professional.findUnique({
    where: { id },
    include: professionalInclude,
  });

  return row ? mapProfessional(row) : null;
}

async function assertServicesExist(serviceIds: string[]): Promise<Result<void>> {
  const uniqueIds = [...new Set(serviceIds)];
  const count = await prisma.service.count({
    where: { id: { in: uniqueIds } },
  });

  if (count !== uniqueIds.length) {
    return err("Uno o más servicios ya no existen. Recargá la página e intentá de nuevo.");
  }

  return ok(undefined);
}

function availabilityData(input: ProfessionalInput) {
  return input.availability.map((item) => ({
    weekday: item.weekday,
    startsAt: toHhmm(item.startsAt),
    endsAt: toHhmm(item.endsAt),
    isOff: item.isOff,
  }));
}

export async function createProfessionalRecord(
  input: ProfessionalInput,
): Promise<Result<AdminProfessional>> {
  const servicesOk = await assertServicesExist(input.serviceIds);
  if (!servicesOk.ok) {
    return servicesOk;
  }

  const row = await prisma.professional.create({
    data: {
      name: input.name,
      bio: input.bio,
      photoUrl: toPhotoUrl(input.photoUrl),
      isActive: input.isActive,
      services: {
        create: [...new Set(input.serviceIds)].map((serviceId) => ({ serviceId })),
      },
      availability: {
        create: availabilityData(input),
      },
    },
    include: professionalInclude,
  });

  return ok(mapProfessional(row));
}

export async function updateProfessionalRecord(
  id: string,
  input: ProfessionalInput,
): Promise<Result<AdminProfessional>> {
  const existing = await prisma.professional.findUnique({ where: { id } });
  if (!existing) {
    return err("No encontramos a esa persona del equipo.");
  }

  const servicesOk = await assertServicesExist(input.serviceIds);
  if (!servicesOk.ok) {
    return servicesOk;
  }

  const uniqueServiceIds = [...new Set(input.serviceIds)];

  const row = await prisma.$transaction(async (tx) => {
    await tx.professionalService.deleteMany({ where: { professionalId: id } });
    await tx.professionalAvailability.deleteMany({ where: { professionalId: id } });

    return tx.professional.update({
      where: { id },
      data: {
        name: input.name,
        bio: input.bio,
        photoUrl: toPhotoUrl(input.photoUrl),
        isActive: input.isActive,
        services: {
          create: uniqueServiceIds.map((serviceId) => ({ serviceId })),
        },
        availability: {
          create: availabilityData(input),
        },
      },
      include: professionalInclude,
    });
  });

  return ok(mapProfessional(row));
}

export async function setProfessionalActiveRecord(
  id: string,
  isActive: boolean,
): Promise<Result<AdminProfessional>> {
  const existing = await prisma.professional.findUnique({
    where: { id },
    include: professionalInclude,
  });
  if (!existing) {
    return err("No encontramos a esa persona del equipo.");
  }

  const row = await prisma.professional.update({
    where: { id },
    data: { isActive },
    include: professionalInclude,
  });

  return ok(mapProfessional(row));
}

export async function deleteProfessionalIfSafe(
  id: string,
): Promise<Result<{ name: string }>> {
  const existing = await prisma.professional.findUnique({
    where: { id },
    include: { _count: { select: { appointments: true } } },
  });

  if (!existing) {
    return err("No encontramos a esa persona del equipo.");
  }

  if (existing._count.appointments > 0) {
    return err(
      "Esta persona tiene citas históricas. No se puede eliminar; desactivala para ocultarla en la web pública.",
    );
  }

  await prisma.professional.delete({ where: { id } });
  return ok({ name: existing.name });
}
