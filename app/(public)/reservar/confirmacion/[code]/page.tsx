import { notFound } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PUBLIC_ROUTES } from "@/lib/constants";
import { getBookingByCode, getSalonContent } from "@/lib/data";
import { formatCrc, formatDuration } from "@/lib/money";
import { googleCalendarUrl } from "@/lib/notifications/templates";
import { pageMetadata } from "@/lib/seo";
import { formatDateCR, formatTimeCR } from "@/lib/timezone";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export async function generateMetadata() {
  return pageMetadata("Reserva confirmada", "Tu cita DEMO quedó registrada.");
}

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const [booking, salon] = await Promise.all([
    getBookingByCode(code),
    getSalonContent(),
  ]);

  if (!booking) {
    notFound();
  }

  const calendarHref = googleCalendarUrl(
    {
      salonName: salon.name,
      salonAddress: salon.address,
      salonPhone: salon.phone,
      customerName: booking.customer.name,
      serviceName: booking.service.name,
      professionalName: booking.professional.name,
      startsAt: booking.startsAt,
      durationMin: booking.durationMin,
      priceCrc: booking.priceCrc,
      code: booking.code,
    },
    booking.endsAt,
  );
  const whatsappHref = buildWhatsAppLink(
    salon.whatsappNumber,
    `Hola, confirmé la reserva ${booking.code} para ${booking.service.name}.`,
  );

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Listo"
        title="Reserva confirmada"
        description="Guardá el número de reserva. Si nos diste correo, también intentamos enviarte la confirmación."
      />
      <div className="mx-auto w-full max-w-xl space-y-4 px-4 sm:px-6">
        <Alert tone="success">Tu cita ya aparece en el calendario del salón.</Alert>
        <Card className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.2em] text-cyan-deep uppercase">
            {booking.code}
          </p>
          <h2 className="font-display text-3xl text-navy">{booking.service.name}</h2>
          <p className="text-sm text-muted">{booking.professional.name}</p>
          <p className="text-sm text-navy">
            {formatDateCR(booking.startsAt)} · {formatTimeCR(booking.startsAt)}
          </p>
          <p className="text-sm text-muted">
            {formatDuration(booking.durationMin)} · {formatCrc(booking.priceCrc)}
          </p>
          <p className="text-sm text-muted">
            {booking.customer.name} · {booking.customer.phone}
          </p>
        </Card>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={calendarHref} target="_blank" variant="secondary">
            Agregar al calendario
          </ButtonLink>
          <ButtonLink href={whatsappHref} variant="whatsapp" target="_blank">
            WhatsApp
          </ButtonLink>
          <ButtonLink href={PUBLIC_ROUTES.home} variant="ghost">
            Volver al inicio
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
