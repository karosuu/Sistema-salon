import { Suspense } from "react";

import { Logo } from "@/components/brand/logo";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/loading";
import { LoginForm } from "@/app/(auth)/admin/iniciar-sesion/login-form";

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <Logo />
        <p className="mt-6 text-xs font-semibold tracking-[0.28em] text-cyan-deep uppercase">
          Acceso del personal
        </p>
        <h1 className="font-display mt-2 text-3xl text-navy">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-muted">
          El panel administrativo está reservado para el personal del salón.
        </p>
        <Suspense fallback={<Spinner className="mt-8" label="Cargando formulario..." />}>
          <LoginForm />
        </Suspense>
      </Card>
    </main>
  );
}
