import type { DisplayHours } from "@/lib/salon/hours";

export function HoursList({ hours }: { hours: DisplayHours[] }) {
  return (
    <ul className="space-y-1 text-sm">
      {hours.map((item) => (
        <li key={item.weekday} className="flex justify-between gap-4">
          <span className="text-navy">{item.label}</span>
          <span className={item.isClosed ? "text-muted" : "text-ink"}>
            {item.hours}
          </span>
        </li>
      ))}
    </ul>
  );
}
