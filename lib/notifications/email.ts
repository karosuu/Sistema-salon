import "server-only";

import { prisma } from "@/lib/db";
import { getAppUrl } from "@/lib/env";
import type { EmailMessage } from "@/lib/notifications/templates";
import {
  buildAppointmentEmail,
  buildAppointmentIcs,
  type AppointmentEmailPayload,
} from "@/lib/notifications/templates";
import { whatsappChannel } from "@/lib/whatsapp/provider";

export type EmailProvider = {
  readonly name: string;
  send(message: EmailMessage): Promise<void>;
};

class ConsoleEmailProvider implements EmailProvider {
  readonly name = "console";

  async send(message: EmailMessage): Promise<void> {
    console.info(
      `[email:dev] to=${message.to} subject=${message.subject}\n${message.text}`,
    );
  }
}

class ResendEmailProvider implements EmailProvider {
  readonly name = "resend";

  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async send(message: EmailMessage): Promise<void> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Resend ${response.status}: ${body.slice(0, 300)}`);
    }
  }
}

export function getEmailProvider(): EmailProvider {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (process.env.EMAIL_PROVIDER === "resend" && apiKey && from) {
    return new ResendEmailProvider(apiKey, from);
  }
  return new ConsoleEmailProvider();
}

export type NotifyAppointmentInput = {
  appointmentId: string;
  eventType:
    | "APPOINTMENT_CONFIRMED"
    | "APPOINTMENT_RESCHEDULED"
    | "APPOINTMENT_CANCELLED"
    | "APPOINTMENT_REMINDER";
};

async function payloadFromAppointment(
  appointmentId: string,
): Promise<(AppointmentEmailPayload & { email: string | null; endsAt: Date }) | null> {
  const [appointment, salon] = await Promise.all([
    prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
        service: { select: { name: true } },
        professional: { select: { name: true } },
      },
    }),
    prisma.salonSettings.findUnique({ where: { id: "default" } }),
  ]);

  if (!appointment || !salon) {
    return null;
  }

  return {
    salonName: salon.name,
    salonAddress: salon.address,
    salonPhone: salon.phone,
    customerName: appointment.customer.name,
    serviceName: appointment.service.name,
    professionalName: appointment.professional.name,
    startsAt: appointment.startsAt,
    durationMin: appointment.durationMin,
    priceCrc: appointment.priceCrc,
    code: appointment.code,
    manageUrl: `${getAppUrl()}/reservar/confirmacion/${appointment.code}`,
    email: appointment.customer.email,
    endsAt: appointment.endsAt,
  };
}

export async function notifyAppointmentEvent(
  input: NotifyAppointmentInput,
): Promise<void> {
  try {
    await notifyAppointmentEventUnsafe(input);
  } catch (error) {
    console.error("[notifications]", error);
  }
}

async function notifyAppointmentEventUnsafe(
  input: NotifyAppointmentInput,
): Promise<void> {
  const payload = await payloadFromAppointment(input.appointmentId);
  if (!payload) {
    return;
  }

  try {
    await whatsappChannel.send({
      type: input.eventType,
      appointmentId: input.appointmentId,
    });
  } catch (error) {
    await prisma.notificationLog.create({
      data: {
        channel: "whatsapp",
        eventType: input.eventType,
        status: "FAILED",
        recipient: "whatsapp",
        error: error instanceof Error ? error.message : "Error de WhatsApp",
        appointmentId: input.appointmentId,
      },
    });
  }

  const recipient = payload.email?.trim();
  if (!recipient) {
    await prisma.notificationLog.create({
      data: {
        channel: "email",
        eventType: input.eventType,
        status: "SKIPPED",
        recipient: "sin-correo",
        subject: "Cliente sin correo",
        appointmentId: input.appointmentId,
      },
    });
    return;
  }

  const message = buildAppointmentEmail(input.eventType, payload);
  message.to = recipient;
  message.ics = {
    filename: `${payload.code}.ics`,
    content: buildAppointmentIcs(payload, payload.endsAt),
  };

  try {
    await getEmailProvider().send(message);
    await prisma.notificationLog.create({
      data: {
        channel: "email",
        eventType: input.eventType,
        status: "SENT",
        recipient,
        subject: message.subject,
        appointmentId: input.appointmentId,
      },
    });
  } catch (error) {
    await prisma.notificationLog.create({
      data: {
        channel: "email",
        eventType: input.eventType,
        status: "FAILED",
        recipient,
        subject: message.subject,
        error: error instanceof Error ? error.message : "Error de correo",
        appointmentId: input.appointmentId,
      },
    });
  }
}

export async function sendDueReminders(now = new Date()): Promise<number> {
  const horizonStart = new Date(now.getTime() + 20 * 60 * 60 * 1000);
  const horizonEnd = new Date(now.getTime() + 28 * 60 * 60 * 1000);

  const due = await prisma.appointment.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      startsAt: { gte: horizonStart, lte: horizonEnd },
      notifications: {
        none: { eventType: "APPOINTMENT_REMINDER", status: "SENT" },
      },
    },
    select: { id: true },
  });

  for (const item of due) {
    await notifyAppointmentEvent({
      appointmentId: item.id,
      eventType: "APPOINTMENT_REMINDER",
    });
  }

  return due.length;
}
