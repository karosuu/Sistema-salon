import Link from "next/link";

import { AppointmentStatusActions } from "@/components/admin/appointment-status-actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, Td, Th, THead } from "@/components/ui/table";
import { appointmentStatusLabel, appointmentStatusTone } from "@/lib/appointments/status";
import { ADMIN_ROUTES } from "@/lib/constants";
import { listAdminAppointments, listAdminProfessionals } from "@/lib/data";
import { formatCrc } from "@/lib/money";
import { formatDateTimeCR } from "@/lib/timezone";

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; profesional?: string }>;
}) {
  const params = await searchParams;
  const status =
    params.estado === "PENDING" ||
    params.estado === "CONFIRMED" ||
    params.estado === "CANCELLED" ||
    params.estado === "COMPLETED" ||
    params.estado === "NO_SHOW"
      ? params.estado
      : undefined;

  const [appointments, professionals] = await Promise.all([
    listAdminAppointments({
      status,
      professionalId: params.profesional,
    }),
    listAdminProfessionals(),
  ]);

  return (
    <div className="px-4 py-6 sm:px-6">
      <AdminPageHeader
        eyebrow="Agenda"
        title="Citas"
        description="Las reservas públicas aparecen aquí al confirmarse. Cancelar o completar libera el horario."
      />

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <select
          name="estado"
          defaultValue={status ?? ""}
          className="min-h-11 rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="PENDING">Pendiente</option>
          <option value="CONFIRMED">Confirmada</option>
          <option value="CANCELLED">Cancelada</option>
          <option value="COMPLETED">Completada</option>
          <option value="NO_SHOW">No asistió</option>
        </select>
        <select
          name="profesional"
          defaultValue={params.profesional ?? ""}
          className="min-h-11 rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm"
        >
          <option value="">Todo el equipo</option>
          {professionals.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="min-h-11 rounded-full bg-navy px-5 text-sm font-semibold text-white"
        >
          Filtrar
        </button>
      </form>

      {appointments.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No hay citas con ese filtro"
            description="Cuando alguien reserve, la cita se verá en esta lista y en el calendario."
          />
        </div>
      ) : (
        <div className="mt-8">
          <Table>
            <THead>
              <tr>
                <Th>Código</Th>
                <Th>Cuando</Th>
                <Th>Cliente</Th>
                <Th>Servicio</Th>
                <Th>Profesional</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </tr>
            </THead>
            <TBody>
              {appointments.map((item) => (
                <tr key={item.id}>
                  <Td>
                    <Link
                      href={`${ADMIN_ROUTES.appointments}/${item.id}`}
                      className="font-semibold text-navy hover:underline"
                    >
                      {item.code}
                    </Link>
                    <p className="text-xs text-muted">{formatCrc(item.priceCrc)}</p>
                  </Td>
                  <Td>{formatDateTimeCR(item.startsAt)}</Td>
                  <Td>
                    <Link
                      href={`${ADMIN_ROUTES.customers}/${item.customer.id}`}
                      className="hover:underline"
                    >
                      {item.customer.name}
                    </Link>
                  </Td>
                  <Td>{item.service.name}</Td>
                  <Td>{item.professional.name}</Td>
                  <Td>
                    <Badge tone={appointmentStatusTone(item.status)}>
                      {appointmentStatusLabel(item.status)}
                    </Badge>
                  </Td>
                  <Td>
                    <AppointmentStatusActions id={item.id} status={item.status} />
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
