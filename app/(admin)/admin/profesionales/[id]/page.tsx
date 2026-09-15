import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProfessionalForm } from "@/components/admin/professional-form";
import { Card } from "@/components/ui/card";
import { getAdminProfessional, listAdminServices } from "@/lib/data";

export default async function EditProfessionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [professional, services] = await Promise.all([
    getAdminProfessional(id),
    listAdminServices(),
  ]);

  if (!professional) {
    notFound();
  }

  return (
    <div className="px-4 py-6 sm:px-6">
      <AdminPageHeader
        eyebrow="Equipo"
        title="Editar profesional"
        description="Los cambios de servicios y horario se reflejan en la web pública si el perfil está activo."
      />
      <Card className="mt-8 max-w-3xl">
        <ProfessionalForm
          mode="edit"
          professionalId={professional.id}
          services={services.map((service) => ({
            id: service.id,
            name: service.name,
            isActive: service.isActive,
          }))}
          defaults={{
            name: professional.name,
            bio: professional.bio,
            photoUrl: professional.photoUrl ?? "",
            isActive: professional.isActive,
            serviceIds: professional.serviceIds,
            availability: professional.availability,
          }}
        />
      </Card>
    </div>
  );
}
