"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/brand/logo";
import { Button, ButtonLink } from "@/components/ui/button";
import { PUBLIC_NAV, PUBLIC_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";

type SiteHeaderProps = {
  salonName: string;
};

export function SiteHeader({ salonName }: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <span className="sr-only">{salonName}</span>

        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative pb-1 hover:text-navy",
                pathname === item.href
                  ? "text-navy after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-cyan"
                  : "text-muted",
              )}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <ButtonLink href={PUBLIC_ROUTES.book}>Reservar cita</ButtonLink>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="min-w-11 rounded-lg px-0 lg:hidden"
          aria-expanded={open}
          aria-controls="menu-movil"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
          <span aria-hidden className="text-xl leading-none">
            {open ? "×" : "☰"}
          </span>
        </Button>
      </div>

      <div
        id="menu-movil"
        hidden={!open}
        className={cn(
          "border-t border-border bg-surface px-4 py-4 lg:hidden",
          !open && "hidden",
        )}
      >
        <nav className="flex flex-col gap-3 text-base font-medium text-navy">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <ButtonLink href={PUBLIC_ROUTES.book} onClick={() => setOpen(false)}>
            Reservar cita
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
