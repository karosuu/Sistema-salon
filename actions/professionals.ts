"use server";

import { revalidatePath } from "next/cache";

import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/constants";
import {
  createProfessionalRecord,
  deleteProfessionalIfSafe,
  setProfessionalActiveRecord,
  updateProfessionalRecord,
} from "@/lib/data/professionals";
import { toPublicErrorMessage } from "@/lib/errors";
import { assertAdminSession } from "@/lib/require-admin";
import { err, ok, type Result } from "@/lib/result";
import {
  professionalIdSchema,
  professionalInputSchema,
} from "@/lib/validations/professional";

function revalidateProfessionalSurfaces() {
  revalidatePath(ADMIN_ROUTES.professionals);
  revalidatePath(PUBLIC_ROUTES.home);
  revalidatePath(PUBLIC_ROUTES.professionals);
  revalidatePath(PUBLIC_ROUTES.book);
}

function parseProfessionalId(id: unknown): Result<string> {
  const parsed = professionalIdSchema.safeParse(id);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Identificador inválido.");
  }
  return ok(parsed.data);
}

export async function createProfessionalAction(
  raw: unknown,
): Promise<Result<{ id: string }>> {
  await assertAdminSession();

  const parsed = professionalInputSchema.safeParse(raw);
  if (!parsed.success) {
    return err(
      parsed.error.issues[0]?.message ?? "Revisá los datos del profesional.",
    );
  }

  try {
    const result = await createProfessionalRecord(parsed.data);
    if (!result.ok) {
      return result;
    }
    revalidateProfessionalSurfaces();
    return ok({ id: result.data.id });
  } catch (error) {
    return err(toPublicErrorMessage(error));
  }
}

export async function updateProfessionalAction(
  id: unknown,
  raw: unknown,
): Promise<Result<{ id: string }>> {
  await assertAdminSession();

  const idResult = parseProfessionalId(id);
  if (!idResult.ok) {
    return idResult;
  }

  const parsed = professionalInputSchema.safeParse(raw);
  if (!parsed.success) {
    return err(
      parsed.error.issues[0]?.message ?? "Revisá los datos del profesional.",
    );
  }

  try {
    const result = await updateProfessionalRecord(idResult.data, parsed.data);
    if (!result.ok) {
      return result;
    }
    revalidateProfessionalSurfaces();
    return ok({ id: result.data.id });
  } catch (error) {
    return err(toPublicErrorMessage(error));
  }
}

export async function setProfessionalActiveAction(
  id: unknown,
  isActive: unknown,
): Promise<Result<{ isActive: boolean }>> {
  await assertAdminSession();

  const idResult = parseProfessionalId(id);
  if (!idResult.ok) {
    return idResult;
  }

  if (typeof isActive !== "boolean") {
    return err("El estado del profesional no es válido.");
  }

  try {
    const result = await setProfessionalActiveRecord(idResult.data, isActive);
    if (!result.ok) {
      return result;
    }
    revalidateProfessionalSurfaces();
    return ok({ isActive: result.data.isActive });
  } catch (error) {
    return err(toPublicErrorMessage(error));
  }
}

export async function deleteProfessionalAction(
  id: unknown,
): Promise<Result<{ name: string }>> {
  await assertAdminSession();

  const idResult = parseProfessionalId(id);
  if (!idResult.ok) {
    return idResult;
  }

  try {
    const result = await deleteProfessionalIfSafe(idResult.data);
    if (!result.ok) {
      return result;
    }
    revalidateProfessionalSurfaces();
    return result;
  } catch (error) {
    return err(toPublicErrorMessage(error));
  }
}
