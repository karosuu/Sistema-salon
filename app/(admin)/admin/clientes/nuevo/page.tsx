import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CustomerForm } from "@/components/admin/customer-form";
import { Card } from "@/components/ui/card";

export default function NewCustomerPage() {
  return (
    <div className="px-4 py-6 sm:px-6">
      <AdminPageHeader
        eyebrow="CRM"
        title="Nuevo cliente"
        description="El teléfono es único. Si coincide con una reserva, se reutiliza la ficha."
      />
      <Card className="mt-8 max-w-xl">
        <CustomerForm />
      </Card>
    </div>
  );
}
