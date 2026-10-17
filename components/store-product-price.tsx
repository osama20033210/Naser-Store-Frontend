"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocale } from "@/components/locale-provider";
import type { StoreProduct } from "@/lib/store-types";

export function StoreProductPrice({ product, large = false }: { product: StoreProduct; large?: boolean }) {
  const { money, t } = useLocale(), client = useQueryClient();
  const regular = product.regular_price_minor ?? product.price_minor;
  const changesAt = product.price_changes_at ?? product.promotion_ends_at;
  useEffect(() => {
    if (!changesAt) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = new Date(changesAt).getTime() - Date.now();
      if (delay <= 0) { void client.invalidateQueries({ queryKey: ["store"] }); return; }
      timer = setTimeout(schedule, Math.min(delay + 50, 2147483647));
    };
    schedule(); return () => clearTimeout(timer);
  }, [changesAt, client]);
  return <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 tabular-nums"><span className={large ? "text-xl font-semibold" : "text-base font-semibold"}><span className="sr-only">{t("Price")}: </span><bdi>{money(product.price_minor)}</bdi></span>{regular > product.price_minor && <del className="text-sm text-slate-500 dark:text-slate-400"><span className="sr-only">{t("Regular price")}: </span><bdi>{money(regular)}</bdi></del>}</div>;
}

export function PromotionCountdown({ endsAt }: { endsAt: string }) {
  const { t, dateTime } = useLocale();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const timer = setInterval(() => { setNow(Date.now()); if (Date.now() >= new Date(endsAt).getTime()) clearInterval(timer); }, 1000); return () => clearInterval(timer); }, [endsAt]);
  const seconds = now === null ? null : Math.max(0, Math.ceil((new Date(endsAt).getTime() - now) / 1000));
  if (seconds === 0) return <p role="status" className="mt-3 text-sm text-amber-700 dark:text-amber-300">{t("Offer ended. Refreshing the current price.")}</p>;
  const time = seconds === null ? null : `${Math.floor(seconds / 86400)} ${t("days")} ${String(Math.floor(seconds / 3600) % 24).padStart(2, "0")}:${String(Math.floor(seconds / 60) % 60).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  return <div className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-200"><p>{t("Offer ends")}: <time dateTime={endsAt}><bdi dir="ltr">{dateTime(endsAt)}</bdi></time></p>{time && <p aria-hidden="true" className="mt-2 font-medium tabular-nums"><bdi dir="ltr">{time}</bdi></p>}</div>;
}
