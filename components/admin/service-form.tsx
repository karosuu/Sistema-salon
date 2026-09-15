"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createServiceAction, updateServiceAction } from "@/actions/services";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { FieldError, FieldHint, Input, Label, Textarea } from "@/components/ui/field";
import { ADMIN_ROUTES } from "@/lib/constants";
import { serviceInputSchema, type ServiceInput } from "@/lib/validations/service";

type ServiceFormProps = {
  mode: "create" | "edit";
  serviceId?: string;
  defaults?: Partial<ServiceInput>;
};

export function ServiceForm({ mode, serviceId, defaults }: ServiceFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceInputSchema),
    defaultValues: {
      name: defaults?.name ?? "",
      description: defaults?.description ?? "",
      priceCrc: defaults?.priceCrc ?? 0,
      durationMin: defaults?.durationMin ?? 60,
      imageUrl: defaults?.imageUrl ?? "",
      isActive: defaults?.isActive ?? true,
    },
  });

  async function onSubmit(values: ServiceInput) {
    setServerError(null);
    const result =
      mode === "edit" && serviceId
        ? await updateServiceAction(serviceId, values)
        : await createServiceAction(values);

    if (!result.ok) {
      setServerError(result.error);
      return;
    }

    router.push(
      `${ADMIN_ROUTES.services}?aviso=${mode === "create" ? "creado" : "guardado"}`,
    );
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" autoComplete="off" {...register("name")} />
        {errors.name?.message ? <FieldError>{errors.name.message}</FieldError> : null}
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" {...register("description")} />
        {errors.description?.message ? (
          <FieldError>{errors.description.message}</FieldError>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="priceCrc">Precio (colones)</Label>
          <Input
            id="priceCrc"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            {...register("priceCrc", { valueAsNumber: true })}
          />
          <FieldHint>Entero en CRC, sin decimales. Ejemplo: 18000</FieldHint>
          {errors.priceCrc?.message ? <FieldError>{errors.priceCrc.message}</FieldError> : null}
        </div>
        <div>
          <Label htmlFor="durationMin">Duración (minutos)</Label>
          <Input
            id="durationMin"
            type="number"
            inputMode="numeric"
            min={15}
            max={480}
            step={5}
            {...register("durationMin", { valueAsNumber: true })}
          />
          <FieldHint>Entre 15 y 480 minutos.</FieldHint>
          {errors.durationMin?.message ? (
            <FieldError>{errors.durationMin.message}</FieldError>
          ) : null}
        </div>
      </div>

      <div>
        <Label htmlFor="imageUrl">Imagen (opcional)</Label>
        <Input
          id="imageUrl"
          type="text"
          inputMode="url"
          placeholder="https://… o /logo.svg"
          {...register("imageUrl")}
        />
        <FieldHint>
          URL pública o ruta del sitio que empiece con /. Si la dejás vacía, se muestra un
          placeholder.
        </FieldHint>
        {errors.imageUrl?.message ? <FieldError>{errors.imageUrl.message}</FieldError> : null}
      </div>

      <div>
        <label className="flex items-center gap-3 text-sm text-navy">
          <input
            type="checkbox"
            className="h-4 w-4 accent-navy"
            {...register("isActive")}
          />
          Servicio activo (visible en la web pública)
        </label>
      </div>

      {serverError ? <Alert tone="error">{serverError}</Alert> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando..."
            : mode === "create"
              ? "Crear servicio"
              : "Guardar cambios"}
        </Button>
        <ButtonLink href={ADMIN_ROUTES.services} variant="secondary">
          Cancelar
        </ButtonLink>
      </div>
    </form>
  );
}
