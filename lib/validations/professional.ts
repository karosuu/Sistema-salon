import { z } from "zod";

import { hhmmSchema, optionalImageUrlSchema } from "@/lib/validations/common";

const WEEKDAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const weekdaySchema = z.enum(WEEKDAYS);

export const professionalAvailabilitySchema = z
  .object({
    weekday: weekdaySchema,
    isOff: z.boolean(),
    startsAt: z.string(),
    endsAt: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.isOff) {
      return;
    }

    const startsAt = value.startsAt.trim().slice(0, 5);
    const endsAt = value.endsAt.trim().slice(0, 5);
    const startOk = hhmmSchema.safeParse(startsAt).success;
    const endOk = hhmmSchema.safeParse(endsAt).success;

    if (!startOk) {
      ctx.addIssue({
        code: "custom",
        path: ["startsAt"],
        message: "Usá hora de inicio en formato HH:mm.",
      });
    }
    if (!endOk) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "Usá hora de fin en formato HH:mm.",
      });
    }
    if (startOk && endOk && startsAt >= endsAt) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "La hora de salida debe ser posterior a la de entrada.",
      });
    }
  });

export const professionalInputSchema = z
  .object({
    name: z.string().trim().min(2, "Ingresá el nombre del profesional.").max(120),
    bio: z.string().trim().min(10, "Ingresá una biografía.").max(2000),
    photoUrl: optionalImageUrlSchema,
    isActive: z.boolean(),
    serviceIds: z.array(z.string().min(1)).min(1, "Asigná al menos un servicio."),
    availability: z
      .array(professionalAvailabilitySchema)
      .length(7, "Definí la disponibilidad de los 7 días."),
  })
  .superRefine((value, ctx) => {
    const weekdays = new Set(value.availability.map((item) => item.weekday));
    if (weekdays.size !== 7) {
      ctx.addIssue({
        code: "custom",
        path: ["availability"],
        message: "La disponibilidad debe cubrir cada día de la semana una sola vez.",
      });
    }
    if (!value.availability.some((item) => !item.isOff)) {
      ctx.addIssue({
        code: "custom",
        path: ["availability"],
        message: "El profesional debe trabajar al menos un día.",
      });
    }
  });

export const professionalIdSchema = z
  .string()
  .trim()
  .min(1, "Falta el identificador del profesional.");

export type ProfessionalInput = z.infer<typeof professionalInputSchema>;
export type ProfessionalAvailabilityInput = z.infer<
  typeof professionalAvailabilitySchema
>;
