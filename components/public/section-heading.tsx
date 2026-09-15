type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: SectionHeadingProps) {
  return (
    <div className="mb-8">
      {eyebrow ? (
        <p className="text-xs font-semibold tracking-[0.22em] text-cyan-deep uppercase">
          {eyebrow}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-3xl tracking-tight text-navy sm:text-4xl">{title}</h2>
        {action}
      </div>
      {description ? (
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
