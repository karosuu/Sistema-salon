import "server-only";

import { prisma } from "@/lib/db";
import { err, ok, type Result } from "@/lib/result";
import type { ServiceInput } from "@/lib/validations/service";

export type AdminService = {
  id: string;
  name: string;
  description: string;
  priceCrc: number;
  durationMin: number;
  imageUrl: string | null;
  isActive: boolean;
  appointmentCount: number;
  professionalCount: number;
  updatedAt: Date;
};

function toImageUrl(value: string): string | null {
  return value.trim() === "" ? null : value.trim();
}

export async function listAdminServices(): Promise<AdminService[]> {
  const rows = await prisma.service.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          appointments: true,
          professionals: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    priceCrc: row.priceCrc,
    durationMin: row.durationMin,
    imageUrl: row.imageUrl,
    isActive: row.isActive,
    appointmentCount: row._count.appointments,
    professionalCount: row._count.professionals,
    updatedAt: row.updatedAt,
  }));
}

export async function getAdminService(
  id: string,
): Promise<AdminService | null> {
  const row = await prisma.service.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          appointments: true,
          professionals: true,
        },
      },
    },
  });

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceCrc: row.priceCrc,
    durationMin: row.durationMin,
    imageUrl: row.imageUrl,
    isActive: row.isActive,
    appointmentCount: row._count.appointments,
    professionalCount: row._count.professionals,
    updatedAt: row.updatedAt,
  };
}

export async function createServiceRecord(input: ServiceInput): Promise<AdminService> {
  const row = await prisma.service.create({
    data: {
      name: input.name,
      description: input.description,
      priceCrc: input.priceCrc,
      durationMin: input.durationMin,
      imageUrl: toImageUrl(input.imageUrl),
      isActive: input.isActive,
    },
    include: {
      _count: {
        select: { appointments: true, professionals: true },
      },
    },
  });

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceCrc: row.priceCrc,
    durationMin: row.durationMin,
    imageUrl: row.imageUrl,
    isActive: row.isActive,
    appointmentCount: row._count.appointments,
    professionalCount: row._count.professionals,
    updatedAt: row.updatedAt,
  };
}

export async function updateServiceRecord(
  id: string,
  input: ServiceInput,
): Promise<Result<AdminService>> {
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) {
    return err("No encontramos ese servicio.");
  }

  const row = await prisma.service.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      priceCrc: input.priceCrc,
      durationMin: input.durationMin,
      imageUrl: toImageUrl(input.imageUrl),
      isActive: input.isActive,
    },
    include: {
      _count: {
        select: { appointments: true, professionals: true },
      },
    },
  });

  return ok({
    id: row.id,
    name: row.name,
    description: row.description,
    priceCrc: row.priceCrc,
    durationMin: row.durationMin,
    imageUrl: row.imageUrl,
    isActive: row.isActive,
    appointmentCount: row._count.appointments,
    professionalCount: row._count.professionals,
    updatedAt: row.updatedAt,
  });
}

export async function setServiceActiveRecord(
  id: string,
  isActive: boolean,
): Promise<Result<AdminService>> {
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) {
    return err("No encontramos ese servicio.");
  }

  const row = await prisma.service.update({
    where: { id },
    data: { isActive },
    include: {
      _count: {
        select: { appointments: true, professionals: true },
      },
    },
  });

  return ok({
    id: row.id,
    name: row.name,
    description: row.description,
    priceCrc: row.priceCrc,
    durationMin: row.durationMin,
    imageUrl: row.imageUrl,
    isActive: row.isActive,
    appointmentCount: row._count.appointments,
    professionalCount: row._count.professionals,
    updatedAt: row.updatedAt,
  });
}

/**
 * Solo borra si no hay citas. Si hay historial, hay que desactivar.
 * Las asignaciones a profesionales se limpian antes del delete.
 */
export async function deleteServiceIfSafe(id: string): Promise<Result<{ name: string }>> {
  const existing = await prisma.service.findUnique({
    where: { id },
    include: {
      _count: { select: { appointments: true } },
    },
  });

  if (!existing) {
    return err("No encontramos ese servicio.");
  }

  if (existing._count.appointments > 0) {
    return err(
      "Este servicio tiene citas históricas. No se puede eliminar; desactivalo para ocultarlo en la web pública.",
    );
  }

  await prisma.$transaction([
    prisma.professionalService.deleteMany({ where: { serviceId: id } }),
    prisma.service.delete({ where: { id } }),
  ]);

  return ok({ name: existing.name });
}
