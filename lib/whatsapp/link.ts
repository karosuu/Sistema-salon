const WHATSAPP_HOST = "https://wa.me";

function normalizeWhatsAppNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Genera un enlace wa.me. No envía mensajes automáticos. */
export function buildWhatsAppLink(phone: string, message: string): string {
  const number = normalizeWhatsAppNumber(phone);
  const url = new URL(`${WHATSAPP_HOST}/${number}`);
  url.searchParams.set("text", message);
  return url.toString();
}
