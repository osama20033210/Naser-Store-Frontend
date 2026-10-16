"use client";
import { useId, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { Empty } from "@/components/ui";

export type RevenuePoint = { date: string; revenue_minor: string | number };

/** Shows only recorded days. A single point keeps the same bounded bar width as multiple points. */
export function RevenueChart({ points }: { points: RevenuePoint[] }) {
  const { t, money, locale } = useLocale(), id = useId(), [active, setActive] = useState<number | null>(null);
  if (!points.length) return <Empty title={t("Revenue will appear here")} detail={t("Complete an order to start tracking revenue.")}/>;
  const maximum = Math.max(...points.map(point => Number(point.revenue_minor)), 1);
  const width = 720, height = 280, left = 100, top = 20, bottom = 230, plot = width - left - 20;
  const barWidth = Math.min(32, plot / points.length * .55);
  const dateLabel = (date: string) => new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
  const labelEvery = Math.max(1, Math.ceil(points.length / 6));
  const selected = points[active ?? points.length - 1];
  return <figure className="mt-5 min-w-0"><div role="status" className="mb-3 flex min-h-8 flex-wrap items-center justify-between gap-2 text-sm"><span className="text-slate-600 dark:text-slate-400">{points.length === 1 ? t("One recorded day") : t("Recorded days only")}</span><span className="font-semibold"><bdi>{dateLabel(selected.date)}</bdi> · <bdi>{money(Number(selected.revenue_minor))}</bdi></span></div>
    <div dir="ltr" className="max-w-full overflow-x-auto"><svg viewBox={`0 0 ${width} ${height}`} className="h-auto min-w-[480px] w-full" role="img" aria-labelledby={`${id}-title ${id}-description`}><title id={`${id}-title`}>{t("Revenue trend")}</title><desc id={`${id}-description`}>{t("Completed orders · last 30 days by order creation date")}</desc>
      {[0, 1, 2, 3, 4].map(tick => { const y = bottom - tick / 4 * (bottom - top); return <g key={tick}><line x1={left} x2={width - 20} y1={y} y2={y} className="stroke-slate-200 dark:stroke-slate-800" strokeDasharray={tick ? "3 5" : undefined}/><text x={left - 12} y={y + 4} textAnchor="end" className="fill-slate-600 text-[12px] dark:fill-slate-400">{money(Math.round(maximum * tick / 4))}</text></g>; })}
      {points.map((point, index) => { const x = left + plot * (index + .5) / points.length, value = Number(point.revenue_minor), barHeight = value / maximum * (bottom - top); return <g key={point.date}><rect x={x - barWidth / 2} y={bottom - barHeight} width={barWidth} height={Math.max(barHeight, 1)} rx={4} tabIndex={0} role="graphics-symbol" aria-label={`${dateLabel(point.date)}: ${money(value)}`} onFocus={() => setActive(index)} onMouseEnter={() => setActive(index)} className="fill-indigo-500 outline-none hover:fill-indigo-400 focus:fill-indigo-400"><title>{`${dateLabel(point.date)}: ${money(value)}`}</title></rect>{(index % labelEvery === 0 || index === points.length - 1) && <text x={x} y={bottom + 26} textAnchor="middle" className="fill-slate-600 text-[13px] dark:fill-slate-400">{dateLabel(point.date)}</text>}</g>; })}
    </svg></div><figcaption className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t("Revenue uses completed orders by creation date, not cash collection. Missing days are not fabricated.")}</figcaption>
    <details className="mt-4 text-sm"><summary className="cursor-pointer font-medium text-slate-600 dark:text-slate-300">{t("View daily values")}</summary><dl className="mt-3 grid gap-2">{points.map(point => <div key={point.date} className="flex justify-between gap-3 border-b border-slate-100 py-2 dark:border-slate-800"><dt><bdi>{dateLabel(point.date)}</bdi></dt><dd><bdi>{money(Number(point.revenue_minor))}</bdi></dd></div>)}</dl></details>
  </figure>;
}
