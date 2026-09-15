"use server";

import { revalidatePath } from "next/cache";

import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/constants";
import { listAvailableSlots } from "@/lib/data/availability";
import { createPublicBooking } from "@/lib/data/booking";
import { toPublicErrorMessage } from "@/lib/errors";
import { notifyAppointmentEvent } from "@/lib/notifications/email";
import { err, ok, type Result } from "@/lib/result";
import {
  publicBookingSchema,
  slotsQuerySchema,
} from "@/lib/validations/appointment";

export async function getAvailableSlotsAction(
  raw: unknown,
): Promise<Result<Awaited<ReturnType<typeof listAvailableSlots>>>> {
  const parsed = slotsQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Revisá el servicio, profesional y fecha.");
  }

  try {
    const slots = await listAvailableSlots(parsed.data);
    return ok(slots);
  } catch (error) {
    return err(toPublicErrorMessage(error));
  }
}

export async function createPublicBookingAction(
  raw: unknown,
): Promise<Result<{ code: string }>> {
  const parsed = publicBookingSchema.safeParse(raw);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Revisá los datos de la reserva.");
  }

  try {
    const result = await createPublicBooking(parsed.data);
    if (!result.ok) {
      return result;
    }

    revalidatePath(PUBLIC_ROUTES.book);
    revalidatePath(ADMIN_ROUTES.appointments);
    revalidatePath(ADMIN_ROUTES.calendar);
    revalidatePath(ADMIN_ROUTES.customers);
    revalidatePath(ADMIN_ROUTES.dashboard);

    void notifyAppointmentEvent({
      appointmentId: result.data.id,
      eventType: "APPOINTMENT_CONFIRMED",
    }).catch(() => undefined);

    return ok({ code: result.data.code });
  } catch (error) {
    return err(toPublicErrorMessage(error));
  }
}
