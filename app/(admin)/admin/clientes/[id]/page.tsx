import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CustomerForm } from "@/components/admin/customer-form";
import { SaleForm } from "@/components/admin/sale-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TBody, Td, Th, THead } from "@/components/ui/table";
import { appointmentStatusLabel, appointmentStatusTone } from "@/lib/appointments/status";
import { ADMIN_ROUTES } from "@/lib/constants";
import { getAdminCustomer } from "@/lib/data";
import { formatCrc } from "@/lib/money";
import { formatDateCR, formatDateTimeCR, utcToCostaRicaYmd } from "@/lib/timezone";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getAdminCustomer(id);
  if (!customer) {
    notFound();
  }

  const birthDate = customer.birthDate
    ? utcToCostaRicaYmd(customer.birthDate)
    : "";

  return (
    <div className="px-4 py-6 sm:px-6">
      <AdminPageHeader
        eyebrow="CRM"
        title={customer.name}
        description={`Alta: ${formatDateCR(customer.createdAt)} · ${customer.phone}`}
      />

      <div className="mt-6 flex flex-wrap gap-2">
        <Badge tone="cyan">{customer.segmentLabel}</Badge>
        <Badge tone="navy">{customer.visitCount} visitas</Badge>
        <Badge tone="violet">{formatCrc(customer.totalSpentCrc)}</Badge>
      </div>
      <p className="mt-3 text-sm text-muted">
        Última visita: {customer.lastVisitAt ? formatDateCR(customer.lastVisitAt) : "—"}. Próxima
        cita: {customer.nextAppointmentAt ? formatDateTimeCR(customer.nextAppointmentAt) : "—"}.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display mb-4 text-2xl text-navy">Ficha</h2>
          <CustomerForm
            customerId={customer.id}
            defaults={{
              name: customer.name,
              phone: customer.phone,
              email: customer.email ?? "",
              notes: customer.notes ?? "",
              preferences: customer.preferences ?? "",
              birthDate,
            }}
          />
        </Card>
        <Card>
          <h2 className="font-display mb-4 text-2xl text-navy">Venta de mostrador</h2>
          <p className="mb-4 text-sm text-muted">
            Las citas completadas ya cuentan como gasto. Esta venta extra no duplica el precio de
            una cita.
          </p>
          <SaleForm customerId={customer.id} todayYmd={utcToCostaRicaYmd(new Date())} />
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="font-display mb-4 text-2xl text-navy">Servicios tomados</h2>
        {customer.servicesHistory.length === 0 ? (
          <p className="text-sm text-muted">Todavía no hay historial de servicios.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {customer.servicesHistory.map((item) => (
              <li key={item.name}>
                {item.name} · {item.count}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="mt-6">
        <h2 className="font-display mb-4 text-2xl text-navy">Citas</h2>
        <Table>
          <THead>
            <tr>
              <Th>Código</Th>
              <Th>Cuando</Th>
              <Th>Servicio</Th>
              <Th>Profesional</Th>
              <Th>Estado</Th>
              <Th>Precio</Th>
            </tr>
          </THead>
          <TBody>
            {customer.appointments.map((item) => (
              <tr key={item.id}>
                <Td>
                  <Link
                    href={`${ADMIN_ROUTES.appointments}/${item.id}`}
                    className="font-semibold text-navy hover:underline"
                  >
                    {item.code}
                  </Link>
                </Td>
                <Td>{formatDateTimeCR(item.startsAt)}</Td>
                <Td>{item.serviceName}</Td>
                <Td>{item.professionalName}</Td>
                <Td>
                  <Badge tone={appointmentStatusTone(item.status)}>
                    {appointmentStatusLabel(item.status)}
                  </Badge>
                </Td>
                <Td>{formatCrc(item.priceCrc)}</Td>
              </tr>
            ))}
          </TBody>
        </Table>
      </div>

      <div className="mt-6">
        <h2 className="font-display mb-4 text-2xl text-navy">Compras</h2>
        {customer.sales.length === 0 ? (
          <p className="text-sm text-muted">Sin ventas de mostrador.</p>
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>Fecha</Th>
                <Th>Descripción</Th>
                <Th>Monto</Th>
              </tr>
            </THead>
            <TBody>
              {customer.sales.map((item) => (
                <tr key={item.id}>
                  <Td>{formatDateCR(item.occurredAt)}</Td>
                  <Td>{item.description}</Td>
                  <Td>{formatCrc(item.amountCrc)}</Td>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
}
