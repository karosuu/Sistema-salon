import "server-only";

import { BUSINESS_CURRENCY, BUSINESS_TIMEZONE } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { DEMO_SALON, type SalonContent } from "@/lib/salon/defaults";
import { ok, type Result } from "@/lib/result";
import type { SalonSettingsInput } from "@/lib/validations/salon";

function toSalonContent(row: {
  name: string;
  tagline: string | null;
  phone: string;
  whatsappNumber: string;
  whatsappMessage: string;
  email: string | null;
  address: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  timezone: string;
  currency: string;
}): SalonContent {
  return {
    name: row.name,
    tagline: row.tagline,
    phone: row.phone,
    whatsappNumber: row.whatsappNumber,
    whatsappMessage: row.whatsappMessage,
    email: row.email,
    address: row.address,
    instagramUrl: row.instagramUrl,
    facebookUrl: row.facebookUrl,
    tiktokUrl: row.tiktokUrl,
    timezone: row.timezone,
    currency: row.currency,
  };
}

/**
 * Lee SalonSettings. Si la base no está disponible, usa placeholders DEMO.
 */
export async function getSalonContent(): Promise<SalonContent> {
  try {
    const settings = await prisma.salonSettings.findUnique({
      where: { id: "default" },
    });

    if (settings) {
      return toSalonContent(settings);
    }
  } catch {
    // Sin PostgreSQL o sin migraciones: la web pública sigue compilando.
  }

  return {
    ...DEMO_SALON,
    tagline: DEMO_SALON.tagline,
    email: DEMO_SALON.email,
    tiktokUrl: DEMO_SALON.tiktokUrl,
  };
}

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

export async function updateSalonSettingsRecord(
  input: SalonSettingsInput,
): Promise<Result<{ id: string }>> {
  const data = {
    name: input.name.trim(),
    tagline: emptyToNull(input.tagline),
    phone: input.phone.trim(),
    whatsappNumber: input.whatsappNumber.replace(/\D/g, ""),
    whatsappMessage: input.whatsappMessage.trim(),
    email: emptyToNull(input.email),
    address: input.address.trim(),
    instagramUrl: emptyToNull(input.instagramUrl),
    facebookUrl: emptyToNull(input.facebookUrl),
    tiktokUrl: emptyToNull(input.tiktokUrl),
    timezone: BUSINESS_TIMEZONE,
    currency: BUSINESS_CURRENCY,
  };

  await prisma.salonSettings.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });

  return ok({ id: "default" });
}
