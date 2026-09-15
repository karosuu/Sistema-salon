import { ProfessionalCard } from "@/components/public/professional-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PUBLIC_ROUTES } from "@/lib/constants";
import { getPublicProfessionals } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata(
    "Profesionales",
    "Equipo DEMO del salón. Solo se muestran profesionales activos.",
  );
}

export default async function ProfessionalsPage() {
  const professionals = await getPublicProfessionals();

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Equipo"
        title="Profesionales"
        description="Perfiles de demostración. Cada persona aparece con foto, los servicios que realiza y su horario semanal."
      />
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {professionals.length === 0 ? (
          <EmptyState
            title="No hay profesionales activos"
            description="Cuando el equipo esté cargado, se verá en esta página."
            actionHref={PUBLIC_ROUTES.contact}
            actionLabel="Contactar"
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {professionals.map((professional) => (
              <ProfessionalCard key={professional.id} professional={professional} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
