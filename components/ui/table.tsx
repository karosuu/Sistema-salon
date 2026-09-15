import { cn } from "@/lib/cn";

export function Table({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface">
      <table className={cn("min-w-full text-left text-sm", className)}>
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-cream-deep text-xs tracking-wide text-muted uppercase">
      {children}
    </thead>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("px-4 py-3 font-semibold whitespace-nowrap", className)}>
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-4 py-3 text-ink", className)}>
      {children}
    </td>
  );
}
