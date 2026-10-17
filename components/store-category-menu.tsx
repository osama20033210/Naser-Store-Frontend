"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { api } from "@/lib/api";
import type { Category, Page } from "@/lib/types";

export function StoreCategoryMenu() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDetailsElement>(null);
  const query = useQuery({ queryKey: ["store", "categories"], queryFn: ({ signal }) => api<Page<Category>>("/store/categories?per_page=100", { signal }), enabled: open, staleTime: 60000 });
  return <details ref={menu} className="relative" onToggle={event => setOpen(event.currentTarget.open)}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false; }}
    onKeyDown={event => { if (event.key === "Escape" && menu.current) { menu.current.open = false; menu.current.querySelector("summary")?.focus(); } }}>
    <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-control px-3 hover:bg-slate-100 dark:hover:bg-slate-800 [&::-webkit-details-marker]:hidden">{t("Categories")}<ChevronDown aria-hidden="true" className="size-4"/></summary>
    <div className="panel absolute start-0 top-full z-30 mt-2 max-h-80 w-[min(75vw,280px)] overflow-y-auto p-2 shadow-floating">
      {query.isLoading ? <p role="status" className="p-3 text-sm">{t("Loading")}</p> : query.isError ? <div className="p-3 text-sm"><p>{t("Category filters could not be loaded.")}</p><button type="button" className="min-h-11 underline" onClick={() => query.refetch()}>{t("Try again")}</button></div> : query.data?.data.length ? query.data.data.map(category => <Link key={category.id} href={`/shop?category_id=${category.id}`} onClick={() => { if (menu.current) menu.current.open = false; }} className="flex min-h-11 items-center rounded-control px-3 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-slate-800">{category.name}</Link>) : <p className="p-3 text-sm">{t("Categories will appear when products are available.")}</p>}
    </div>
  </details>;
}
