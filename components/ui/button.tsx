import Link from "next/link";

import { cn } from "@/lib/cn";

const variants = {
  primary:
    "bg-navy text-white shadow-[var(--shadow-float)] hover:bg-navy-soft",
  secondary:
    "bg-white text-navy ring-1 ring-border hover:bg-cream-deep",
  accent:
    "bg-gradient-to-r from-cyan-deep via-violet to-magenta text-white hover:opacity-95",
  ghost: "bg-transparent text-navy hover:bg-cream-deep",
  danger: "bg-danger text-white hover:bg-danger/90",
  whatsapp: "bg-[#25D366] text-white hover:bg-[#1ebe5d]",
} as const;

const sizes = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-base",
} as const;

type ButtonVariant = keyof typeof variants;
type ButtonSize = keyof typeof sizes;

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: Pick<CommonProps, "variant" | "size" | "className">) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:pointer-events-none disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonLinkProps = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonClassName({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
  target,
  rel,
  onClick,
}: ButtonLinkProps) {
  const isExternal = href.startsWith("http");

  return (
    <Link
      href={href}
      target={target}
      rel={rel ?? (isExternal ? "noopener noreferrer" : undefined)}
      onClick={onClick}
      className={buttonClassName({ variant, size, className })}
    >
      {children}
    </Link>
  );
}
