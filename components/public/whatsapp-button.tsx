import { ButtonLink } from "@/components/ui/button";
import { getSalonWhatsAppLink } from "@/lib/whatsapp";
import type { SalonContent } from "@/lib/salon";

type WhatsAppButtonProps = {
  salon: SalonContent;
};

export function WhatsAppButton({ salon }: WhatsAppButtonProps) {
  const href = getSalonWhatsAppLink(salon);

  return (
    <ButtonLink
      href={href}
      variant="whatsapp"
      className="fixed right-4 bottom-4 z-50 min-w-11 px-4 shadow-[var(--shadow-float)] max-sm:bottom-5"
      target="_blank"
    >
      WhatsApp
    </ButtonLink>
  );
}
