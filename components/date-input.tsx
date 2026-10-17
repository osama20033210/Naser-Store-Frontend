"use client";

import { useRef, type ComponentProps } from "react";
import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui";
import { useLocale } from "@/components/locale-provider";

export const displayDate = (iso: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split("-").reverse().join("/") : iso;

/** Validate calendar dates explicitly rather than letting Date normalize invalid days. */
export function parseDate(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, day, month, year] = match;
  const iso = `${year}-${month}-${day}`;
  const date = new Date(`${iso}T00:00:00Z`);
  return Number(year) >= 1 &&
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === iso
    ? iso
    : null;
}

export function DateInput({
  value,
  onChange,
  ...props
}: Omit<ComponentProps<typeof Input>, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t, locale } = useLocale();
  const picker = useRef<HTMLInputElement>(null);
  return (
    <div className="relative min-w-0">
      <Input
        {...props}
        type="text"
        dir="ltr"
        placeholder="dd/mm/yyyy"
        maxLength={10}
        autoComplete="off"
        value={value}
        className={
          locale === "ar"
            ? "pl-12 text-right tabular-nums"
            : "pr-12 text-left tabular-nums"
        }
        onChange={(event) => onChange(event.target.value)}
      />
      <input
        ref={picker}
        type="date"
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none absolute end-0 top-0 size-11 opacity-0"
        value={parseDate(value) ?? ""}
        onChange={(event) => onChange(displayDate(event.target.value))}
      />
      <button
        type="button"
        aria-label={t("Choose date")}
        className="absolute end-0 top-0 grid size-11 place-items-center rounded-control text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
        onClick={() => {
          if (picker.current?.showPicker) picker.current.showPicker();
          else picker.current?.click();
        }}
      >
        <CalendarDays aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
