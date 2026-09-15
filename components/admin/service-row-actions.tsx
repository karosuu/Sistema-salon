"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteServiceAction, setServiceActiveAction } from "@/actions/services";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type ServiceRowActionsProps = {
  id: string;
  name: string;
  isActive: boolean;
  appointmentCount: number;
};

export function ServiceRowActions({
  id,
  name,
  isActive,
  appointmentCount,
}: ServiceRowActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canDelete = appointmentCount === 0;

  function toggleActive() {
    setError(null);
    startTransition(async () => {
      const result = await setServiceActiveAction(id, !isActive);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function confirmDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteServiceAction(id);
      if (!result.ok) {
        setError(result.error);
        setConfirmOpen(false);
        return;
      }
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={toggleActive}
          disabled={pending}
        >
          {isActive ? "Desactivar" : "Activar"}
        </Button>
        {canDelete ? (
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={pending}
          >
            Eliminar
          </Button>
        ) : (
          <Button type="button" variant="ghost" size="sm" disabled>
            Eliminar
          </Button>
        )}
      </div>
      {!canDelete ? (
        <p className="max-w-xs text-right text-xs text-muted">
          Tiene {appointmentCount} cita{appointmentCount === 1 ? "" : "s"}. Preferí
          desactivarlo.
        </p>
      ) : null}
      {error ? <Alert tone="error">{error}</Alert> : null}

      {canDelete ? (
        <Modal
          open={confirmOpen}
          title="Eliminar servicio"
          onClose={() => setConfirmOpen(false)}
        >
          <p className="text-sm leading-relaxed text-muted">
            ¿Eliminar <span className="font-semibold text-navy">{name}</span>? Esta acción
            no se puede deshacer. Solo está permitida porque no hay citas históricas.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="button" variant="danger" onClick={confirmDelete} disabled={pending}>
              {pending ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
