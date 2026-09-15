import { BookingWizard } from "@/components/public/booking-wizard";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PUBLIC_ROUTES } from "@/lib/constants";
import { getPublicProfessionals, getPublicServices } from "@/lib/data";
import { utcToCostaRicaYmd } from "@/lib/timezone";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata(
    "Reservar cita",
    "Elegí servicio, profesional, fecha y hora. La disponibilidad se valida en el servidor.",
  );
}

export default async function BookingPage() {
  const [services, professionals] = await Promise.all([
    getPublicServices(),
    getPublicProfessionals(),
  ]);

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Reservas"
        title="Reservar cita"
        description="Servicio, profesional o cualquiera, fecha y hora libre. Si el horario se ocupa mientras reservás, te pedimos elegir otro."
      />
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6">
        <Alert tone="info">
          No hace falta crear una cuenta. Confirmamos al momento y el calendario del salón se
          actualiza de inmediato.
        </Alert>
        {services.length === 0 ? (
          <EmptyState
            title="No hay servicios para reservar"
            description="Cuando el catálogo esté activo, podrás elegir un servicio aquí."
            actionHref={PUBLIC_ROUTES.contact}
            actionLabel="Contactar"
          />
        ) : (
          <BookingWizard
            services={services}
            professionals={professionals.map((item) => ({
              id: item.id,
              name: item.name,
              bio: item.bio,
              photoUrl: item.photoUrl,
              serviceIds: item.services.map((service) => service.id),
            }))}
            todayYmd={utcToCostaRicaYmd(new Date())}
          />
        )}
      </div>
    </div>
  );
}
