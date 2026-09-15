import { buildWhatsAppLink } from "@/lib/whatsapp/link";
import { whatsappChannel } from "@/lib/whatsapp/provider";
import type { SalonContent } from "@/lib/salon";

export function getSalonWhatsAppLink(salon: SalonContent): string {
  return buildWhatsAppLink(salon.whatsappNumber, salon.whatsappMessage);
}

export { buildWhatsAppLink, whatsappChannel };
export type { NotificationChannel, NotificationEvent } from "@/lib/whatsapp/provider";
