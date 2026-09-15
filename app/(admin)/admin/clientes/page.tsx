import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, Td, Th, THead } from "@/components/ui/table";
import { ADMIN_ROUTES } from "@/lib/constants";
import { listAdminCustomers } from "@/lib/data";
import { formatCrc } from "@/lib/money";
import { formatDateCR } from "@/lib/timezone";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const customers = await listAdminCustomers(q);

  return (
    <div className="px-4 py-6 sm:px-6">
      <AdminPageHeader
        eyebrow="CRM"
        title="Clientes"
        description="Fichas creadas automáticamente al reservar. Buscá por nombre, teléfono o correo."
        actionHref={ADMIN_ROUTES.customerNew}
        actionLabel="Nuevo cliente"
      />

      <form className="mt-6 flex flex-col gap-3 sm:flex-row" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Nombre, teléfono o correo"
          className="min-h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm sm:max-w-md"
        />
        <button
          type="submit"
          className="min-h-11 rounded-full bg-navy px-5 text-sm font-semibold text-white"
        >
          Buscar
        </button>
      </form>

      {customers.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Sin clientes"
            description="Las reservas públicas crean o reutilizan la ficha por teléfono."
            actionHref={ADMIN_ROUTES.customerNew}
            actionLabel="Nuevo cliente"
          />
        </div>
      ) : (
        <div className="mt-8">
          <Table>
            <THead>
              <tr>
                <Th>Cliente</Th>
                <Th>Segmento</Th>
                <Th>Visitas</Th>
                <Th>Última visita</Th>
                <Th>Próxima cita</Th>
                <Th>Total</Th>
              </tr>
            </THead>
            <TBody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <Td>
                    <Link
                      href={`${ADMIN_ROUTES.customers}/${customer.id}`}
                      className="font-semibold text-navy hover:underline"
                    >
                      {customer.name}
                    </Link>
                    <p className="text-xs text-muted">{customer.phone}</p>
                  </Td>
                  <Td>
                    <Badge tone={customer.segment === "inactivo" ? "muted" : "cyan"}>
                      {customer.segmentLabel}
                    </Badge>
                  </Td>
                  <Td>{customer.visitCount}</Td>
                  <Td>{customer.lastVisitAt ? formatDateCR(customer.lastVisitAt) : "—"}</Td>
                  <Td>
                    {customer.nextAppointmentAt ? formatDateCR(customer.nextAppointmentAt) : "—"}
                  </Td>
                  <Td>{formatCrc(customer.totalSpentCrc)}</Td>
                </tr>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </div>
  );
}
