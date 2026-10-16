"use client";
import { useLocale } from "@/components/locale-provider";


import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  CircleCheck,
  Clock3,
  DollarSign,
  ShoppingBag,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import {
  DataTable,
  ErrorState,
  PageHeading,
  RequirePermission,
} from "@/components/data";
import { Badge, Card, Empty, Loading } from "@/components/ui";
import { api } from "@/lib/api";
import { RevenueChart } from "@/components/revenue-chart";
import type { Order, Product, Resource } from "@/lib/types";

type Dashboard = {
  total_orders: number;
  revenue_minor: number;
  pending_orders: number;
  completed_orders: number;
  low_stock_count: number;
  status_distribution: Record<string, number>;
  revenue_trends: { date: string; revenue_minor: string | number }[];
  recent_orders: Order[];
  low_stock_products: Product[];
};
export default function DashboardPage() {
  

  return (
    <RequirePermission permission="dashboard.view">
      <DashboardContent />
    </RequirePermission>
  );
}
function DashboardContent() {
  const { t, money, dateTime } = useLocale();

  const query = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<Resource<Dashboard>>("/dashboard"),
  });
  if (query.isLoading) return <Loading />;
  if (query.isError)
    return <ErrorState error={query.error} retry={() => query.refetch()} />;
  if (!query.data) return null;
  const d = query.data.data;
  const metrics = [
    {
      label: t("Total orders"),
      value: d.total_orders,
      icon: ShoppingBag,
      color: "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10",
    },
    {
      label: t("Completed revenue"),
      value: money(d.revenue_minor),
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10",
    },
    {
      label: t("Pending orders"),
      value: d.pending_orders,
      icon: Clock3,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10",
    },
    {
      label: t("Completed orders"),
      value: d.completed_orders,
      icon: CircleCheck,
      color: "text-cyan-600 bg-cyan-50 dark:text-cyan-300 dark:bg-cyan-500/10",
    },
  ];
  return (
    <>
      <PageHeading
        title={t("Business overview")}
        description={t("A live view of your orders, revenue, and inventory.")}
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-3 sm:p-5">
            <div className="flex items-center justify-between">
              <span className={`rounded-xl p-2 ${color}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs text-slate-400">{t("All time")}</span>
            </div>
            <p className="mt-3 break-words text-2xl font-bold tabular-nums">{value}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t(String(label))}</p>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Card>
          <div className="flex justify-between">
            <div>
              <h2 className="font-bold">{t("Revenue trend")}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t("Completed orders · last 30 days by order creation date")} </p>
            </div>
            <Badge tone="indigo">{t("USD")}</Badge>
          </div>
          <RevenueChart points={d.revenue_trends}/>
        </Card>
        <Card>
          <h2 className="font-bold">{t("Order distribution")}</h2>
          <div className="mt-6 grid gap-4">
            {[
              "pending",
              "confirmed",
              "processing",
              "completed",
              "cancelled",
            ].map((status) => (
              <div key={status}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="capitalize">{t(String(status))}</span>
                  <span className="font-semibold">
                    {d.status_distribution[status] ?? 0}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-indigo-500"
                    style={{
                      width: `${((d.status_distribution[status] ?? 0) / Math.max(d.total_orders, 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Card>
          <div className="mb-3 flex justify-between">
            <h2 className="font-bold">{t("Recent orders")}</h2>
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400"
            >
              {t("View all")} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <DataTable
            rows={d.recent_orders}
            columns={[
              {
                label: t("Order"),
                render: (o) => (
                  <Link
                    className="font-semibold text-indigo-600 dark:text-indigo-400"
                    href={`/dashboard/orders/${o.id}`}
                  >
                    #<bdi dir="auto">{o.number.slice(0, 8)}</bdi>
                  </Link>
                ),
              },
              { label: t("Customer"), render: (o) => o.customer?.name },
              {
                label: t("Status"),
                render: (o) => (
                  <Badge
                    tone={
                      o.status === "completed"
                        ? "green"
                        : o.status === "cancelled"
                          ? "red"
                          : "indigo"
                    }
                  >
                    {o.status}
                  </Badge>
                ),
              },
              { label: t("Total"), render: (o) => <bdi dir="auto">{money(o.total_minor)}</bdi> },
              { label: t("Created"), render: (o) => dateTime(o.created_at) },
            ]}
          />
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold">
              <TriangleAlert className="h-4 w-4 text-amber-500" />
              {t("Low stock")} </h2>
            <Badge tone="amber">{d.low_stock_count} {t("products")}</Badge>
          </div>
          <div className="mt-5 grid gap-4">
            {d.low_stock_products.map((p) => (
              <Link
                href={`/dashboard/products/${p.id}`}
                key={p.id}
                className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800"
              >
                <div>
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400"><bdi dir="ltr">{p.sku}</bdi></p>
                </div>
                <Badge tone={p.stock === 0 ? "red" : "amber"}>
                  {p.stock} {t("left")} </Badge>
              </Link>
            ))}
            {!d.low_stock_products.length && (
              <Empty
                title={t("Stock looks healthy")}
                detail={t("No products are below their threshold.")}
              />
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
