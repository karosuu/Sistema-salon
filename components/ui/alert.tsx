import { cn } from "@/lib/cn";

const tones = {
  success: "border-success/30 bg-success-soft text-success",
  error: "border-danger/30 bg-danger-soft text-danger",
  info: "border-cyan/30 bg-cyan/10 text-cyan-deep",
} as const;

type AlertProps = {
  tone?: keyof typeof tones;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function Alert({ tone = "info", title, children, className }: AlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-[var(--radius-md)] border px-4 py-3 text-sm",
        tones[tone],
        className,
      )}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={title ? "mt-1" : undefined}>{children}</div>
    </div>
  );
}
