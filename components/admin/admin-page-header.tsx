import { ButtonLink } from "@/components/ui/button";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
};

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
}: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.22em] text-cyan-deep uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display mt-2 text-3xl text-navy sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <ButtonLink href={actionHref}>{actionLabel}</ButtonLink>
      ) : null}
    </header>
  );
}
