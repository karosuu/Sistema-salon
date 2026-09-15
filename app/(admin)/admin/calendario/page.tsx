import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { appointmentStatusLabel, appointmentStatusTone } from "@/lib/appointments/status";
import { ADMIN_ROUTES } from "@/lib/constants";
import { listAdminProfessionals, listCalendarAppointments } from "@/lib/data";
import { addCalendarDays, formatTimeCR, formatYmdLong, utcToCostaRicaYmd } from "@/lib/timezone";

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const { fecha } = await searchParams;
  const today = utcToCostaRicaYmd(new Date());
  const ymd = fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha : today;
  const [appointments, professionals] = await Promise.all([
    listCalendarAppointments(ymd),
    listAdminProfessionals(),
  ]);

  const prev = addCalendarDays(ymd, -1);
  const next = addCalendarDays(ymd, 1);

  return (
    <div className="px-4 py-6 sm:px-6">
      <AdminPageHeader
        eyebrow="Agenda"
        title="Calendario"
        description="Vista diaria en hora local de Costa Rica. Las reservas nuevas aparecen al confirmarse."
      />
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <ButtonLink href={`${ADMIN_ROUTES.calendar}?fecha=${prev}`} variant="secondary" size="sm">
          Día anterior
        </ButtonLink>
        <p className="text-sm font-semibold text-navy">{formatYmdLong(ymd)}</p>
        <ButtonLink href={`${ADMIN_ROUTES.calendar}?fecha=${next}`} variant="secondary" size="sm">
          Día siguiente
        </ButtonLink>
        <ButtonLink href={ADMIN_ROUTES.calendar} variant="ghost" size="sm">
          Hoy
        </ButtonLink>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {professionals.map((professional) => {
          const items = appointments.filter((item) => item.professional.id === professional.id);
          return (
            <Card key={professional.id}>
              <h2 className="font-display text-2xl text-navy">{professional.name}</h2>
              {items.length === 0 ? (
                <p className="mt-3 text-sm text-muted">Sin citas este día.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {items.map((item) => (
                    <li key={item.id} className="border-t border-border pt-3">
                      <p className="text-sm font-semibold text-navy">
                        {formatTimeCR(item.startsAt)} · {item.service.name}
                      </p>
                      <p className="text-xs text-muted">{item.customer.name}</p>
                      <Badge tone={appointmentStatusTone(item.status)} className="mt-2">
                        {appointmentStatusLabel(item.status)}
                      </Badge>
                      <div className="mt-2">
                        <Link
                          href={`${ADMIN_ROUTES.appointments}/${item.id}`}
                          className="text-sm text-cyan-deep hover:underline"
                        >
                          {item.code}
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
