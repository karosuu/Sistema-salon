import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { HoursList } from "@/components/public/hours-list";
import { SocialLinks } from "@/components/public/social-links";
import { PUBLIC_NAV, PUBLIC_ROUTES } from "@/lib/constants";
import { getSalonWhatsAppLink } from "@/lib/whatsapp";
import type { SalonContent } from "@/lib/salon";
import type { DisplayHours } from "@/lib/salon/hours";

type SiteFooterProps = {
  salon: SalonContent;
  hours: DisplayHours[];
};

export function SiteFooter({ salon, hours }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const whatsappHref = getSalonWhatsAppLink(salon);

  return (
    <footer className="mt-auto border-t border-border bg-surface/70">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 text-sm font-semibold text-navy">{salon.name}</p>
          <p className="mt-1 text-sm text-muted">{salon.tagline}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-navy">Contacto</p>
          <p className="mt-2 text-sm text-muted">{salon.phone}</p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block text-sm text-muted hover:text-navy"
          >
            WhatsApp
          </a>
          <p className="mt-1 text-sm text-muted">{salon.address}</p>
          {salon.email ? (
            <p className="mt-1 text-sm text-muted">{salon.email}</p>
          ) : null}
        </div>

        <div>
          <p className="text-sm font-semibold text-navy">Horario</p>
          <div className="mt-2">
            <HoursList hours={hours} />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-navy">Redes</p>
          <div className="mt-2">
            <SocialLinks salon={salon} />
          </div>
          <nav className="mt-6 flex flex-col gap-2 text-sm text-muted">
            {PUBLIC_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-navy">
                {item.label}
              </Link>
            ))}
            <Link href={PUBLIC_ROUTES.book} className="hover:text-navy">
              Reservar cita
            </Link>
          </nav>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {year} {salon.name}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
