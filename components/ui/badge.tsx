import { cn } from "@/lib/cn";

const tones = {
  navy: "bg-navy/10 text-navy",
  cyan: "bg-cyan/15 text-cyan-deep",
  violet: "bg-violet/10 text-violet",
  magenta: "bg-magenta/10 text-magenta",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  muted: "bg-cream-deep text-muted",
} as const;

type BadgeProps = {
  tone?: keyof typeof tones;
  className?: string;
  children: React.ReactNode;
};

export function Badge({ tone = "navy", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
