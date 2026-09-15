import { formatCrc, formatDuration } from "@/lib/money";
import { formatDateCR, formatTimeCR } from "@/lib/timezone";

export type AppointmentEmailPayload = {
  salonName: string;
  salonAddress: string;
  salonPhone: string;
  customerName: string;
  serviceName: string;
  professionalName: string;
  startsAt: Date;
  durationMin: number;
  priceCrc: number;
  code: string;
  manageUrl?: string;
};

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
  ics?: { filename: string; content: string };
};

function formatWhen(payload: AppointmentEmailPayload): string {
  return `${formatDateCR(payload.startsAt)} a las ${formatTimeCR(payload.startsAt)}`;
}

function details(payload: AppointmentEmailPayload): string {
  return [
    `Salón: ${payload.salonName}`,
    `Cliente: ${payload.customerName}`,
    `Servicio: ${payload.serviceName}`,
    `Profesional: ${payload.professionalName}`,
    `Fecha y hora: ${formatWhen(payload)}`,
    `Duración: ${formatDuration(payload.durationMin)}`,
    `Precio estimado: ${formatCrc(payload.priceCrc)}`,
    `Número de reserva: ${payload.code}`,
    `Dirección: ${payload.salonAddress}`,
    `Teléfono: ${payload.salonPhone}`,
  ].join("\n");
}

function htmlShell(title: string, payload: AppointmentEmailPayload, intro: string): string {
  return `<!doctype html>
<html lang="es">
  <body style="margin:0;background:#f6f3ee;font-family:Georgia,serif;color:#1b2430;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:16px;padding:28px;max-width:560px;">
            <tr><td style="font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#0e7490;">${payload.salonName}</td></tr>
            <tr><td style="padding-top:12px;font-size:28px;color:#0f2744;">${title}</td></tr>
            <tr><td style="padding-top:12px;font-size:16px;line-height:1.6;">${intro}</td></tr>
            <tr><td style="padding-top:20px;font-size:15px;line-height:1.7;white-space:pre-line;">${details(payload)}</td></tr>
            ${
              payload.manageUrl
                ? `<tr><td style="padding-top:20px;"><a href="${payload.manageUrl}" style="color:#0e7490;">Agregar al calendario / ver reserva</a></td></tr>`
                : ""
            }
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildAppointmentEmail(
  eventType:
    | "APPOINTMENT_CONFIRMED"
    | "APPOINTMENT_RESCHEDULED"
    | "APPOINTMENT_CANCELLED"
    | "APPOINTMENT_REMINDER",
  payload: AppointmentEmailPayload,
): EmailMessage {
  const copy = {
    APPOINTMENT_CONFIRMED: {
      subject: `Reserva ${payload.code} confirmada · ${payload.salonName}`,
      intro: `Hola ${payload.customerName}, tu cita quedó confirmada.`,
      title: "Cita confirmada",
    },
    APPOINTMENT_RESCHEDULED: {
      subject: `Reserva ${payload.code} reprogramada · ${payload.salonName}`,
      intro: `Hola ${payload.customerName}, tu cita se reprogramó.`,
      title: "Cita reprogramada",
    },
    APPOINTMENT_CANCELLED: {
      subject: `Reserva ${payload.code} cancelada · ${payload.salonName}`,
      intro: `Hola ${payload.customerName}, tu cita fue cancelada.`,
      title: "Cita cancelada",
    },
    APPOINTMENT_REMINDER: {
      subject: `Recordatorio de tu cita ${payload.code} · ${payload.salonName}`,
      intro: `Hola ${payload.customerName}, te recordamos tu cita próxima.`,
      title: "Recordatorio de cita",
    },
  }[eventType];

  return {
    to: "",
    subject: copy.subject,
    text: `${copy.intro}\n\n${details(payload)}`,
    html: htmlShell(copy.title, payload, copy.intro),
  };
}

function icsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function buildAppointmentIcs(payload: AppointmentEmailPayload, endsAt: Date): string {
  const uid = `${payload.code}@pixel-craft.salon`;
  const description = `Reserva ${payload.code} · ${payload.serviceName} con ${payload.professionalName}`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pixel-Craft//Salon//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(payload.startsAt)}`,
    `DTEND:${icsDate(endsAt)}`,
    `SUMMARY:${payload.serviceName} · ${payload.salonName}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${payload.salonAddress}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function googleCalendarUrl(payload: AppointmentEmailPayload, endsAt: Date): string {
  const dates = `${icsDate(payload.startsAt)}/${icsDate(endsAt)}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${payload.serviceName} · ${payload.salonName}`,
    dates,
    details: `Reserva ${payload.code}`,
    location: payload.salonAddress,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
