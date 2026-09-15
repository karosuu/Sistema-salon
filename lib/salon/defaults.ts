import { BUSINESS_CURRENCY, BUSINESS_TIMEZONE } from "@/lib/constants";

/**
 * Contenido de demostración. No representa un salón real.
 * En etapas posteriores se leerá desde SalonSettings en la base de datos.
 */
export const DEMO_SALON = {
  name: "Pixel-Craft Salón (DEMO)",
  tagline: "Belleza y bienestar en Costa Rica",
  phone: "+506 0000-0000",
  whatsappNumber: "50600000000",
  whatsappMessage:
    "Hola, quisiera obtener información sobre los servicios y citas.",
  email: "demo@pixel-craft.example",
  address: "Dirección de demostración, San José, Costa Rica",
  instagramUrl: "https://instagram.com/",
  facebookUrl: "https://facebook.com/",
  tiktokUrl: null,
  timezone: BUSINESS_TIMEZONE,
  currency: BUSINESS_CURRENCY,
} as const;

export type SalonContent = {
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
};
