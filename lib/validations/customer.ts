import { z } from "zod";

import { optionalEmailSchema, phoneSchema } from "@/lib/validations/common";

export const customerInputSchema = z.object({
  name: z.string().trim().min(2, "Ingresá el nombre.").max(120),
  phone: phoneSchema,
  email: optionalEmailSchema,
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
  preferences: z.string().trim().max(2000).optional().or(z.literal("")),
  birthDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Usá una fecha válida.")
    .optional()
    .or(z.literal("")),
});

export const customerIdSchema = z.string().trim().min(1, "Falta el identificador.");

export const saleInputSchema = z.object({
  customerId: z.string().min(1),
  amountCrc: z.number().int().nonnegative("El monto no puede ser negativo."),
  description: z.string().trim().min(2, "Describí la venta.").max(200),
  occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Usá una fecha válida."),
});

export type CustomerInput = z.infer<typeof customerInputSchema>;
export type SaleInput = z.infer<typeof saleInputSchema>;
