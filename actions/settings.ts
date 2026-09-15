"use server";

import { revalidatePath } from "next/cache";

import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/constants";
import { updateSalonSettingsRecord } from "@/lib/data";
import { toPublicErrorMessage } from "@/lib/errors";
import { assertAdminSession } from "@/lib/require-admin";
import { err, type Result } from "@/lib/result";
import { salonSettingsSchema } from "@/lib/validations/salon";

function revalidateSalonSurfaces() {
  revalidatePath("/", "layout");
  revalidatePath(ADMIN_ROUTES.settings);
  revalidatePath(PUBLIC_ROUTES.home);
  revalidatePath(PUBLIC_ROUTES.contact);
  revalidatePath(PUBLIC_ROUTES.about);
  revalidatePath(PUBLIC_ROUTES.book);
  revalidatePath(PUBLIC_ROUTES.services);
  revalidatePath(PUBLIC_ROUTES.professionals);
  revalidatePath(PUBLIC_ROUTES.gallery);
}

export async function updateSalonSettingsAction(
  raw: unknown,
): Promise<Result<{ id: string }>> {
  await assertAdminSession();

  const parsed = salonSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Revisá los datos del salón.");
  }

  try {
    const result = await updateSalonSettingsRecord(parsed.data);
    if (!result.ok) {
      return result;
    }
    revalidateSalonSurfaces();
    return result;
  } catch (error) {
    return err(toPublicErrorMessage(error));
  }
}
