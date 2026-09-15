import { z } from "zod";

import { phoneSchema } from "@/lib/validations/common";

const optionalHttpUrl = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^https?:\/\//i.test(value),
    "Ingresá una URL http(s) o dejá el campo vacío.",
  );

export const salonSettingsSchema = z.object({
  name: z.string().trim().min(2, "Ingresá el nombre del salón.").max(120),
  tagline: z.string().trim().max(200).optional().or(z.literal("")),
  phone: phoneSchema,
  whatsappNumber: z
    .string()
    .trim()
    .min(8, "Ingresá el número de WhatsApp.")
    .refine(
      (value) => value.replace(/\D/g, "").length >= 8,
      "Usá el número con código de país, sin +.",
    ),
  whatsappMessage: z.string().trim().min(5, "Ingresá el mensaje inicial.").max(500),
  email: z.string().trim().email("Ingresá un correo válido.").optional().or(z.literal("")),
  address: z.string().trim().min(5, "Ingresá la dirección.").max(300),
  instagramUrl: optionalHttpUrl,
  facebookUrl: optionalHttpUrl,
  tiktokUrl: optionalHttpUrl,
});

export type SalonSettingsInput = z.infer<typeof salonSettingsSchema>;
