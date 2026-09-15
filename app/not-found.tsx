import { ButtonLink } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-16">
      <h1 className="font-display text-4xl text-navy">Página no encontrada</h1>
      <p className="mt-3 text-muted">
        El enlace no existe o ya no está disponible.
      </p>
      <ButtonLink href={PUBLIC_ROUTES.home} className="mt-6 w-fit">
        Volver al inicio
      </ButtonLink>
    </main>
  );
}
