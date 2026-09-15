"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { upsertCustomerAction } from "@/actions/customers";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { FieldError, Input, Label, Textarea } from "@/components/ui/field";
import { ADMIN_ROUTES } from "@/lib/constants";
import { customerInputSchema, type CustomerInput } from "@/lib/validations/customer";

export function CustomerForm({
  customerId,
  defaults,
}: {
  customerId?: string;
  defaults?: Partial<CustomerInput>;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerInputSchema),
    defaultValues: {
      name: defaults?.name ?? "",
      phone: defaults?.phone ?? "",
      email: defaults?.email ?? "",
      notes: defaults?.notes ?? "",
      preferences: defaults?.preferences ?? "",
      birthDate: defaults?.birthDate ?? "",
    },
  });

  async function onSubmit(values: CustomerInput) {
    setServerError(null);
    const result = await upsertCustomerAction(values, customerId);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    router.push(`${ADMIN_ROUTES.customers}/${result.data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...register("name")} />
        {errors.name?.message ? <FieldError>{errors.name.message}</FieldError> : null}
      </div>
      <div>
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" {...register("phone")} />
        {errors.phone?.message ? <FieldError>{errors.phone.message}</FieldError> : null}
      </div>
      <div>
        <Label htmlFor="email">Correo</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email?.message ? <FieldError>{errors.email.message}</FieldError> : null}
      </div>
      <div>
        <Label htmlFor="birthDate">Fecha de nacimiento</Label>
        <Controller
          name="birthDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              id="birthDate"
              value={field.value ?? ""}
              allowEmpty
              onChange={field.onChange}
            />
          )}
        />
      </div>
      <div>
        <Label htmlFor="preferences">Preferencias</Label>
        <Textarea id="preferences" {...register("preferences")} />
      </div>
      <div>
        <Label htmlFor="notes">Notas internas</Label>
        <Textarea id="notes" {...register("notes")} />
      </div>
      {serverError ? <Alert tone="error">{serverError}</Alert> : null}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
        <ButtonLink href={ADMIN_ROUTES.customers} variant="secondary">
          Cancelar
        </ButtonLink>
      </div>
    </form>
  );
}
