"use client";
import { useLocale } from "@/components/locale-provider";


import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { useAuth } from "@/components/providers";
import {
  Button,
  Card,
  Empty,
  Input,
  Loading,
  Pagination,
  Select,
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
      <div className="min-w-0">
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

  if (!rows.length) return <Empty title={emptyTitle} />;
  return (
    <div role="region" aria-label={t("Scrollable table")} tabIndex={0} className="relative max-w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full whitespace-nowrap text-start text-sm tabular-nums">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
            {columns.map((c, i) => (
              <th key={i} scope="col" className="relative px-4 py-3 text-start font-semibold">
                {c.label ? t(c.label) : <span className="sr-only">{t("Actions")}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
            >
              {columns.map((c, i) => (
                <td key={i} className="px-4 py-4 align-middle">
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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
    row: { id: number; name: string; price_minor?: number },
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
