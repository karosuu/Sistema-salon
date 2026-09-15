import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProfessionalForm } from "@/components/admin/professional-form";
import { Card } from "@/components/ui/card";
import { listAdminServices } from "@/lib/data";

export default async function NewProfessionalPage() {
  const services = await listAdminServices();

  return (
    <div className="px-4 py-6 sm:px-6">
      <AdminPageHeader
        eyebrow="Equipo"
        title="Nuevo profesional"
        description="Las personas activas aparecen en la web pública y, si tienen el servicio asignado, en el flujo de reserva."
      />
      <Card className="mt-8 max-w-3xl">
        <ProfessionalForm
          mode="create"
          services={services.map((service) => ({
            id: service.id,
            name: service.name,
            isActive: service.isActive,
          }))}
        />
      </Card>
    </div>
  );
}
