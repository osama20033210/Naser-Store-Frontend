"use client";
import { useLocale } from "@/components/locale-provider";


import { useQuery } from "@tanstack/react-query";
import { Columns3, Search } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/components/providers";
import {
  Button,
  Card,
  Empty,
  Input,
  Loading,
  Pagination,
  Select,
  Skeleton,
  BoxesLoader,
} from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { Page } from "@/lib/types";

export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="break-words text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>
      </div>
      {action}
    </div>
  );
}
export function ErrorState({
  error,
  retry,
}: {
  error: unknown;
  retry?: () => void;
}) {
  const { t, errorText } = useLocale();

  return (
    <Card>
      <p role="alert" className="font-semibold text-rose-600 dark:text-rose-400">
        {error instanceof ApiError && error.status === 403
          ? t("You do not have permission to access this page.")
          : error instanceof Error
            ? errorText(error.message)
            : t("Unable to load data.")}
      </p>
      {retry && (
        <Button className="mt-4" onClick={retry}>
          {t("Try again")} </Button>
      )}
    </Card>
  );
}
export function RequirePermission({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  

  const auth = useAuth();
  return auth.can(permission) ? (
    children
  ) : (
    <ErrorState error={new ApiError(403, {})} />
  );
}
export type Column<T> = { label: string; render: (row: T) => ReactNode };
export function DataTable<T extends { id: number }>({
  rows,
  columns,
  emptyTitle,
}: {
  rows: T[];
  columns: Column<T>[];
  emptyTitle?: string;
}) {
  const { t } = useLocale();
  const [hidden, setHidden] = useState<string[]>([]);
  const menu = useRef<HTMLDetailsElement>(null);
  const keyFor = (column: Column<T>, index: number) => column.label || `actions-${index}`;
  const visible = columns.filter((column, index) => !column.label || !hidden.includes(keyFor(column, index)));
  if (!rows.length) return <Empty title={emptyTitle} />;
  return (
    <div className="min-w-0">
      {columns.length > 4 && <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-slate-500 dark:text-slate-400">{t("{count} records on this page", {count: rows.length})}</span><details ref={menu} className="relative" onBlur={event => {if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;}} onKeyDown={event => {if(event.key === "Escape"){event.currentTarget.open=false;event.currentTarget.querySelector("summary")?.focus();}}}><summary className="flex h-11 cursor-pointer list-none items-center gap-2 rounded-control border border-[var(--border-subtle)] px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 [&::-webkit-details-marker]:hidden"><Columns3 aria-hidden="true" className="h-3.5 w-3.5"/>{t("Columns")}</summary><div className="panel absolute end-0 top-12 z-20 grid w-56 max-w-[80vw] gap-1 p-2 shadow-floating">{columns.map((column,index) => column.label && <label key={keyFor(column,index)} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"><input type="checkbox" className="h-4 w-4 accent-indigo-600" checked={!hidden.includes(keyFor(column,index))} disabled={visible.filter(item => item.label).length === 1 && !hidden.includes(keyFor(column,index))} onChange={event => setHidden(previous => event.target.checked ? previous.filter(key => key !== keyFor(column,index)) : [...previous,keyFor(column,index)])}/>{t(column.label)}</label>)}</div></details></div>}
    <div role="region" aria-label={t("Scrollable table")} tabIndex={0} className="relative max-w-full overflow-x-auto rounded-control border border-[var(--border-subtle)]">
      <table className="w-full whitespace-nowrap text-start text-sm tabular-nums">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
            {visible.map((c, i) => (
              <th key={i} scope="col" className="relative px-4 py-3 text-start font-semibold">
                {c.label ? t(c.label) : <span className="sr-only">{t("Actions")}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table-reveal">
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-slate-50 focus-within:bg-indigo-50/50 dark:hover:bg-slate-800/40 dark:focus-within:bg-indigo-500/5"
            >
              {visible.map((c, i) => (
                <td key={i} className="px-4 py-3.5 align-middle">
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}

export function TableLoading({ columns = 5 }: { columns?: number }) {
  const { t } = useLocale();
  return <div role="status" aria-label={t("Loading")} aria-busy="true" className="min-w-0"><div className="mb-3 flex items-center justify-between"><Skeleton className="h-4 w-32"/><BoxesLoader className="h-5 w-5"/></div><div className="overflow-hidden rounded-control border border-[var(--border-subtle)]"><div className="flex h-11 items-center gap-6 bg-slate-50 px-4 dark:bg-slate-800/50">{Array.from({length:Math.min(columns,5)},(_,index)=><Skeleton key={index} className="h-3 flex-1"/>)}</div>{Array.from({length:5},(_,row)=><div key={row} className="flex h-14 items-center gap-6 border-t border-[var(--border-subtle)] px-4">{Array.from({length:Math.min(columns,5)},(_,index)=><Skeleton key={index} className="h-3 flex-1"/>)}</div>)}</div><span className="sr-only">{t("Loading")}</span></div>;
}

/** Server-backed, searchable, paginated picker. The selected ID remains visible across searches. */
export function Lookup({
  resource,
  value,
  onChange,
  label,
  selectedLabel,
  activeOnly = false,
}: {
  resource: "categories" | "customers" | "products";
  value: number;
  onChange: (
    id: number,
    row: { id: number; name: string; price_minor?: number; selling_price_minor?: number },
  ) => void;
  label: string;
  selectedLabel?: string;
  activeOnly?: boolean;
}) {
  const { t } = useLocale();

  const [q, setQ] = useState(""),
    [page, setPage] = useState(1),
    id = useId();
  const query = useQuery({
    queryKey: ["lookup", resource, q, page, activeOnly],
    queryFn: () =>
      api<
        Page<{ id: number; name: string; sku?: string; price_minor?: number }>
      >(
        `/${resource}?q=${encodeURIComponent(q)}&page=${page}&per_page=20${resource === "products" && activeOnly ? "&active=1" : ""}`,
      ),
  });
  const rows = query.data?.data ?? [];
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {t(label)}
      </label>
      <div className="relative">
        <Search className="absolute start-3 top-3.5 h-4 w-4 text-slate-400" />
        <Input
          id={id}
          value={q}
          placeholder={t("Search {name}", { name: t(resource) })}
          className="ps-9"
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
      </div>
      <Select
        aria-label={t("Select {name}", { name: t(label) })}
        value={value || ""}
        onChange={(e) => {
          const row = rows.find((r) => r.id === Number(e.target.value));
          if (row) onChange(row.id, row);
        }}
      >
        <option value="">{t("Select {name}", { name: t(label) })}</option>
        {value && !rows.some((r) => r.id === value) && (
          <option value={value}>{selectedLabel ?? t("Selected #{id}", { id: value })}</option>
        )}
        {rows.map((row) => (
          <option key={row.id} value={row.id}>
            {row.sku ? `${row.sku} · ` : ""}
            {row.name}
          </option>
        ))}
      </Select>
      {query.isLoading && (
        <span className="text-xs text-slate-500 dark:text-slate-400">{t("Loading options…")}</span>
      )}
      {query.isError && (
        <span className="text-xs text-rose-600 dark:text-rose-400">{t("Could not load options.")}</span>
      )}
      {query.data && query.data.meta.last_page > 1 && (
        <Pagination
          page={page}
          last={query.data.meta.last_page}
          onPage={setPage}
        />
      )}
    </div>
  );
}
