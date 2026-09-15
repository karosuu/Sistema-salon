import Link from "next/link";

import { PUBLIC_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";

type LogoProps = {
  href?: string;
  className?: string;
  markOnly?: boolean;
  inverted?: boolean;
};

export function Logo({
  href = PUBLIC_ROUTES.home,
  className,
  markOnly = false,
  inverted = false,
}: LogoProps) {
  const content = markOnly ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo-mark.svg" alt="Pixel-Craft" className="h-10 w-10" />
  ) : (
    <span className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mark.svg"
        alt=""
        className={cn("h-11 w-11", inverted && "rounded-full bg-white p-0.5")}
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-lg tracking-tight",
            inverted ? "text-white" : "text-navy",
          )}
        >
          Pixel-Craft
        </span>
        <span
          className={cn(
            "mt-1 text-[0.65rem] font-medium tracking-[0.28em] uppercase",
            inverted ? "text-cyan" : "text-muted",
          )}
        >
          Salón · DEMO
        </span>
      </span>
    </span>
  );

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center rounded-lg", className)}
      aria-label="Pixel-Craft Salón, ir al inicio"
    >
      {content}
    </Link>
  );
}
