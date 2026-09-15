"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  createPublicBookingAction,
  getAvailableSlotsAction,
} from "@/actions/booking";
import { ProfessionalPhoto } from "@/components/public/professional-card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { FieldError, FieldHint, Input, Label, Textarea } from "@/components/ui/field";
import { ANY_PROFESSIONAL_ID, BOOKING_HORIZON_DAYS } from "@/lib/availability/engine";
import { PUBLIC_ROUTES } from "@/lib/constants";
import { formatCrc, formatDuration } from "@/lib/money";
import { WEEKDAY_LABELS } from "@/lib/salon/hours";
import { addCalendarDays, formatDateCR, formatYmdLong, weekdayFromYmd } from "@/lib/timezone";

type ServiceOption = {
  id: string;
  name: string;
  description: string;
  priceCrc: number;
  durationMin: number;
};

type ProfessionalOption = {
  id: string;
  name: string;
  bio: string;
  photoUrl: string | null;
  serviceIds: string[];
};

type SlotOption = {
  startsAt: string;
  label: string;
  professionalName: string;
};

const STEPS = [
  "Servicio",
  "Profesional",
  "Fecha",
  "Horario",
  "Tus datos",
  "Resumen",
] as const;

export function BookingWizard({
  services,
  professionals,
  todayYmd,
}: {
  services: ServiceOption[];
  professionals: ProfessionalOption[];
  todayYmd: string;
}) {
  const router = useRouter();
  const maxYmd = addCalendarDays(todayYmd, BOOKING_HORIZON_DAYS);
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [ymd, setYmd] = useState(todayYmd);
  const [slot, setSlot] = useState<SlotOption | null>(null);
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const service = services.find((item) => item.id === serviceId) ?? null;
  const compatible = useMemo(
    () =>
      serviceId
        ? professionals.filter((item) => item.serviceIds.includes(serviceId))
        : [],
    [professionals, serviceId],
  );
  const professional =
    professionalId && professionalId !== ANY_PROFESSIONAL_ID
      ? compatible.find((item) => item.id === professionalId) ?? null
      : null;
  const selectedDateLabel = `${WEEKDAY_LABELS[weekdayFromYmd(ymd)]}, ${formatYmdLong(ymd)}`;

  function go(next: number) {
    setError(null);
    setStep(next);
  }

  function loadSlots(nextYmd: string, nextProfessionalId: string, nextServiceId: string) {
    startTransition(async () => {
      setError(null);
      const result = await getAvailableSlotsAction({
        serviceId: nextServiceId,
        professionalId: nextProfessionalId,
        ymd: nextYmd,
      });
      if (!result.ok) {
        setSlots([]);
        setError(result.error);
        return;
      }
      setSlots(result.data);
      setSlot(null);
    });
  }

  function confirm() {
    if (!service || !professionalId || !slot) {
      setError("Completá los pasos de la reserva.");
      return;
    }
    startTransition(async () => {
      setError(null);
      const result = await createPublicBookingAction({
        serviceId: service.id,
        professionalId,
        startsAt: slot.startsAt,
        customerName,
        customerPhone,
        customerEmail,
        notes,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`${PUBLIC_ROUTES.bookingConfirmation}/${result.data.code}`);
    });
  }

  return (
    <div className="space-y-6">
      <ol className="flex flex-wrap gap-2" aria-label="Pasos de la reserva">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              index === step
                ? "bg-navy text-white"
                : index < step
                  ? "bg-cyan/15 text-cyan-deep"
                  : "bg-cream-deep text-muted"
            }`}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      {error ? <Alert tone="error">{error}</Alert> : null}

      {step === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setServiceId(item.id);
                setProfessionalId(null);
                setSlot(null);
                go(1);
              }}
              className="text-left"
            >
              <Card className={item.id === serviceId ? "ring-2 ring-navy" : ""}>
                <h3 className="font-display text-2xl text-navy">{item.name}</h3>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
                <p className="mt-4 text-sm font-semibold text-navy">
                  {formatCrc(item.priceCrc)} · {formatDuration(item.durationMin)}
                </p>
              </Card>
            </button>
          ))}
        </div>
      ) : null}

      {step === 1 && service ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setProfessionalId(ANY_PROFESSIONAL_ID);
              go(2);
            }}
            className="text-left"
          >
            <Card className={professionalId === ANY_PROFESSIONAL_ID ? "ring-2 ring-navy" : ""}>
              <h3 className="font-display text-2xl text-navy">Cualquier profesional</h3>
              <p className="mt-2 text-sm text-muted">
                Te asignamos a alguien activo, compatible con {service.name} y libre en el horario
                que elijas.
              </p>
            </Card>
          </button>
          {compatible.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setProfessionalId(item.id);
                go(2);
              }}
              className="text-left"
            >
              <Card className={item.id === professionalId ? "ring-2 ring-navy" : ""}>
                <ProfessionalPhoto name={item.name} photoUrl={item.photoUrl} size="sm" />
                <h3 className="font-display mt-3 text-2xl text-navy">{item.name}</h3>
                <p className="mt-2 text-sm text-muted">{item.bio}</p>
              </Card>
            </button>
          ))}
          {compatible.length === 0 ? (
            <p className="text-sm text-muted">Nadie activo tiene este servicio asignado todavía.</p>
          ) : null}
        </div>
      ) : null}

      {step === 2 && service && professionalId ? (
        <Card className="max-w-md">
          <Label htmlFor="fecha">Fecha</Label>
          <DatePicker
            id="fecha"
            value={ymd}
            min={todayYmd}
            max={maxYmd}
            onChange={setYmd}
          />
          <FieldHint>Horario local de Costa Rica. Podés reservar hasta {BOOKING_HORIZON_DAYS} días adelante.</FieldHint>
          <Button
            className="mt-4"
            type="button"
            onClick={() => {
              loadSlots(ymd, professionalId, service.id);
              go(3);
            }}
          >
            Ver horarios
          </Button>
        </Card>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-cyan-deep uppercase">
              Horarios para
            </p>
            <h2 className="font-display mt-1 text-2xl text-navy sm:text-3xl">{selectedDateLabel}</h2>
            <p className="mt-2 text-sm text-muted">
              Horas en Costa Rica. Elegí un espacio libre; con Volver podés cambiar el día.
            </p>
          </div>
          {pending && slots.length === 0 ? (
            <p className="text-sm text-muted">Buscando horarios libres…</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted">
              No hay horarios libres el {selectedDateLabel}. Probá otra fecha o profesional.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2" role="list" aria-label={`Horas libres el ${selectedDateLabel}`}>
              {slots.map((item) => (
                <Button
                  key={item.startsAt}
                  type="button"
                  variant={slot?.startsAt === item.startsAt ? "primary" : "secondary"}
                  size="sm"
                  aria-label={`${selectedDateLabel} a las ${item.label}`}
                  onClick={() => {
                    setSlot(item);
                    go(4);
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {step === 4 ? (
        <Card className="max-w-xl space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              inputMode="tel"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
            />
            <FieldHint>Sin contraseña. Si ya nos escribiste, reutilizamos tu ficha por teléfono.</FieldHint>
          </div>
          <div>
            <Label htmlFor="correo">Correo (opcional)</Label>
            <Input
              id="correo"
              type="email"
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea id="notas" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>
          {!customerName.trim() || customerPhone.replace(/\D/g, "").length < 8 ? (
            <FieldError>Nombre y teléfono son obligatorios.</FieldError>
          ) : (
            <Button type="button" onClick={() => go(5)}>
              Revisar resumen
            </Button>
          )}
        </Card>
      ) : null}

      {step === 5 && service && slot ? (
        <Card className="max-w-xl space-y-3">
          <h2 className="font-display text-2xl text-navy">Resumen</h2>
          <p className="text-sm text-muted">
            {service.name} · {formatDuration(service.durationMin)} · {formatCrc(service.priceCrc)}
          </p>
          <p className="text-sm text-muted">
            {professionalId === ANY_PROFESSIONAL_ID
              ? `Cualquier profesional (propuesta: ${slot.professionalName})`
              : professional?.name}
          </p>
          <p className="text-sm text-muted">
            {formatDateCR(new Date(slot.startsAt))} · {slot.label}
          </p>
          <p className="text-sm text-muted">
            {customerName} · {customerPhone}
            {customerEmail ? ` · ${customerEmail}` : ""}
          </p>
          <Button type="button" onClick={confirm} disabled={pending}>
            {pending ? "Confirmando..." : "Confirmar reserva"}
          </Button>
        </Card>
      ) : null}

      {step > 0 ? (
        <Button type="button" variant="ghost" onClick={() => go(step - 1)}>
          Volver
        </Button>
      ) : null}
    </div>
  );
}
