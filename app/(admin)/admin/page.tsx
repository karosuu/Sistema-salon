import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { appointmentStatusLabel, appointmentStatusTone } from "@/lib/appointments/status";
import { ADMIN_ROUTES } from "@/lib/constants";
import { getDashboardSummary } from "@/lib/data/dashboard";
import { formatTimeCR } from "@/lib/timezone";

export default async function AdminDashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <div className="px-4 py-6 sm:px-6">
      <AdminPageHeader
        eyebrow="Resumen"
        title="Dashboard"
        description="Citas de hoy, pendientes y próximas. Todo en hora local de Costa Rica."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs tracking-wide text-muted uppercase">Citas hoy</p>
          <p className="font-display mt-2 text-4xl text-navy">{summary.todayAppointments.length}</p>
        </Card>
        <Card>
          <p className="text-xs tracking-wide text-muted uppercase">Pendientes</p>
          <p className="font-display mt-2 text-4xl text-navy">{summary.pendingCount}</p>
        </Card>
        <Card>
          <p className="text-xs tracking-wide text-muted uppercase">Clientes</p>
          <p className="font-display mt-2 text-4xl text-navy">{summary.customerCount}</p>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-2xl text-navy">Hoy ({summary.today})</h2>
          <ul className="mt-4 space-y-3">
            {summary.todayAppointments.length === 0 ? (
              <li className="text-sm text-muted">No hay citas para hoy.</li>
            ) : (
              summary.todayAppointments.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 border-t border-border pt-3">
                  <div>
                    <p className="text-sm font-semibold text-navy">
                      {formatTimeCR(item.startsAt)} · {item.service.name}
                    </p>
                    <p className="text-xs text-muted">
                      {item.customer.name} · {item.professional.name}
                    </p>
                  </div>
                  <Badge tone={appointmentStatusTone(item.status)}>
                    {appointmentStatusLabel(item.status)}
                  </Badge>
                </li>
              ))
            )}
          </ul>
        </Card>
        <Card>
          <h2 className="font-display text-2xl text-navy">Próximas</h2>
          <ul className="mt-4 space-y-3">
            {summary.upcoming.length === 0 ? (
              <li className="text-sm text-muted">No hay citas futuras.</li>
            ) : (
              summary.upcoming.map((item) => (
                <li key={item.id} className="border-t border-border pt-3">
                  <Link
                    href={`${ADMIN_ROUTES.appointments}/${item.id}`}
                    className="text-sm font-semibold text-navy hover:underline"
                  >
                    {item.code} · {item.service.name}
                  </Link>
                  <p className="text-xs text-muted">
                    {item.customer.name} · {item.professional.name}
                  </p>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
