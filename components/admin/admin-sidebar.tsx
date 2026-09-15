"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { ADMIN_NAV, ADMIN_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";

type AdminSidebarProps = {
  userName: string;
};

export function AdminSidebar({ userName }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="border-b border-white/10 bg-navy text-white md:min-h-screen md:w-64 md:border-r md:border-b-0">
      <div className="px-5 py-5">
        <Logo href={ADMIN_ROUTES.dashboard} inverted />
        <p className="mt-4 text-xs tracking-wide text-cyan uppercase">
          Panel interno
        </p>
        <p className="mt-1 text-sm text-white/80">{userName}</p>
      </div>
      <nav className="flex gap-2 overflow-x-auto px-4 pb-4 md:flex-col md:overflow-visible">
        {ADMIN_NAV.map((item) => {
          const active =
            item.href === ADMIN_ROUTES.dashboard
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 text-sm font-medium",
                active ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
