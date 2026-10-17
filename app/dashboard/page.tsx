"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CircleCheck, Clock3, DollarSign, RefreshCw, ShoppingBag, TriangleAlert } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import { useLocale } from "@/components/locale-provider";
import { DataTable, ErrorState, PageHeading, RequirePermission } from "@/components/data";
import { Badge, Button, Card, Empty, Skeleton } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";
import { api } from "@/lib/api";
import type { Order, OrderStatus, Product, Resource } from "@/lib/types";

const RevenueChart = dynamic(() => import("@/components/revenue-chart").then(module => module.RevenueChart), {loading: () => <Skeleton className="mt-5 h-96 w-full"/>});
type Dashboard = {
  total_orders: number; revenue_minor: number; pending_orders: number; completed_orders: number; low_stock_count: number;
  status_distribution: Record<string, number>; revenue_trends: { date: string; revenue_minor: string | number }[];
  recent_orders: Order[]; low_stock_products: Product[];
};
const statuses: OrderStatus[] = ["pending", "confirmed", "processing", "completed", "cancelled"];
const statusColors = ["bg-amber-500", "bg-sky-500", "bg-indigo-500", "bg-emerald-500", "bg-rose-400"];

export default function DashboardPage() {
  return <RequirePermission permission="dashboard.view"><DashboardContent/></RequirePermission>;
}

