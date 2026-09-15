import { ServiceCard } from "@/components/public/service-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PUBLIC_ROUTES } from "@/lib/constants";
import { getPublicServices } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata(
    "Servicios",
    "Catálogo DEMO de servicios del salón, con precio en colones y duración.",
  );
}

export default async function ServicesPage() {
  const services = await getPublicServices();

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Catálogo"
        title="Servicios"
        description="Precios en colones y duración estimada. Los datos son de demostración y se editan desde administración."
      />
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {services.length === 0 ? (
          <EmptyState
            title="No hay servicios activos"
            description="Activá servicios en el panel para mostrarlos aquí."
            actionHref={PUBLIC_ROUTES.contact}
            actionLabel="Contactar"
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
