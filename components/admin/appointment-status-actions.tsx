"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AppointmentStatus } from "@prisma/client";

import { setAppointmentStatusAction } from "@/actions/appointments";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { appointmentStatusLabel } from "@/lib/appointments/status";

const OPTIONS: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
  "NO_SHOW",
];

export function AppointmentStatusActions({
  id,
  status,
}: {
  id: string;
  status: AppointmentStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {OPTIONS.filter((item) => item !== status).map((item) => (
          <Button
            key={item}
            type="button"
            size="sm"
            variant={item === "CANCELLED" ? "danger" : "secondary"}
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                setError(null);
                const result = await setAppointmentStatusAction(id, item);
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                router.refresh();
              });
            }}
          >
            {appointmentStatusLabel(item)}
          </Button>
        ))}
      </div>
      {error ? <Alert tone="error">{error}</Alert> : null}
    </div>
  );
}
