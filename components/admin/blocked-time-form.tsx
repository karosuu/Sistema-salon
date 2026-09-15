"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createBlockedTimeAction, deleteBlockedTimeAction } from "@/actions/hours";
import { DatePicker } from "@/components/ui/date-picker";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { costaRicaLocalToUtc } from "@/lib/timezone";

type ProfessionalOption = { id: string; name: string };

export function BlockedTimeForm({
  professionals,
  todayYmd,
}: {
  professionals: ProfessionalOption[];
  todayYmd: string;
}) {
  const router = useRouter();
  const [professionalId, setProfessionalId] = useState("");
  const [date, setDate] = useState(todayYmd);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");
  const [reason, setReason] = useState("");
  const [isHoliday, setIsHoliday] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          setError(null);
          const result = await createBlockedTimeAction({
            professionalId,
            startsAt: costaRicaLocalToUtc(date, start),
            endsAt: costaRicaLocalToUtc(date, end),
            reason,
            isHoliday,
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setReason("");
          router.refresh();
        });
      }}
    >
      <div>
        <Label htmlFor="block-pro">Ámbito</Label>
        <select
          id="block-pro"
          className="mt-1 min-h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm"
          value={professionalId}
          onChange={(event) => setProfessionalId(event.target.value)}
        >
          <option value="">Todo el salón</option>
          {professionals.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="block-date">Fecha</Label>
        <DatePicker id="block-date" value={date} onChange={setDate} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="block-start">Desde</Label>
          <Input id="block-start" type="time" value={start} onChange={(event) => setStart(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="block-end">Hasta</Label>
          <Input id="block-end" type="time" value={end} onChange={(event) => setEnd(event.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="block-reason">Motivo</Label>
        <Input id="block-reason" value={reason} onChange={(event) => setReason(event.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm text-navy">
        <input
          type="checkbox"
          className="h-4 w-4 accent-navy"
          checked={isHoliday}
          onChange={(event) => setIsHoliday(event.target.checked)}
        />
        Feriado / cierre
      </label>
      {error ? <Alert tone="error">{error}</Alert> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Guardando..." : "Agregar bloqueo"}
      </Button>
    </form>
  );
}

export function DeleteBlockedTimeButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await deleteBlockedTimeAction(id);
          router.refresh();
        });
      }}
    >
      Quitar
    </Button>
  );
}
