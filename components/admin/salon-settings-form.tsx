"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { updateSalonSettingsAction } from "@/actions/settings";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError, FieldHint, Input, Label, Textarea } from "@/components/ui/field";
import { salonSettingsSchema, type SalonSettingsInput } from "@/lib/validations/salon";

export function SalonSettingsForm({ defaults }: { defaults: SalonSettingsInput }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SalonSettingsInput>({
    resolver: zodResolver(salonSettingsSchema),
    defaultValues: defaults,
  });

  async function onSubmit(values: SalonSettingsInput) {
    setServerError(null);
    setSaved(false);
    const result = await updateSalonSettingsAction(values);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label htmlFor="name">Nombre del salón</Label>
        <Input id="name" autoComplete="organization" {...register("name")} />
        {errors.name?.message ? <FieldError>{errors.name.message}</FieldError> : null}
      </div>

      <div>
        <Label htmlFor="tagline">Eslogan</Label>
        <Input id="tagline" {...register("tagline")} />
        <FieldHint>Texto corto bajo el nombre en el pie y en contacto.</FieldHint>
        {errors.tagline?.message ? <FieldError>{errors.tagline.message}</FieldError> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
          {errors.phone?.message ? <FieldError>{errors.phone.message}</FieldError> : null}
        </div>
        <div>
          <Label htmlFor="email">Correo</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email?.message ? <FieldError>{errors.email.message}</FieldError> : null}
        </div>
      </div>

      <div>
        <Label htmlFor="whatsappNumber">WhatsApp</Label>
        <Input id="whatsappNumber" inputMode="numeric" {...register("whatsappNumber")} />
        <FieldHint>
          Número para wa.me, con código de país y sin +. Ejemplo DEMO: 50600000000. No se envían
          mensajes automáticos.
        </FieldHint>
        {errors.whatsappNumber?.message ? (
          <FieldError>{errors.whatsappNumber.message}</FieldError>
        ) : null}
      </div>

      <div>
        <Label htmlFor="whatsappMessage">Mensaje inicial de WhatsApp</Label>
        <Textarea id="whatsappMessage" {...register("whatsappMessage")} />
        {errors.whatsappMessage?.message ? (
          <FieldError>{errors.whatsappMessage.message}</FieldError>
        ) : null}
      </div>

      <div>
        <Label htmlFor="address">Dirección</Label>
        <Textarea id="address" {...register("address")} />
        {errors.address?.message ? <FieldError>{errors.address.message}</FieldError> : null}
      </div>

      <div>
        <Label htmlFor="instagramUrl">Instagram</Label>
        <Input id="instagramUrl" placeholder="https://" {...register("instagramUrl")} />
        {errors.instagramUrl?.message ? (
          <FieldError>{errors.instagramUrl.message}</FieldError>
        ) : null}
      </div>

      <div>
        <Label htmlFor="facebookUrl">Facebook</Label>
        <Input id="facebookUrl" placeholder="https://" {...register("facebookUrl")} />
        {errors.facebookUrl?.message ? (
          <FieldError>{errors.facebookUrl.message}</FieldError>
        ) : null}
      </div>

      <div>
        <Label htmlFor="tiktokUrl">TikTok</Label>
        <Input id="tiktokUrl" placeholder="https://" {...register("tiktokUrl")} />
        {errors.tiktokUrl?.message ? <FieldError>{errors.tiktokUrl.message}</FieldError> : null}
      </div>

      <FieldHint>Zona horaria America/Costa_Rica y moneda CRC. No se editan aquí.</FieldHint>

      {serverError ? <Alert tone="error">{serverError}</Alert> : null}
      {saved ? <Alert tone="success">Cambios guardados. La web pública usa estos datos.</Alert> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
