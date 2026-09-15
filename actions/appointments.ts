"use server";

import { revalidatePath } from "next/cache";
import type { AppointmentStatus } from "@prisma/client";

import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/constants";
import {
  rescheduleAppointmentRecord,
  setAppointmentStatusRecord,
} from "@/lib/data/appointments";
import { toPublicErrorMessage } from "@/lib/errors";
import { notifyAppointmentEvent } from "@/lib/notifications/email";
import { assertAdminSession } from "@/lib/require-admin";
import { err, ok, type Result } from "@/lib/result";
import {
  appointmentIdSchema,
  appointmentStatusSchema,
  rescheduleSchema,
} from "@/lib/validations/appointment";

function revalidateAppointmentSurfaces() {
  revalidatePath(ADMIN_ROUTES.appointments);
  revalidatePath(ADMIN_ROUTES.calendar);
  revalidatePath(ADMIN_ROUTES.customers);
  revalidatePath(ADMIN_ROUTES.dashboard);
  revalidatePath(PUBLIC_ROUTES.book);
}

export async function setAppointmentStatusAction(
  id: unknown,
  status: unknown,
): Promise<Result<{ status: AppointmentStatus }>> {
  await assertAdminSession();

  const idResult = appointmentIdSchema.safeParse(id);
  const statusResult = appointmentStatusSchema.safeParse(status);
  if (!idResult.success || !statusResult.success) {
    return err("La cita o el estado no son válidos.");
  }

  try {
    const result = await setAppointmentStatusRecord(idResult.data, statusResult.data);
    if (!result.ok) {
      return result;
    }
    revalidateAppointmentSurfaces();

    if (statusResult.data === "CANCELLED") {
      void notifyAppointmentEvent({
        appointmentId: result.data.id,
        eventType: "APPOINTMENT_CANCELLED",
      }).catch(() => undefined);
    }

    return ok({ status: result.data.status });
  } catch (error) {
    return err(toPublicErrorMessage(error));
  }
}

export async function rescheduleAppointmentAction(
  raw: unknown,
): Promise<Result<{ id: string }>> {
  await assertAdminSession();

  const parsed = rescheduleSchema.safeParse(raw);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Revisá el nuevo horario.");
  }

  try {
    const result = await rescheduleAppointmentRecord(
      parsed.data.appointmentId,
      new Date(parsed.data.startsAt),
    );
    if (!result.ok) {
      return result;
    }
    revalidateAppointmentSurfaces();
    void notifyAppointmentEvent({
      appointmentId: result.data.id,
      eventType: "APPOINTMENT_RESCHEDULED",
    }).catch(() => undefined);
    return ok({ id: result.data.id });
  } catch (error) {
    return err(toPublicErrorMessage(error));
  }
}
