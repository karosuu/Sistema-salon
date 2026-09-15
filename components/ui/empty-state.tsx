import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <Card className="mx-auto max-w-lg text-center">
      <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-br from-cyan via-violet to-magenta opacity-80" />
      <h2 className="font-display text-2xl text-navy">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      {actionHref && actionLabel ? (
        <ButtonLink href={actionHref} className="mt-5">
          {actionLabel}
        </ButtonLink>
      ) : null}
    </Card>
  );
}
