import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ServiceMedia } from "@/components/public/service-media";
import { PUBLIC_ROUTES } from "@/lib/constants";
import { formatCrc, formatDuration } from "@/lib/money";
import type { PublicService } from "@/lib/data/catalog";

type ServiceCardProps = {
  service: PublicService;
  bookHref?: string;
};

export function ServiceCard({ service, bookHref }: ServiceCardProps) {
  const href = bookHref ?? `${PUBLIC_ROUTES.book}?servicio=${service.id}`;

  return (
    <Card className="group flex h-full flex-col overflow-hidden p-0 transition-shadow duration-300 hover:shadow-[var(--shadow-float)]">
      <ServiceMedia name={service.name} imageUrl={service.imageUrl} />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-2xl text-navy">{service.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
          {service.description}
        </p>
        <p className="mt-4 text-sm font-semibold text-navy">
          {formatCrc(service.priceCrc)} · {formatDuration(service.durationMin)}
        </p>
        <ButtonLink href={href} className="mt-5 w-full sm:w-auto">
          Reservar
        </ButtonLink>
      </div>
    </Card>
  );
}
