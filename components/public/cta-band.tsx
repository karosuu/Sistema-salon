import { ButtonLink } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/lib/constants";

type CtaBandProps = {
  title: string;
  body: string;
  whatsappHref: string;
};

export function CtaBand({ title, body, whatsappHref }: CtaBandProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-navy px-6 py-10 text-white sm:px-12 sm:py-14">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/demo/galeria/detalle.png"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/70" aria-hidden />
        <div className="relative max-w-xl">
          <p className="text-xs font-semibold tracking-[0.22em] text-cyan uppercase">Citas</p>
          <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-base">{body}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={PUBLIC_ROUTES.book} variant="secondary" size="lg">
              Reservar cita
            </ButtonLink>
            <ButtonLink href={whatsappHref} variant="whatsapp" size="lg" target="_blank">
              WhatsApp
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
