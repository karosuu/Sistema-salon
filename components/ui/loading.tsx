import { cn } from "@/lib/cn";

export function Spinner({
  className,
  label = "Cargando",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm text-muted", className)}>
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-cyan border-t-transparent"
        aria-hidden
      />
      <span>{label}</span>
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-cream-deep", className)}
      aria-hidden
    />
  );
}

export function PageLoading() {
  return (
    <div className="flex min-h-48 items-center justify-center">
      <Spinner label="Cargando contenido..." />
    </div>
  );
}