function DashboardContent() {
  const { t, money, dateTime, locale } = useLocale(), reduced = useReducedMotion();
  const [period, setPeriod] = useState(30);
  const query = useQuery({queryKey:["dashboard"],queryFn:()=>api<Resource<Dashboard>>("/dashboard")});
  const format = new Intl.NumberFormat(locale);
  if (query.isLoading) return <DashboardSkeleton/>;
  if (query.isError) return <ErrorState error={query.error} retry={()=>query.refetch()}/>;
  if (!query.data) return null;
  const d = query.data.data;
  const cutoff = new Date(Date.now() - (period - 1) * 86400000).toISOString().slice(0,10);
  const points = period === 30 ? d.revenue_trends : d.revenue_trends.filter(point => point.date >= cutoff);
  const updatedAt = new Intl.DateTimeFormat(locale, {hour:"numeric",minute:"2-digit"}).format(query.dataUpdatedAt);
  const metrics = [
    {label:"Completed revenue",value:money(d.revenue_minor),icon:DollarSign,context:"Completed orders only",accent:false},
    {label:"Total orders",value:format.format(d.total_orders),icon:ShoppingBag,context:"All time",accent:false},
    {label:"Pending orders",value:format.format(d.pending_orders),icon:Clock3,context:"Awaiting confirmation",accent:d.pending_orders>0},
    {label:"Completed orders",value:format.format(d.completed_orders),icon:CircleCheck,context:"All time",accent:false},
  ];
  return <>
    <PageHeading title={t("Business overview")} description={t("Your store at a glance. Focus on what needs attention.")} action={<div className="flex items-center gap-3"><span className="muted-copy hidden text-xs sm:inline">{t("Updated {time}",{time:updatedAt})}</span><Button type="button" variant="outline" disabled={query.isFetching} onClick={()=>query.refetch()}><RefreshCw aria-hidden="true" className={query.isFetching?"motion-safe:animate-spin":""}/>{t("Refresh")}</Button></div>}/>
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{metrics.map(({label,value,icon:Icon,context,accent},index)=><Card key={label} className="metric-card p-4 sm:p-5" style={{animationDelay:`${index*30}ms`}}><div className="flex items-start justify-between gap-2"><p className="muted-copy text-xs font-medium sm:text-sm">{t(label)}</p><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-control ${accent?"bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300":"bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}><Icon aria-hidden="true" className="h-4 w-4"/></span></div><m.p key={value} initial={false} animate={reduced?{opacity:1}:{opacity:[0.7,1]}} className="mt-3 break-words text-xl font-semibold leading-snug tabular-nums sm:text-2xl"><bdi>{value}</bdi></m.p><p className="muted-copy mt-2 text-xs">{t(context)}</p></Card>)}</div>
    <div className="mt-5 grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
      <Card><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-base font-semibold">{t("Revenue trend")}</h2><p className="muted-copy mt-1 text-xs">{t("Completed orders · last {count} days by creation date (UTC)",{count:period})}</p></div><div role="group" aria-label={t("Revenue period")} className="segmented-control">{[7,30].map(days=><Button key={days} type="button" variant="ghost" className={`px-3 text-xs ${period===days?"bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-indigo-200":"muted-copy"}`} aria-pressed={period===days} onClick={()=>setPeriod(days)}>{t("{count} days",{count:format.format(days)})}</Button>)}</div></div><RevenueChart points={points}/></Card>
      <Card><div className="flex items-center justify-between gap-2"><h2 className="text-base font-semibold">{t("Order distribution")}</h2><Badge>{format.format(d.total_orders)}</Badge></div><p className="muted-copy mt-1 text-xs">{t("Current status of all orders")}</p>{d.total_orders===0?<Empty title={t("No orders yet")} detail={t("Orders will appear here once created.")}/>:<><div aria-hidden="true" className="my-6 flex h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">{statuses.map((status,index)=><span key={status} className={statusColors[index]} style={{width:`${(d.status_distribution[status]??0)/d.total_orders*100}%`}}/>)}</div><dl className="grid gap-4">{statuses.map((status,index)=><div key={status} className="flex items-center justify-between gap-3 text-sm"><dt className="flex items-center gap-2"><span aria-hidden="true" className={`h-2 w-2 rounded-full ${statusColors[index]}`}/>{t(status)}</dt><dd className="flex items-center gap-4 tabular-nums"><span className="muted-copy text-xs">{new Intl.NumberFormat(locale,{style:"percent",maximumFractionDigits:0}).format((d.status_distribution[status]??0)/d.total_orders)}</span><span className="min-w-6 text-end font-medium">{format.format(d.status_distribution[status]??0)}</span></dd></div>)}</dl></>}</Card>
    </div>
    <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
      <Card><div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-base font-semibold">{t("Recent orders")}</h2><Link href="/dashboard/orders" className="flex min-h-9 items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">{t("View all")}<ArrowUpRight aria-hidden="true" className="h-4 w-4"/></Link></div><DataTable rows={d.recent_orders} columns={[
        {label:t("Order"),render:order=><Link href={`/dashboard/orders/${order.id}`} className="font-medium text-indigo-600 dark:text-indigo-400">#<bdi dir="ltr">{order.number.slice(0,8)}</bdi></Link>},
        {label:t("Customer"),render:order=>order.customer?.name},
        {label:t("Status"),render:order=><StatusBadge status={order.status}/>},
        {label:t("Total"),render:order=><bdi>{money(order.total_minor)}</bdi>},
        {label:t("Created"),render:order=>dateTime(order.created_at)},
      ]}/></Card>
      <Card><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-base font-semibold"><TriangleAlert aria-hidden="true" className="h-4 w-4 text-amber-600 dark:text-amber-400"/>{t("Low stock")}</h2><Badge tone={d.low_stock_count?"amber":"green"}>{format.format(d.low_stock_count)} {t("products")}</Badge></div><p className="muted-copy mt-1 text-xs">{t("Products at or below their stock threshold")}</p><div className="mt-4 grid divide-y divide-[var(--border-subtle)]">{d.low_stock_products.map(product=><Link href={`/dashboard/products/${product.id}`} key={product.id} className="group flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-300">{product.name}</p><p className="muted-copy mt-1 text-xs"><bdi dir="ltr">{product.sku}</bdi></p></div><Badge tone={product.stock===0?"red":"amber"}>{format.format(product.stock)} {t("left")}</Badge></Link>)}</div>{!d.low_stock_products.length&&<Empty title={t("Stock looks healthy")} detail={t("No products are below their threshold.")}/>}</Card>
    </div>
  </>;
}

function DashboardSkeleton() {
  const { t } = useLocale();
  return <div role="status" aria-label={t("Loading")} aria-busy="true"><Skeleton className="mb-3 h-8 w-56"/><Skeleton className="mb-7 h-4 w-72 max-w-full"/><div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{[0,1,2,3].map(index=><Card key={index}><Skeleton className="h-4 w-24"/><Skeleton className="mt-4 h-7 w-32 max-w-full"/><Skeleton className="mt-3 h-3 w-20"/></Card>)}</div><div className="mt-5 grid gap-5 xl:grid-cols-[1.7fr_1fr]"><Card><Skeleton className="h-80 w-full"/></Card><Card><Skeleton className="h-80 w-full"/></Card></div><span className="sr-only">{t("Loading")}</span></div>;
}
