import { Badge } from "@/components/ui/badge";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="mx-auto w-full max-w-6xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16 sm:pb-10">
      {eyebrow ? <Badge tone="cyan">{eyebrow}</Badge> : null}
      <h1 className="font-display mt-3 text-4xl tracking-tight text-navy sm:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {description}
        </p>
      ) : null}
    </header>
  );
}
