import { z } from "zod";

import { hhmmSchema } from "@/lib/validations/common";

const WEEKDAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const daySchema = z
  .object({
    weekday: z.enum(WEEKDAYS),
    isClosed: z.boolean(),
    opensAt: z.string(),
    closesAt: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.isClosed) {
      return;
    }
    const opensAt = value.opensAt.trim().slice(0, 5);
    const closesAt = value.closesAt.trim().slice(0, 5);
    if (!hhmmSchema.safeParse(opensAt).success) {
      ctx.addIssue({ code: "custom", path: ["opensAt"], message: "Hora de apertura inválida." });
    }
    if (!hhmmSchema.safeParse(closesAt).success) {
      ctx.addIssue({ code: "custom", path: ["closesAt"], message: "Hora de cierre inválida." });
    }
    if (opensAt >= closesAt) {
      ctx.addIssue({
        code: "custom",
        path: ["closesAt"],
        message: "El cierre debe ser posterior a la apertura.",
      });
    }
  });

export const businessHoursInputSchema = z.object({
  days: z.array(daySchema).length(7, "Definí los 7 días."),
});

export const blockedTimeInputSchema = z
  .object({
    professionalId: z.string().optional().or(z.literal("")),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    reason: z.string().trim().max(200).optional().or(z.literal("")),
    isHoliday: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.endsAt <= value.startsAt) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "El fin del bloqueo debe ser posterior al inicio.",
      });
    }
  });

export type BusinessHoursInput = z.infer<typeof businessHoursInputSchema>;
export type BlockedTimeInput = z.infer<typeof blockedTimeInputSchema>;
