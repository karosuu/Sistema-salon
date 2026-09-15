import type { AppointmentStatus } from "@prisma/client";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
  NO_SHOW: "No asistió",
};

export function appointmentStatusLabel(status: AppointmentStatus): string {
  return APPOINTMENT_STATUS_LABELS[status];
}

export function appointmentStatusTone(
  status: AppointmentStatus,
): "cyan" | "success" | "danger" | "muted" | "violet" {
  switch (status) {
    case "CONFIRMED":
      return "success";
    case "PENDING":
      return "cyan";
    case "CANCELLED":
      return "danger";
    case "NO_SHOW":
      return "violet";
    default:
      return "muted";
  }
}
