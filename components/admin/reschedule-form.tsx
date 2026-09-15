"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { getAvailableSlotsAction } from "@/actions/booking";
import { rescheduleAppointmentAction } from "@/actions/appointments";
import { DatePicker } from "@/components/ui/date-picker";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/field";

export function RescheduleForm({
  appointmentId,
  serviceId,
  professionalId,
  todayYmd,
}: {
  appointmentId: string;
  serviceId: string;
  professionalId: string;
  todayYmd: string;
}) {
  const router = useRouter();
  const [ymd, setYmd] = useState(todayYmd);
  const [startsAt, setStartsAt] = useState("");
  const [slots, setSlots] = useState<Array<{ startsAt: string; label: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function load() {
    startTransition(async () => {
      setError(null);
      const result = await getAvailableSlotsAction({
        serviceId,
        professionalId,
        ymd,
        ignoreAppointmentId: appointmentId,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSlots(result.data);
    });
  }

  function save() {
    if (!startsAt) {
      setError("Elegí un horario.");
      return;
    }
    startTransition(async () => {
      setError(null);
      const result = await rescheduleAppointmentAction({
        appointmentId,
        startsAt,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="re-fecha">Nueva fecha</Label>
        <DatePicker id="re-fecha" value={ymd} min={todayYmd} onChange={setYmd} />
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={load} disabled={pending}>
        Ver huecos libres
      </Button>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => (
          <Button
            key={slot.startsAt}
            type="button"
            size="sm"
            variant={startsAt === slot.startsAt ? "primary" : "secondary"}
            onClick={() => setStartsAt(slot.startsAt)}
          >
            {slot.label}
          </Button>
        ))}
      </div>
      {error ? <Alert tone="error">{error}</Alert> : null}
      <Button type="button" onClick={save} disabled={pending || !startsAt}>
        {pending ? "Guardando..." : "Reprogramar"}
      </Button>
    </div>
  );
}
