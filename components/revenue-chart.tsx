"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { Empty } from "@/components/ui";

export type RevenuePoint = { date: string; revenue_minor: string | number };

/** Responsive SVG using only recorded API values; no interpolation or fabricated missing days. */
export function RevenueChart({ points }: { points: RevenuePoint[] }) {
  const { t, money, locale } = useLocale(), id = useId();
  const container = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null), [width, setWidth] = useState(640);
  const hasPoints = points.length > 0;
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(260, Math.floor(entry.contentRect.width))));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [hasPoints]);
  if (!hasPoints) return <div className="min-h-72"><Empty title={t("Revenue will appear here")} detail={t("No completed orders were recorded in this period.")}/></div>;
  if (points.some(point => !Number.isFinite(Number(point.revenue_minor)) || !/^\d{4}-\d{2}-\d{2}$/.test(point.date))) return <p role="alert" className="py-10 text-sm text-rose-600 dark:text-rose-400">{t("Revenue data could not be displayed.")}</p>;
  const maximum = Math.max(...points.map(point => Number(point.revenue_minor)), 1);
  const height = 250, left = width < 400 ? 78 : 100, top = 16, bottom = 204, plot = width - left - 16;
  const barWidth = Math.min(28, plot / points.length * 0.55);
  const dateLabel = (date: string) => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
  const compactMoney = new Intl.NumberFormat(locale, {style:"currency",currency:"USD",notation:"compact",maximumFractionDigits:0});
  const labelEvery = Math.max(1, Math.ceil(points.length / Math.max(2, Math.floor(plot / 75))));
  const selected = points[Math.min(active ?? points.length - 1, points.length - 1)];
  return <figure className="mt-5 min-w-0">
    <div className="mb-4 flex min-h-8 flex-wrap items-center justify-between gap-2 text-xs"><span className="muted-copy">{t(points.length === 1 ? "One recorded day" : "Recorded days only")}</span><span className="rounded-lg bg-slate-50 px-2 py-1 font-medium dark:bg-slate-800"><bdi>{dateLabel(selected.date)}</bdi> · <bdi>{money(Number(selected.revenue_minor))}</bdi></span></div>
    <div ref={container} dir="ltr" className="min-h-[250px] min-w-0"><svg viewBox={`0 0 ${width} ${height}`} className="h-[250px] w-full overflow-visible" role="img" aria-labelledby={`${id}-title ${id}-description`}><title id={`${id}-title`}>{t("Revenue trend")}</title><desc id={`${id}-description`}>{t("Revenue uses completed orders by creation date, not cash collection. Missing days are not fabricated.")}</desc>
      {[0,1,2,3,4].map(tick => {const y = bottom - tick / 4 * (bottom - top); return <g key={tick}><line x1={left} x2={width-16} y1={y} y2={y} className="stroke-slate-200 dark:stroke-slate-800" strokeDasharray={tick ? "3 5" : undefined}/><text x={left-10} y={y+4} textAnchor="end" className="fill-slate-500 text-[11px] dark:fill-slate-400">{compactMoney.format(maximum * tick / 400)}</text></g>;})}
      {points.map((point,index) => {const x = left + plot*(index+0.5)/points.length, value = Number(point.revenue_minor), barHeight = value/maximum*(bottom-top); return <g key={point.date}><rect x={x-barWidth/2} y={bottom-barHeight} width={barWidth} height={Math.max(barHeight,1)} rx={3} tabIndex={0} role="graphics-symbol" aria-label={`${dateLabel(point.date)}: ${money(value)}`} onFocus={()=>setActive(index)} onMouseEnter={()=>setActive(index)} className="chart-bar fill-indigo-500 stroke-transparent stroke-2 hover:fill-indigo-400 focus:fill-indigo-400 focus:stroke-indigo-700 focus:outline-none dark:focus:stroke-indigo-200"><title>{`${dateLabel(point.date)}: ${money(value)}`}</title></rect>{(index%labelEvery===0)&&<text x={x} y={bottom+26} textAnchor="middle" className="fill-slate-500 text-[11px] dark:fill-slate-400">{dateLabel(point.date)}</text>}</g>;})}
    </svg></div>
    <figcaption className="muted-copy mt-2 text-xs leading-relaxed">{t("Revenue uses completed orders by creation date, not cash collection. Missing days are not fabricated.")}</figcaption>
    <details className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-sm"><summary className="muted-copy cursor-pointer font-medium">{t("View daily values")}</summary><dl className="mt-3 grid gap-2">{points.map(point=><div key={point.date} className="flex justify-between gap-3 border-b border-[var(--border-subtle)] py-2"><dt><bdi>{dateLabel(point.date)}</bdi></dt><dd><bdi>{money(Number(point.revenue_minor))}</bdi></dd></div>)}</dl></details>
  </figure>;
}
