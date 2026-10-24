"use client";

import { useRouter } from "next/navigation";

import { DatePicker } from "@/components/ui/date-picker";
import { ADMIN_ROUTES } from "@/lib/constants";

export function CalendarDayJump({ ymd }: { ymd: string }) {
  const router = useRouter();

  return (
    <DatePicker
      id="calendario-fecha"
      variant="inline"
      value={ymd}
      onChange={(next) => {
        router.push(`${ADMIN_ROUTES.calendar}?fecha=${next}`);
      }}
    />
  );
}
