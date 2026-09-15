import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ServiceForm } from "@/components/admin/service-form";
import { Card } from "@/components/ui/card";
import { getAdminService } from "@/lib/data";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getAdminService(id);

  if (!service) {
    notFound();
  }

  return (
    <div className="px-4 py-6 sm:px-6">
      <AdminPageHeader
        eyebrow="Catálogo"
        title="Editar servicio"
        description="Los cambios de precio y duración se ven de inmediato en la web pública si el servicio está activo."
      />
      <Card className="mt-8 max-w-2xl">
        <ServiceForm
          mode="edit"
          serviceId={service.id}
          defaults={{
            name: service.name,
            description: service.description,
            priceCrc: service.priceCrc,
            durationMin: service.durationMin,
            imageUrl: service.imageUrl ?? "",
            isActive: service.isActive,
          }}
        />
      </Card>
    </div>
  );
}
