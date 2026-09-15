import { ButtonLink } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/lib/constants";

type CtaPairProps = {
  whatsappHref: string;
  className?: string;
};

export function CtaPair({ whatsappHref, className }: CtaPairProps) {
  return (
    <div className={className ?? "mt-8 flex flex-col gap-3 sm:flex-row"}>
      <ButtonLink href={PUBLIC_ROUTES.book} size="lg">
        Reservar cita
      </ButtonLink>
      <ButtonLink href={whatsappHref} variant="whatsapp" size="lg" target="_blank">
        WhatsApp
      </ButtonLink>
    </div>
  );
}
