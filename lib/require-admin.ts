import "server-only";

import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth";
import { ADMIN_ROUTES } from "@/lib/constants";
import { UnauthorizedError } from "@/lib/errors";

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session?.user?.id) {
    redirect(ADMIN_ROUTES.login);
  }

  return session;
}

export async function assertAdminSession() {
  const session = await getAdminSession();

  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  return session;
}
