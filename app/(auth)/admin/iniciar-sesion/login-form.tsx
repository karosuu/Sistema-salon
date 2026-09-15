"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { ADMIN_ROUTES } from "@/lib/constants";
import { loginSchema } from "@/lib/validations/auth";

function safeAdminPath(raw: string | null): string {
  if (!raw) {
    return ADMIN_ROUTES.dashboard;
  }

  let path = raw;
  try {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      const url = new URL(raw);
      path = `${url.pathname}${url.search}`;
    }
  } catch {
    return ADMIN_ROUTES.dashboard;
  }

  if (!path.startsWith("/admin") || path.startsWith(ADMIN_ROUTES.login)) {
    return ADMIN_ROUTES.dashboard;
  }

  return path;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);

    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisá los datos ingresados.");
      return;
    }

    setPending(true);

    const destination = safeAdminPath(searchParams.get("callbackUrl"));
    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
      callbackUrl: destination,
    });

    setPending(false);

    if (!result || result.error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }

    router.push(destination);
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="mt-8 space-y-4">
      <div>
        <Label htmlFor="email">Correo</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {error ? <Alert tone="error">{error}</Alert> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Ingresando..." : "Iniciar sesión"}
      </Button>
    </form>
  );
}
