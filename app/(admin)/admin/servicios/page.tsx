import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ServiceRowActions } from "@/components/admin/service-row-actions";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, Td, Th, THead } from "@/components/ui/table";
import { ADMIN_ROUTES } from "@/lib/constants";
import { listAdminServices } from "@/lib/data";
import { formatCrc, formatDuration } from "@/lib/money";

const AVISOS: Record<string, string> = {
  creado: "Servicio creado.",
  guardado: "Cambios guardados.",
};

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string }>;
}) {
  const [{ aviso }, services] = await Promise.all([searchParams, listAdminServices()]);
  const message = aviso ? AVISOS[aviso] : undefined;

  return (
    <div className="px-4 py-6 sm:px-6">
      <AdminPageHeader
        eyebrow="Catálogo"
        title="Servicios"
        description="Creá, editá y activá servicios. Si un servicio ya tiene citas, no se elimina: se desactiva para no romper el historial."
        actionHref={ADMIN_ROUTES.serviceNew}
        actionLabel="Nuevo servicio"
      />

      {message ? (
        <Alert tone="success" className="mt-6">
          {message}
        </Alert>
      ) : null}

      {services.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Todavía no hay servicios"
            description="Creá el primer servicio del catálogo. Nombre, precio en colones y duración son obligatorios."
            actionHref={ADMIN_ROUTES.serviceNew}
            actionLabel="Nuevo servicio"
          />
        </div>
      ) : (
        <div className="mt-8">
          <Table>
            <THead>
              <tr>
                <Th>Servicio</Th>
                <Th>Precio</Th>
                <Th>Duración</Th>
                <Th>Estado</Th>
                <Th>Citas</Th>
                <Th>Acciones</Th>
              </tr>
            </THead>
            <TBody>
              {services.map((service) => (
                <tr key={service.id}>
                  <Td className="whitespace-normal">
                    <Link
                      href={`${ADMIN_ROUTES.services}/${service.id}`}
                      className="font-semibold text-navy hover:underline"
                    >
                      {service.name}
                    </Link>
                    <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted line-clamp-2">
                      {service.description}
                    </p>
                  </Td>
                  <Td className="whitespace-nowrap">{formatCrc(service.priceCrc)}</Td>
                  <Td className="whitespace-nowrap">{formatDuration(service.durationMin)}</Td>
                  <Td>
                    <Badge tone={service.isActive ? "success" : "muted"}>
                      {service.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </Td>
                  <Td>{service.appointmentCount}</Td>
                  <Td>
                    <div className="flex flex-col items-end gap-2">
                      <ButtonLink
                        href={`${ADMIN_ROUTES.services}/${service.id}`}
                        variant="secondary"
                        size="sm"
                      >
                        Editar
                      </ButtonLink>
                      <ServiceRowActions
                        id={service.id}
                        name={service.name}
                        isActive={service.isActive}
                        appointmentCount={service.appointmentCount}
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
