"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  createProfessionalAction,
  updateProfessionalAction,
} from "@/actions/professionals";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { FieldError, FieldHint, Input, Label, Textarea } from "@/components/ui/field";
import { ADMIN_ROUTES } from "@/lib/constants";
import { WEEKDAY_LABELS, WEEKDAY_ORDER, defaultProfessionalAvailability } from "@/lib/salon/hours";
import {
  professionalInputSchema,
  type ProfessionalInput,
} from "@/lib/validations/professional";

type ServiceOption = {
  id: string;
  name: string;
  isActive: boolean;
};

type ProfessionalFormProps = {
  mode: "create" | "edit";
  professionalId?: string;
  services: ServiceOption[];
  defaults?: Partial<ProfessionalInput>;
};

export function ProfessionalForm({
  mode,
  professionalId,
  services,
  defaults,
}: ProfessionalFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfessionalInput>({
    resolver: zodResolver(professionalInputSchema),
    defaultValues: {
      name: defaults?.name ?? "",
      bio: defaults?.bio ?? "",
      photoUrl: defaults?.photoUrl ?? "",
      isActive: defaults?.isActive ?? true,
      serviceIds: defaults?.serviceIds ?? [],
      availability: defaults?.availability ?? defaultProfessionalAvailability(),
    },
  });

  const selectedIds = useWatch({ control, name: "serviceIds" }) ?? [];
  const availability =
    useWatch({ control, name: "availability" }) ?? defaultProfessionalAvailability();

  function toggleService(id: string, checked: boolean) {
    const next = checked
      ? [...new Set([...selectedIds, id])]
      : selectedIds.filter((item) => item !== id);
    setValue("serviceIds", next, { shouldValidate: true, shouldDirty: true });
  }

  async function onSubmit(values: ProfessionalInput) {
    setServerError(null);
    const result =
      mode === "edit" && professionalId
        ? await updateProfessionalAction(professionalId, values)
        : await createProfessionalAction(values);

    if (!result.ok) {
      setServerError(result.error);
      return;
    }

    router.push(
      `${ADMIN_ROUTES.professionals}?aviso=${mode === "create" ? "creado" : "guardado"}`,
    );
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" autoComplete="off" {...register("name")} />
        {errors.name?.message ? <FieldError>{errors.name.message}</FieldError> : null}
      </div>

      <div>
        <Label htmlFor="bio">Biografía</Label>
        <Textarea id="bio" {...register("bio")} />
        {errors.bio?.message ? <FieldError>{errors.bio.message}</FieldError> : null}
      </div>

      <div>
        <Label htmlFor="photoUrl">Foto (opcional)</Label>
        <Input
          id="photoUrl"
          type="text"
          inputMode="url"
          placeholder="https://… o /logo.svg"
          {...register("photoUrl")}
        />
        <FieldHint>
          URL pública o ruta del sitio. Si queda vacía, se muestran las iniciales.
        </FieldHint>
        {errors.photoUrl?.message ? <FieldError>{errors.photoUrl.message}</FieldError> : null}
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-navy">Servicios que realiza</legend>
        {services.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Primero creá servicios en el catálogo para poder asignarlos.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {services.map((service) => (
              <li key={service.id}>
                <label className="flex items-center gap-3 text-sm text-navy">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-navy"
                    checked={selectedIds.includes(service.id)}
                    onChange={(event) => toggleService(service.id, event.target.checked)}
                  />
                  <span>
                    {service.name}
                    {service.isActive ? null : (
                      <span className="ml-2 text-xs text-muted">(inactivo)</span>
                    )}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
        {errors.serviceIds?.message ? (
          <FieldError>{errors.serviceIds.message}</FieldError>
        ) : null}
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-navy">Horario semanal</legend>
        <FieldHint>
          Horas locales de Costa Rica. El motor de huecos libres se conecta en la etapa de
          disponibilidad.
        </FieldHint>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs tracking-wide text-muted uppercase">
                <th className="py-2 pr-3">Día</th>
                <th className="py-2 pr-3">Descanso</th>
                <th className="py-2 pr-3">Entra</th>
                <th className="py-2">Sale</th>
              </tr>
            </thead>
            <tbody>
              {WEEKDAY_ORDER.map((weekday, index) => {
                const day = availability[index];
                const off = day?.isOff ?? false;
                return (
                  <tr key={weekday} className="border-t border-border">
                    <td className="py-2 pr-3 font-medium text-navy">
                      {WEEKDAY_LABELS[weekday]}
                      <input type="hidden" {...register(`availability.${index}.weekday`)} />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-navy"
                        aria-label={`${WEEKDAY_LABELS[weekday]} no trabaja`}
                        {...register(`availability.${index}.isOff`)}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <Input
                        type="time"
                        readOnly={off}
                        aria-label={`Entrada ${WEEKDAY_LABELS[weekday]}`}
                        className={`mt-0 min-h-10 ${off ? "pointer-events-none opacity-50" : ""}`}
                        {...register(`availability.${index}.startsAt`)}
                      />
                    </td>
                    <td className="py-2">
                      <Input
                        type="time"
                        readOnly={off}
                        aria-label={`Salida ${WEEKDAY_LABELS[weekday]}`}
                        className={`mt-0 min-h-10 ${off ? "pointer-events-none opacity-50" : ""}`}
                        {...register(`availability.${index}.endsAt`)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {errors.availability?.message ? (
          <FieldError>{errors.availability.message}</FieldError>
        ) : null}
        {errors.availability?.root?.message ? (
          <FieldError>{errors.availability.root.message}</FieldError>
        ) : null}
      </fieldset>

      <div>
        <label className="flex items-center gap-3 text-sm text-navy">
          <input type="checkbox" className="h-4 w-4 accent-navy" {...register("isActive")} />
          Profesional activo (visible en la web y en reservas)
        </label>
      </div>

      {serverError ? <Alert tone="error">{serverError}</Alert> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" disabled={isSubmitting || services.length === 0}>
          {isSubmitting
            ? "Guardando..."
            : mode === "create"
              ? "Crear profesional"
              : "Guardar cambios"}
        </Button>
        <ButtonLink href={ADMIN_ROUTES.professionals} variant="secondary">
          Cancelar
        </ButtonLink>
      </div>
    </form>
  );
}
