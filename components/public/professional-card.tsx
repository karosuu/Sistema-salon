import { HoursList } from "@/components/public/hours-list";
import { Card } from "@/components/ui/card";
import type { PublicProfessional } from "@/lib/data/catalog";

function initials(name: string): string {
  return name
    .replace(" (DEMO)", "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

export function ProfessionalPhoto({
  name,
  photoUrl,
  size = "md",
}: {
  name: string;
  photoUrl: string | null;
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? "h-12 w-12 text-sm" : "h-16 w-16 text-base";

  if (photoUrl) {
    return (
      <div className={`${box} overflow-hidden rounded-full bg-cream-deep`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt={name} className="h-full w-full object-cover object-center" />
      </div>
    );
  }

  return (
    <div
      className={`${box} flex items-center justify-center rounded-full bg-gradient-to-br from-cyan via-violet to-magenta font-semibold text-white`}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

export function ProfessionalCard({
  professional,
  showHours = true,
}: {
  professional: PublicProfessional;
  showHours?: boolean;
}) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden p-0 transition-shadow duration-300 hover:shadow-[var(--shadow-float)]">
      <div className="relative aspect-[3/4] overflow-hidden bg-cream-deep">
        {professional.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={professional.photoUrl}
            alt={professional.name}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan via-violet to-magenta text-4xl font-semibold text-white"
            aria-hidden
          >
            {initials(professional.name)}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-2xl text-navy">{professional.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{professional.bio}</p>
        {professional.services.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {professional.services.map((service) => (
              <span
                key={service.id}
                className="rounded-full bg-cyan/15 px-3 py-1 text-xs font-medium text-cyan-deep"
              >
                {service.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">Sin servicios activos asignados.</p>
        )}
        {showHours && professional.hours.length > 0 ? (
          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-2 text-xs font-semibold tracking-wide text-navy uppercase">
              Disponibilidad
            </p>
            <HoursList hours={professional.hours} />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
