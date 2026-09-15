import { notFound } from "next/navigation";

import { AppointmentStatusActions } from "@/components/admin/appointment-status-actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { RescheduleForm } from "@/components/admin/reschedule-form";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { appointmentStatusLabel, appointmentStatusTone } from "@/lib/appointments/status";
import { ADMIN_ROUTES } from "@/lib/constants";
import { getAdminAppointment } from "@/lib/data";
import { formatCrc, formatDuration } from "@/lib/money";
import { formatDateTimeCR, utcToCostaRicaYmd } from "@/lib/timezone";

export default async function AdminAppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appointment = await getAdminAppointment(id);
  if (!appointment) {
    notFound();
  }

  return (
    <div className="px-4 py-6 sm:px-6">
      <AdminPageHeader
        eyebrow="Agenda"
        title={appointment.code}
        description={`${appointment.customer.name} · ${appointment.service.name}`}
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <Badge tone={appointmentStatusTone(appointment.status)}>
            {appointmentStatusLabel(appointment.status)}
          </Badge>
          <p className="text-sm text-navy">{formatDateTimeCR(appointment.startsAt)}</p>
          <p className="text-sm text-muted">
            {formatDuration(appointment.durationMin)} · {formatCrc(appointment.priceCrc)}
          </p>
          <p className="text-sm text-muted">{appointment.professional.name}</p>
          {appointment.notes ? (
            <p className="text-sm text-muted">{appointment.notes}</p>
          ) : null}
          <ButtonLink
            href={`${ADMIN_ROUTES.customers}/${appointment.customer.id}`}
            variant="secondary"
            size="sm"
          >
            Ver ficha CRM
          </ButtonLink>
          <AppointmentStatusActions id={appointment.id} status={appointment.status} />
        </Card>
        <Card>
          <h2 className="font-display text-2xl text-navy">Reprogramar</h2>
          <p className="mt-2 mb-4 text-sm text-muted">
            Solo se ofrecen huecos libres del mismo profesional, validando de nuevo en el servidor.
          </p>
          <RescheduleForm
            appointmentId={appointment.id}
            serviceId={appointment.service.id}
            professionalId={appointment.professional.id}
            todayYmd={utcToCostaRicaYmd(new Date())}
          />
        </Card>
      </div>
    </div>
  );
}
