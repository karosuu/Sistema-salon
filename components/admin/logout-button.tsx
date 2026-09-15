"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ADMIN_ROUTES } from "@/lib/constants";

export function LogoutButton() {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={async () => {
        await signOut({ redirect: false });
        router.push(ADMIN_ROUTES.login);
        router.refresh();
      }}
    >
      Cerrar sesión
    </Button>
  );
}
