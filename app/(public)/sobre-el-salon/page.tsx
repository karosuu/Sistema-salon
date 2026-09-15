import { HoursList } from "@/components/public/hours-list";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getDisplayHours, getSalonContent } from "@/lib/data";
import { DEMO_COPY } from "@/lib/salon/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata(
    "Sobre el salón",
    DEMO_COPY.aboutParagraphs[0] ?? DEMO_COPY.seoDescription,
  );
}

export default async function AboutPage() {
  const [salon, hours] = await Promise.all([
    getSalonContent(),
    getDisplayHours(),
  ]);

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow={DEMO_COPY.aboutEyebrow}
        title={DEMO_COPY.aboutTitle}
        description={salon.name}
      />
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={DEMO_COPY.heroImage}
              alt={DEMO_COPY.heroImageCaption}
              className="aspect-[16/9] w-full object-cover object-center"
            />
          </div>
          <div className="space-y-4">
            {DEMO_COPY.aboutParagraphs.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed text-muted sm:text-lg">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {DEMO_COPY.aboutValues.map((value) => (
              <Card key={value.title} className="p-5">
                <h2 className="font-display text-xl text-navy">{value.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{value.text}</p>
              </Card>
            ))}
          </div>
        </div>
        <Card className="h-fit">
          <h2 className="font-display text-xl text-navy">Ubicación DEMO</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{salon.address}</p>
          <div className="mt-5 overflow-hidden rounded-[var(--radius-md)] bg-cream-deep">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/demo/galeria/detalle.png"
              alt="Detalle DEMO del espacio"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <p className="mt-2 text-xs text-muted">Mapa no incluido. Foto DEMO del espacio.</p>
          <h3 className="mt-6 text-sm font-semibold text-navy">Horario</h3>
          <div className="mt-2">
            <HoursList hours={hours} />
          </div>
        </Card>
      </div>
    </div>
  );
}
