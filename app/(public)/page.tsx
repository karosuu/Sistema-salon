import { CtaBand } from "@/components/public/cta-band";
import { CtaPair } from "@/components/public/cta-pair";
import { ProfessionalCard } from "@/components/public/professional-card";
import { SectionHeading } from "@/components/public/section-heading";
import { ServiceCard } from "@/components/public/service-card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PUBLIC_ROUTES } from "@/lib/constants";
import {
  getPublicProfessionals,
  getPublicServices,
  getSalonContent,
} from "@/lib/data";
import { DEMO_COPY } from "@/lib/salon/content";
import { getSalonWhatsAppLink } from "@/lib/whatsapp";

export default async function HomePage() {
  const [salon, services, professionals] = await Promise.all([
    getSalonContent(),
    getPublicServices(),
    getPublicProfessionals(),
  ]);
  const whatsappHref = getSalonWhatsAppLink(salon);
  const featuredServices = services.slice(0, 3);
  const featuredProfessionals = professionals.slice(0, 3);

  return (
    <>
      <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-cyan-deep uppercase">
            {DEMO_COPY.heroEyebrow}
          </p>
          <h1 className="font-display mt-4 max-w-xl text-4xl tracking-tight text-navy sm:text-6xl">
            {DEMO_COPY.heroTitle}
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
            {salon.name}. {DEMO_COPY.heroBody}
          </p>
          <CtaPair whatsappHref={whatsappHref} className="mt-8 flex flex-col gap-3 sm:flex-row" />
        </div>
        <div className="relative">
          <div
            className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-cyan/25 via-violet/15 to-magenta/20"
            aria-hidden
          />
          <div className="overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={DEMO_COPY.heroImage}
              alt={DEMO_COPY.heroImageCaption}
              className="aspect-[4/3] w-full object-cover object-center"
            />
          </div>
          <p className="absolute bottom-4 left-4 rounded-full bg-surface/90 px-4 py-2 text-xs font-semibold tracking-wide text-navy shadow-[var(--shadow-float)]">
            {DEMO_COPY.heroImageCaption}
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {DEMO_COPY.trustItems.map((item) => (
            <div
              key={item.title}
              className="rounded-[var(--radius-lg)] border border-border/80 bg-surface/80 px-5 py-6 shadow-[var(--shadow-card)]"
            >
              <p className="font-display text-xl text-navy">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <SectionHeading
          eyebrow="Catálogo"
          title="Servicios"
          description="Precios en colones y duración de ejemplo. El detalle se edita desde administración."
          action={
            <ButtonLink href={PUBLIC_ROUTES.services} variant="ghost" size="sm">
              Ver todos
            </ButtonLink>
          }
        />
        {featuredServices.length === 0 ? (
          <EmptyState
            title="Servicios por cargar"
            description="Cuando el catálogo esté en la base de datos, se mostrará aquí."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <SectionHeading
          eyebrow="Equipo"
          title="Quién te atiende"
          description="Perfiles DEMO. Solo aparecen profesionales activos y compatibles con cada servicio."
          action={
            <ButtonLink href={PUBLIC_ROUTES.professionals} variant="ghost" size="sm">
              Ver equipo
            </ButtonLink>
          }
        />
        {featuredProfessionals.length === 0 ? (
          <p className="text-sm text-muted">Todavía no hay profesionales activos.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProfessionals.map((professional) => (
              <ProfessionalCard
                key={professional.id}
                professional={professional}
                showHours={false}
              />
            ))}
          </div>
        )}
      </section>

      <CtaBand
        title={DEMO_COPY.ctaBandTitle}
        body={DEMO_COPY.ctaBandBody}
        whatsappHref={whatsappHref}
      />
    </>
  );
}
