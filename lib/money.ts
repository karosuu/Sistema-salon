import { BUSINESS_CURRENCY, BUSINESS_LOCALE } from "@/lib/constants";

const crcFormatter = new Intl.NumberFormat(BUSINESS_LOCALE, {
  style: "currency",
  currency: BUSINESS_CURRENCY,
  maximumFractionDigits: 0,
});

export function formatCrc(amountCrc: number): string {
  return crcFormatter.format(amountCrc);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) {
    return hours === 1 ? "1 h" : `${hours} h`;
  }
  return `${hours} h ${rest} min`;
}
