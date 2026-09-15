import { cn } from "@/lib/cn";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-sm font-medium text-navy", className)}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "mt-1 min-h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 text-ink placeholder:text-muted/70",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "mt-1 min-h-28 w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-ink placeholder:text-muted/70",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "mt-1 min-h-11 w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1 text-sm text-danger" role="alert">
      {children}
    </p>
  );
}

export function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-sm text-muted">{children}</p>;
}
