import { z } from "zod";

import { crcPriceSchema, durationMinutesSchema, optionalImageUrlSchema } from "@/lib/validations/common";

export const serviceInputSchema = z.object({
  name: z.string().trim().min(2, "Ingresá el nombre del servicio.").max(120),
  description: z.string().trim().min(10, "Ingresá una descripción.").max(2000),
  priceCrc: crcPriceSchema,
  durationMin: durationMinutesSchema,
  imageUrl: optionalImageUrlSchema,
  isActive: z.boolean(),
});

export const serviceIdSchema = z
  .string()
  .trim()
  .min(1, "Falta el identificador del servicio.");

export type ServiceInput = z.infer<typeof serviceInputSchema>;
