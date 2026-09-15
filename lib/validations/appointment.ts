import { z } from "zod";

import { ANY_PROFESSIONAL_ID } from "@/lib/availability/engine";
import { optionalEmailSchema, phoneSchema } from "@/lib/validations/common";

export const publicBookingSchema = z.object({
  serviceId: z.string().min(1, "Seleccioná un servicio."),
  professionalId: z
    .string()
    .min(1, "Seleccioná un profesional.")
    .refine(
      (value) => value === ANY_PROFESSIONAL_ID || value.length > 2,
      "Seleccioná un profesional.",
    ),
  startsAt: z
    .string()
    .min(1, "La fecha y hora de la cita no son válidas.")
    .refine(
      (value) => !Number.isNaN(Date.parse(value)),
      "La fecha y hora de la cita no son válidas.",
    ),
  customerName: z
    .string()
    .trim()
    .min(2, "Ingresá tu nombre.")
    .max(120, "El nombre es demasiado largo."),
  customerPhone: phoneSchema,
  customerEmail: optionalEmailSchema,
  notes: z.string().trim().max(500).optional(),
});

export const slotsQuerySchema = z.object({
  serviceId: z.string().min(1, "Seleccioná un servicio."),
  professionalId: z.string().min(1, "Seleccioná un profesional."),
  ymd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Seleccioná una fecha válida."),
  ignoreAppointmentId: z.string().min(1).optional(),
});

export const appointmentIdSchema = z.string().trim().min(1, "Falta el identificador de la cita.");

export const appointmentStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
  "NO_SHOW",
]);

export const rescheduleSchema = z.object({
  appointmentId: appointmentIdSchema,
  startsAt: z
    .string()
    .min(1, "La fecha y hora no son válidas.")
    .refine((value) => !Number.isNaN(Date.parse(value)), "La fecha y hora no son válidas."),
});

export type PublicBookingInput = z.infer<typeof publicBookingSchema>;
export type SlotsQueryInput = z.infer<typeof slotsQuerySchema>;
