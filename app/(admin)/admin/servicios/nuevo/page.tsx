import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ServiceForm } from "@/components/admin/service-form";
import { Card } from "@/components/ui/card";

export default function NewServicePage() {
  return (
    <div className="px-4 py-6 sm:px-6">
      <AdminPageHeader
        eyebrow="Catálogo"
        title="Nuevo servicio"
        description="Los servicios activos aparecen en la web pública con precio en colones y botón Reservar."
      />
      <Card className="mt-8 max-w-2xl">
        <ServiceForm mode="create" />
      </Card>
    </div>
  );
}
