"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { saveBusinessHoursAction } from "@/actions/hours";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError, Input } from "@/components/ui/field";
import { WEEKDAY_LABELS, WEEKDAY_ORDER } from "@/lib/salon/hours";
import {
  businessHoursInputSchema,
  type BusinessHoursInput,
} from "@/lib/validations/hours";

export function BusinessHoursForm({ defaults }: { defaults: BusinessHoursInput["days"] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BusinessHoursInput>({
    resolver: zodResolver(businessHoursInputSchema),
    defaultValues: { days: defaults },
  });
  const days = useWatch({ control, name: "days" }) ?? defaults;

  async function onSubmit(values: BusinessHoursInput) {
    setServerError(null);
    const result = await saveBusinessHoursAction(values);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs tracking-wide text-muted uppercase">
              <th className="py-2 pr-3">Día</th>
              <th className="py-2 pr-3">Cerrado</th>
              <th className="py-2 pr-3">Abre</th>
              <th className="py-2">Cierra</th>
            </tr>
          </thead>
          <tbody>
            {WEEKDAY_ORDER.map((weekday, index) => {
              const closed = days[index]?.isClosed ?? false;
              return (
                <tr key={weekday} className="border-t border-border">
                  <td className="py-2 pr-3 font-medium text-navy">
                    {WEEKDAY_LABELS[weekday]}
                    <input type="hidden" {...register(`days.${index}.weekday`)} />
                  </td>
                  <td className="py-2 pr-3">
                    <input type="checkbox" className="h-4 w-4 accent-navy" {...register(`days.${index}.isClosed`)} />
                  </td>
                  <td className="py-2 pr-3">
                    <Input
                      type="time"
                      readOnly={closed}
                      className={`mt-0 min-h-10 ${closed ? "pointer-events-none opacity-50" : ""}`}
                      {...register(`days.${index}.opensAt`)}
                    />
                  </td>
                  <td className="py-2">
                    <Input
                      type="time"
                      readOnly={closed}
                      className={`mt-0 min-h-10 ${closed ? "pointer-events-none opacity-50" : ""}`}
                      {...register(`days.${index}.closesAt`)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {errors.days?.message ? <FieldError>{errors.days.message}</FieldError> : null}
      {serverError ? <Alert tone="error">{serverError}</Alert> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Guardar horario del salón"}
      </Button>
    </form>
  );
}
