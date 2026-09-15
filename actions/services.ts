"use server";

import { revalidatePath } from "next/cache";

import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/constants";
import {
  createServiceRecord,
  deleteServiceIfSafe,
  setServiceActiveRecord,
  updateServiceRecord,
} from "@/lib/data/services";
import { toPublicErrorMessage } from "@/lib/errors";
import { assertAdminSession } from "@/lib/require-admin";
import { err, ok, type Result } from "@/lib/result";
import {
  serviceIdSchema,
  serviceInputSchema,
} from "@/lib/validations/service";

function revalidateServiceSurfaces() {
  revalidatePath(ADMIN_ROUTES.services);
  revalidatePath(PUBLIC_ROUTES.home);
  revalidatePath(PUBLIC_ROUTES.services);
  revalidatePath(PUBLIC_ROUTES.book);
  revalidatePath(PUBLIC_ROUTES.professionals);
}

function parseServiceId(id: unknown): Result<string> {
  const parsed = serviceIdSchema.safeParse(id);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Identificador inválido.");
  }
  return ok(parsed.data);
}

export async function createServiceAction(raw: unknown): Promise<Result<{ id: string }>> {
  await assertAdminSession();

  const parsed = serviceInputSchema.safeParse(raw);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Revisá los datos del servicio.");
  }

  try {
    const service = await createServiceRecord(parsed.data);
    revalidateServiceSurfaces();
    return ok({ id: service.id });
  } catch (error) {
    return err(toPublicErrorMessage(error));
  }
}

export async function updateServiceAction(
  id: unknown,
  raw: unknown,
): Promise<Result<{ id: string }>> {
  await assertAdminSession();

  const idResult = parseServiceId(id);
  if (!idResult.ok) {
    return idResult;
  }

  const parsed = serviceInputSchema.safeParse(raw);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Revisá los datos del servicio.");
  }

  try {
    const result = await updateServiceRecord(idResult.data, parsed.data);
    if (!result.ok) {
      return result;
    }
    revalidateServiceSurfaces();
    return ok({ id: result.data.id });
  } catch (error) {
    return err(toPublicErrorMessage(error));
  }
}

export async function setServiceActiveAction(
  id: unknown,
  isActive: unknown,
): Promise<Result<{ isActive: boolean }>> {
  await assertAdminSession();

  const idResult = parseServiceId(id);
  if (!idResult.ok) {
    return idResult;
  }

  if (typeof isActive !== "boolean") {
    return err("El estado del servicio no es válido.");
  }

  try {
    const result = await setServiceActiveRecord(idResult.data, isActive);
    if (!result.ok) {
      return result;
    }
    revalidateServiceSurfaces();
    return ok({ isActive: result.data.isActive });
  } catch (error) {
    return err(toPublicErrorMessage(error));
  }
}

export async function deleteServiceAction(id: unknown): Promise<Result<{ name: string }>> {
  await assertAdminSession();

  const idResult = parseServiceId(id);
  if (!idResult.ok) {
    return idResult;
  }

  try {
    const result = await deleteServiceIfSafe(idResult.data);
    if (!result.ok) {
      return result;
    }
    revalidateServiceSurfaces();
    return result;
  } catch (error) {
    return err(toPublicErrorMessage(error));
  }
}
