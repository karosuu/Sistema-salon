"use server";

import { revalidatePath } from "next/cache";

import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/constants";
import {
  createBlockedTimeRecord,
  deleteBlockedTimeRecord,
  saveBusinessHoursRecord,
} from "@/lib/data/hours";
import { toPublicErrorMessage } from "@/lib/errors";
import { assertAdminSession } from "@/lib/require-admin";
import { err, ok, type Result } from "@/lib/result";
import {
  blockedTimeInputSchema,
  businessHoursInputSchema,
} from "@/lib/validations/hours";

function revalidateHours() {
  revalidatePath(ADMIN_ROUTES.hours);
  revalidatePath(ADMIN_ROUTES.calendar);
  revalidatePath(PUBLIC_ROUTES.book);
  revalidatePath(PUBLIC_ROUTES.home);
}

export async function saveBusinessHoursAction(
  raw: unknown,
): Promise<Result<void>> {
  await assertAdminSession();
  const parsed = businessHoursInputSchema.safeParse(raw);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Revisá el horario semanal.");
  }

  try {
    const result = await saveBusinessHoursRecord(parsed.data.days);
    if (!result.ok) {
      return result;
    }
    revalidateHours();
    return ok(undefined);
  } catch (error) {
    return err(toPublicErrorMessage(error));
  }
}

export async function createBlockedTimeAction(
  raw: unknown,
): Promise<Result<{ id: string }>> {
  await assertAdminSession();
  const parsed = blockedTimeInputSchema.safeParse(raw);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Revisá el bloqueo.");
  }

  try {
    const result = await createBlockedTimeRecord(parsed.data);
    if (!result.ok) {
      return result;
    }
    revalidateHours();
    return result;
  } catch (error) {
    return err(toPublicErrorMessage(error));
  }
}

export async function deleteBlockedTimeAction(id: unknown): Promise<Result<void>> {
  await assertAdminSession();
  if (typeof id !== "string" || id.length < 1) {
    return err("Identificador inválido.");
  }

  try {
    const result = await deleteBlockedTimeRecord(id);
    if (!result.ok) {
      return result;
    }
    revalidateHours();
    return result;
  } catch (error) {
    return err(toPublicErrorMessage(error));
  }
}
