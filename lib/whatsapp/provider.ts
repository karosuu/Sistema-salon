/**
 * Abstracción para notificaciones de WhatsApp.
 * Esta versión solo documenta el contrato. No hay API de Meta ni webhooks.
 */
export type NotificationEvent =
  | { type: "APPOINTMENT_CREATED"; appointmentId: string }
  | { type: "APPOINTMENT_CONFIRMED"; appointmentId: string }
  | { type: "APPOINTMENT_CANCELLED"; appointmentId: string }
  | { type: "APPOINTMENT_RESCHEDULED"; appointmentId: string }
  | { type: "APPOINTMENT_REMINDER"; appointmentId: string };

export interface NotificationChannel {
  readonly channel: "whatsapp" | "email" | "sms";
  send(event: NotificationEvent): Promise<void>;
}

export class ManualWhatsAppChannel implements NotificationChannel {
  readonly channel = "whatsapp" as const;

  async send(event: NotificationEvent): Promise<void> {
    void event;
  }
}

export const whatsappChannel: NotificationChannel = new ManualWhatsAppChannel();
