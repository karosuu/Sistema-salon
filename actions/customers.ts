"use server";

import { revalidatePath } from "next/cache";

import { ADMIN_ROUTES } from "@/lib/constants";
import { createSaleRecord, upsertCustomerRecord } from "@/lib/data/customers";
import { toPublicErrorMessage } from "@/lib/errors";
import { assertAdminSession } from "@/lib/require-admin";
import { err, ok, type Result } from "@/lib/result";
import { costaRicaLocalToUtc } from "@/lib/timezone";
import {
  customerIdSchema,
  customerInputSchema,
  saleInputSchema,
} from "@/lib/validations/customer";

function revalidateCustomers() {
  revalidatePath(ADMIN_ROUTES.customers);
  revalidatePath(ADMIN_ROUTES.dashboard);
}

export async function upsertCustomerAction(
  raw: unknown,
  id?: unknown,
): Promise<Result<{ id: string }>> {
  await assertAdminSession();

  const parsed = customerInputSchema.safeParse(raw);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Revisá los datos del cliente.");
  }

  const idResult = id === undefined ? ok(undefined) : (() => {
    const parsedId = customerIdSchema.safeParse(id);
    return parsedId.success ? ok(parsedId.data) : err("Identificador inválido.");
  })();
  if (!idResult.ok) {
    return idResult;
  }

  try {
    const result = await upsertCustomerRecord(parsed.data, idResult.data);
    if (!result.ok) {
      return result;
    }
    revalidateCustomers();
    revalidatePath(`${ADMIN_ROUTES.customers}/${result.data.id}`);
    return result;
  } catch (error) {
    return err(toPublicErrorMessage(error));
  }
}

export async function createSaleAction(raw: unknown): Promise<Result<{ id: string }>> {
  await assertAdminSession();

  const parsed = saleInputSchema.safeParse(raw);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Revisá los datos de la venta.");
  }

  try {
    const result = await createSaleRecord({
      customerId: parsed.data.customerId,
      amountCrc: parsed.data.amountCrc,
      description: parsed.data.description,
      occurredAt: costaRicaLocalToUtc(parsed.data.occurredOn, "12:00"),
    });
    if (!result.ok) {
      return result;
    }
    revalidateCustomers();
    revalidatePath(`${ADMIN_ROUTES.customers}/${parsed.data.customerId}`);
    return result;
  } catch (error) {
    return err(toPublicErrorMessage(error));
  }
}
