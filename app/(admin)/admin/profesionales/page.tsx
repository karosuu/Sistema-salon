import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProfessionalPhoto } from "@/components/public/professional-card";
import { ProfessionalRowActions } from "@/components/admin/professional-row-actions";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, Td, Th, THead } from "@/components/ui/table";
import { ADMIN_ROUTES } from "@/lib/constants";
import { listAdminProfessionals } from "@/lib/data";

const AVISOS: Record<string, string> = {
  creado: "Profesional creado.",
  guardado: "Cambios guardados.",
};

export default async function AdminProfessionalsPage({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string }>;
}) {
  const [{ aviso }, professionals] = await Promise.all([
    searchParams,
    listAdminProfessionals(),
  ]);
  const message = aviso ? AVISOS[aviso] : undefined;

  return (
    <div className="px-4 py-6 sm:px-6">
      <AdminPageHeader
        eyebrow="Equipo"
        title="Profesionales"
        description="Gestioná el equipo, los servicios que realiza cada persona y su horario semanal. Si hay citas históricas, desactivá en lugar de eliminar."
        actionHref={ADMIN_ROUTES.professionalNew}
        actionLabel="Nuevo profesional"
      />

      {message ? (
        <Alert tone="success" className="mt-6">
          {message}
        </Alert>
      ) : null}

      {professionals.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Todavía no hay profesionales"
            description="Creá el primer perfil del equipo. Asigná servicios y un horario semanal."
            actionHref={ADMIN_ROUTES.professionalNew}
            actionLabel="Nuevo profesional"
          />
        </div>
      ) : (
        <div className="mt-8">
          <Table>
            <THead>
              <tr>
                <Th>Profesional</Th>
                <Th>Servicios</Th>
                <Th>Estado</Th>
                <Th>Citas</Th>
                <Th>Acciones</Th>
              </tr>
            </THead>
            <TBody>
              {professionals.map((professional) => (
                <tr key={professional.id}>
                  <Td className="whitespace-normal">
                    <div className="flex items-start gap-3">
                      <ProfessionalPhoto
                        name={professional.name}
                        photoUrl={professional.photoUrl}
                        size="sm"
                      />
                      <div>
                        <Link
                          href={`${ADMIN_ROUTES.professionals}/${professional.id}`}
                          className="font-semibold text-navy hover:underline"
                        >
                          {professional.name}
                        </Link>
                        <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted line-clamp-2">
                          {professional.bio}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td className="whitespace-normal">
                    <p className="max-w-xs text-sm text-ink">
                      {professional.services.length > 0
                        ? professional.services.map((service) => service.name).join(" · ")
                        : "Sin servicios"}
                    </p>
                  </Td>
                  <Td>
                    <Badge tone={professional.isActive ? "success" : "muted"}>
                      {professional.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </Td>
                  <Td>{professional.appointmentCount}</Td>
                  <Td>
                    <div className="flex flex-col items-end gap-2">
                      <ButtonLink
                        href={`${ADMIN_ROUTES.professionals}/${professional.id}`}
                        variant="secondary"
                        size="sm"
                      >
                        Editar
                      </ButtonLink>
                      <ProfessionalRowActions
                        id={professional.id}
                        name={professional.name}
                        isActive={professional.isActive}
                        appointmentCount={professional.appointmentCount}
                      />
                    </div>
                  </Td>
                </tr>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </div>
  );
}
