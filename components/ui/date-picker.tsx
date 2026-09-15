"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { formatYmd, formatYmdLong, utcToCostaRicaYmd } from "@/lib/timezone";

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"] as const;

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

function parseYmd(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || !month || !day) {
    return null;
  }
  return { year, month, day };
}

function mondayOffset(year: number, month: number): number {
  const ymd = formatYmd(year, month, 1);
  const jsDay = new Date(`${ymd}T12:00:00-06:00`).getUTCDay();
  return (jsDay + 6) % 7;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

function isDisabled(ymd: string, min?: string, max?: string): boolean {
  if (min && ymd < min) {
    return true;
  }
  if (max && ymd > max) {
    return true;
  }
  return false;
}

type DatePickerProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (ymd: string) => void;
  min?: string;
  max?: string;
  allowEmpty?: boolean;
  placeholder?: string;
};

export function DatePicker({
  id,
  name,
  value,
  onChange,
  min,
  max,
  allowEmpty = false,
  placeholder = "Elegí una fecha",
}: DatePickerProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = parseYmd(value);
  const [cursor, setCursor] = useState(() => {
    const parsed = parseYmd(value);
    if (parsed) {
      return { year: parsed.year, month: parsed.month };
    }
    return parseYmd(utcToCostaRicaYmd(new Date())) ?? { year: 2026, month: 9 };
  });

  useEffect(() => {
    const parsed = parseYmd(value);
    if (parsed) {
      setCursor({ year: parsed.year, month: parsed.month });
    }
  }, [value]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const cells = useMemo(() => {
    const offset = mondayOffset(cursor.year, cursor.month);
    const total = daysInMonth(cursor.year, cursor.month);
    const blanks = Array.from({ length: offset }, () => null);
    const days = Array.from({ length: total }, (_, index) => index + 1);
    return [...blanks, ...days];
  }, [cursor.month, cursor.year]);

  const monthLabel = MONTHS[cursor.month - 1] ?? "";
  const display = value ? formatYmdLong(value) : placeholder;

  return (
    <div ref={containerRef} className="relative mt-1">
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        id={inputId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={value ? `Fecha seleccionada: ${display}` : "Abrir calendario"}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-11 w-full items-center justify-between rounded-[var(--radius-md)] border border-border bg-surface px-3 text-left text-ink"
      >
        <span className={value ? "text-ink" : "text-muted"}>{display}</span>
        <span className="text-xs font-semibold tracking-wide text-muted uppercase">
          Calendario
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Calendario"
          lang="es-CR"
          className="absolute z-30 mt-2 w-full min-w-[18rem] rounded-[var(--radius-lg)] border border-border bg-surface p-3 shadow-[var(--shadow-card)]"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              className="min-h-10 rounded-full px-3 text-sm font-semibold text-navy hover:bg-cream-deep"
              aria-label="Mes anterior"
              onClick={() => setCursor((current) => shiftMonth(current.year, current.month, -1))}
            >
              ←
            </button>
            <p className="font-display text-lg text-navy capitalize">
              {monthLabel} {cursor.year}
            </p>
            <button
              type="button"
              className="min-h-10 rounded-full px-3 text-sm font-semibold text-navy hover:bg-cream-deep"
              aria-label="Mes siguiente"
              onClick={() => setCursor((current) => shiftMonth(current.year, current.month, 1))}
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold tracking-wide text-muted uppercase">
            {WEEKDAYS.map((label) => (
              <span key={label} className="py-1">
                {label}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              if (!day) {
                return <span key={`empty-${index}`} />;
              }
              const ymd = formatYmd(cursor.year, cursor.month, day);
              const disabled = isDisabled(ymd, min, max);
              const isSelected = ymd === value;
              return (
                <button
                  key={ymd}
                  type="button"
                  disabled={disabled}
                  aria-label={formatYmdLong(ymd)}
                  aria-pressed={isSelected}
                  onClick={() => {
                    onChange(ymd);
                    setOpen(false);
                  }}
                  className={cn(
                    "min-h-10 rounded-full text-sm font-medium",
                    disabled && "cursor-not-allowed text-muted/40",
                    !disabled && !isSelected && "text-navy hover:bg-cream-deep",
                    isSelected && "bg-navy text-white",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex justify-end gap-2">
            {allowEmpty && value ? (
              <button
                type="button"
                className="min-h-10 rounded-full px-3 text-sm font-semibold text-navy hover:bg-cream-deep"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                Limpiar
              </button>
            ) : null}
            <button
              type="button"
              className="min-h-10 rounded-full px-3 text-sm font-semibold text-navy hover:bg-cream-deep"
              onClick={() => {
                const today = utcToCostaRicaYmd(new Date());
                if (!isDisabled(today, min, max)) {
                  onChange(today);
                  setOpen(false);
                }
              }}
            >
              Hoy
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
