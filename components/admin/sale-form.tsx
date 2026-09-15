"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createSaleAction } from "@/actions/customers";
import { DatePicker } from "@/components/ui/date-picker";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

export function SaleForm({ customerId, todayYmd }: { customerId: string; todayYmd: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("0");
  const [description, setDescription] = useState("");
  const [occurredOn, setOccurredOn] = useState(todayYmd);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          setError(null);
          const result = await createSaleAction({
            customerId,
            amountCrc: Number(amount),
            description,
            occurredOn,
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setDescription("");
          setAmount("0");
          router.refresh();
        });
      }}
    >
      <div>
        <Label htmlFor="sale-amount">Monto (₡)</Label>
        <Input
          id="sale-amount"
          type="number"
          min={0}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="sale-desc">Descripción</Label>
        <Input
          id="sale-desc"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="sale-date">Fecha</Label>
        <DatePicker id="sale-date" value={occurredOn} onChange={setOccurredOn} />
      </div>
      {error ? <Alert tone="error">{error}</Alert> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Guardando..." : "Registrar venta"}
      </Button>
    </form>
  );
}
