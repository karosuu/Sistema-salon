import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SalonSettingsForm } from "@/components/admin/salon-settings-form";
import { Card } from "@/components/ui/card";
import { getSalonContent } from "@/lib/data";

export default async function AdminSettingsPage() {
  const salon = await getSalonContent();

  return (
    <div className="px-4 py-6 sm:px-6">
      <AdminPageHeader
        eyebrow="Administración"
        title="Configuración"
        description="Nombre, teléfono, WhatsApp, dirección y redes sociales. Estos datos alimentan la web pública; no hace falta hardcodearlos."
      />
      <Card className="mt-8 max-w-2xl">
        <SalonSettingsForm
          defaults={{
            name: salon.name,
            tagline: salon.tagline ?? "",
            phone: salon.phone,
            whatsappNumber: salon.whatsappNumber,
            whatsappMessage: salon.whatsappMessage,
            email: salon.email ?? "",
            address: salon.address,
            instagramUrl: salon.instagramUrl ?? "",
            facebookUrl: salon.facebookUrl ?? "",
            tiktokUrl: salon.tiktokUrl ?? "",
          }}
        />
      </Card>
    </div>
  );
}
