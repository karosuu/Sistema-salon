import { HoursList } from "@/components/public/hours-list";
import { SocialLinks } from "@/components/public/social-links";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PUBLIC_ROUTES } from "@/lib/constants";
import { getDisplayHours, getSalonContent } from "@/lib/data";
import { DEMO_COPY } from "@/lib/salon/content";
import { pageMetadata } from "@/lib/seo";
import { getSalonWhatsAppLink } from "@/lib/whatsapp";

export async function generateMetadata() {
  return pageMetadata(
    "Contacto",
    "Teléfono, WhatsApp, dirección y horario de demostración del salón.",
  );
}

export default async function ContactPage() {
  const [salon, hours] = await Promise.all([
    getSalonContent(),
    getDisplayHours(),
  ]);
  const whatsappHref = getSalonWhatsAppLink(salon);

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Contacto"
        title="Hablemos"
        description="Datos de demostración. Se actualizan desde la configuración del salón, no están copiados en cada página."
      />
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-5">
        <div className="relative overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] lg:col-span-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={DEMO_COPY.heroImage}
            alt={DEMO_COPY.heroImageCaption}
            className="h-56 w-full object-cover lg:h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
          <p className="absolute bottom-5 left-5 right-5 font-display text-2xl text-white">
            {salon.name}
          </p>
        </div>
        <Card className="lg:col-span-3">
          <h2 className="font-display text-2xl text-navy">Datos del salón</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold tracking-wide text-cyan-deep uppercase">
                Teléfono
              </dt>
              <dd className="mt-1 text-sm text-navy">{salon.phone}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-cyan-deep uppercase">
                Dirección
              </dt>
              <dd className="mt-1 text-sm text-navy">{salon.address}</dd>
            </div>
            {salon.email ? (
              <div>
                <dt className="text-xs font-semibold tracking-wide text-cyan-deep uppercase">
                  Correo
                </dt>
                <dd className="mt-1 text-sm text-navy">{salon.email}</dd>
              </div>
            ) : null}
          </dl>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={PUBLIC_ROUTES.book}>Reservar cita</ButtonLink>
            <ButtonLink href={whatsappHref} variant="whatsapp" target="_blank">
              WhatsApp
            </ButtonLink>
          </div>
        </Card>
        <Card className="lg:col-span-3">
          <h2 className="font-display text-2xl text-navy">Horario</h2>
          <div className="mt-4">
            <HoursList hours={hours} />
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="font-display text-2xl text-navy">Redes</h2>
          <p className="mt-2 text-sm text-muted">Enlaces DEMO. No hay automatización.</p>
          <div className="mt-4">
            <SocialLinks salon={salon} />
          </div>
        </Card>
      </div>
    </div>
  );
}
