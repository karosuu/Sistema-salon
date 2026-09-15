import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .min(8, "Ingresá un teléfono válido.")
  .max(20, "El teléfono es demasiado largo.");

export const optionalEmailSchema = z
  .string()
  .trim()
  .email("Ingresá un correo válido.")
  .optional()
  .or(z.literal(""));

export const crcPriceSchema = z
  .number()
  .int("El precio debe ser un número entero en colones.")
  .nonnegative("El precio no puede ser negativo.");

export const durationMinutesSchema = z
  .number()
  .int()
  .min(15, "La duración mínima es de 15 minutos.")
  .max(480, "La duración máxima es de 8 horas.");

export const optionalImageUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      value.startsWith("/") ||
      /^https?:\/\//i.test(value),
    "La imagen debe ser una URL http(s) o una ruta que empiece con /.",
  );

export const hhmmSchema = z
  .string()
  .trim()
  .refine(
    (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value.slice(0, 5)),
    "Usá hora en formato HH:mm.",
  );
