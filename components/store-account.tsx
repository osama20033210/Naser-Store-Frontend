"use client";
import { useLocale } from "@/components/locale-provider";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  Clock3,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { DateInput, displayDate, parseDate } from "@/components/date-input";
import { toast } from "sonner";
import { DataTable, ErrorState, PageHeading } from "@/components/data";
import { useAuth } from "@/components/providers";
import {
  Badge,
  Button,
  Card,
  Dialog,
  Field,
  Input,
  Loading,
  Pagination,
  Select,
  Textarea,
} from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { setListFilters, useListFilter } from "@/components/use-list-filters";
import type { StoreOrder, StoreProfile } from "@/lib/store-types";
import type { Page, Resource } from "@/lib/types";

export function StoreProfilePage() {
  const { t, errorText } = useLocale();

  const auth = useAuth(),
    client = useQueryClient();
  const query = useQuery({
    queryKey: ["store", "profile"],
    queryFn: ({ signal }) =>
      api<Resource<StoreProfile>>("/store/profile", { signal }),
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<{ name: string; phone: string; address: string }>({
    values: {
      name: query.data?.data.name ?? "",
      phone: query.data?.data.phone ?? "",
      address: query.data?.data.address ?? "",
    },
  });
  if (query.isLoading) return <Loading />;
  if (query.isError)
    return <ErrorState error={query.error} retry={() => query.refetch()} />;
  return (
    <>
      <PageHeading
        title={t("Your profile")}
        description={t(
          "Save contact details to make your next checkout easier.",
        )}
      />
      <Card className="max-w-2xl">
        <form
          className="grid gap-5"
          onSubmit={handleSubmit(async (values) => {
            try {
              await api("/store/profile", {
                method: "PUT",
                body: JSON.stringify(values),
              });
              await client.invalidateQueries({
                queryKey: ["store", "profile"],
              });
              await auth.refreshUser();
              toast.success(t("Profile saved"));
            } catch (error) {
              if (error instanceof ApiError)
                Object.entries(error.body.errors ?? {}).forEach(
                  ([key, messages]) =>
                    setError(key as keyof typeof values, {
                      message: messages[0],
                    }),
                );
              toast.error(
                errorText(
                  error instanceof Error ? error.message : t("Save failed"),
                ),
              );
            }
          })}
        >
          <section className="grid gap-5">
            <h2 className="text-lg font-semibold">{t("Contact details")}</h2>
            <Field label={t("Full name")} error={errors.name?.message}>
              <Input
                autoComplete="name"
                {...register("name", {
                  required: "Name is required",
                  maxLength: 255,
                })}
              />
            </Field>
            <Field label={t("Email")}>
              <Input
                type="email"
                readOnly
                value={query.data?.data.email ?? ""}
              />
            </Field>
            <Field label={t("Phone")} error={errors.phone?.message}>
              <Input
                type="tel"
                autoComplete="tel"
                {...register("phone", { maxLength: 40 })}
              />
            </Field>
          </section>
          <section className="grid gap-4 border-t border-slate-200 pt-5 dark:border-slate-800">
            <h2 className="text-lg font-semibold">{t("Delivery details")}</h2>
            <Field
              label={t("Delivery address")}
              error={errors.address?.message}
            >
              <Textarea
                autoComplete="street-address"
                {...register("address", { maxLength: 2000 })}
              />
            </Field>
          </section>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t(
              "Saved details do not change delivery addresses on orders you already placed.",
            )}
          </p>
          <Button disabled={isSubmitting}>
            {isSubmitting ? t("Saving…") : t("Save profile")}
          </Button>
        </form>
      </Card>
    </>
  );
}

export function StoreOrders() {
  const { t, money, dateTime, locale } = useLocale();
  const [pageText, setPageText] = useListFilter("page", "1");
  const [search] = useListFilter("q", "");
  const [status] = useListFilter("status", "");
  const [dateFrom] = useListFilter("date_from", "");
  const [dateTo] = useListFilter("date_to", "");
  const filters = useForm<{
    q: string;
    status: string;
    date_from: string;
    date_to: string;
  }>({
    values: {
      q: search,
      status,
      date_from: displayDate(dateFrom),
      date_to: displayDate(dateTo),
    },
  });
  const page = Math.max(1, Number(pageText) || 1);
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set("q", search);
  if (status) params.set("status", status);
  if (dateFrom) params.set("date_from", dateFrom);
  if (dateTo) params.set("date_to", dateTo);
  const filtered = Boolean(search || status || dateFrom || dateTo);
  const applyFilters = (values: {
    q: string;
    status: string;
    date_from: string;
    date_to: string;
  }) => {
    setListFilters({
      q: values.q.trim() || null,
      status: values.status || null,
      date_from: parseDate(values.date_from),
      date_to: parseDate(values.date_to),
      page: null,
    });
  };
  const query = useQuery({
    queryKey: ["store", "orders", page, search, status, dateFrom, dateTo],
    queryFn: ({ signal }) =>
      api<Page<StoreOrder>>(`/store/orders?${params}`, { signal }),
    refetchOnWindowFocus: true,
  });
  const orders = query.data?.data ?? [];
  const last = query.data?.meta.last_page ?? 1;

  return (
    <>
      <PageHeading
        title={t("My orders")}
        description={t("Follow your orders from confirmation to delivery.")}
        action={
          <Button asChild variant="outline">
            <Link href="/shop">
              <ShoppingBag aria-hidden="true" />
              {t("Continue shopping")}
            </Link>
          </Button>
        }
      />
      <Card className="mb-5 p-4 sm:p-5">
        <form
          className="grid gap-4"
          onSubmit={filters.handleSubmit(applyFilters)}
        >
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <Field label={t("Order number")}>
              <Input
                type="search"
                dir="ltr"
                className={locale === "ar" ? "text-right" : "text-left"}
                maxLength={100}
                placeholder={t("Full or partial order number")}
                {...filters.register("q")}
              />
            </Field>
            <Field label={t("Status")}>
              <Select {...filters.register("status")}>
                <option value="">{t("All statuses")}</option>
                {[
                  "pending",
                  "confirmed",
                  "processing",
                  "completed",
                  "cancelled",
                ].map((value) => (
                  <option key={value} value={value}>
                    {t(value)}
                  </option>
                ))}
              </Select>
            </Field>
            <Controller
              name="date_from"
              control={filters.control}
              rules={{
                validate: (value) =>
                  !value ||
                  Boolean(parseDate(value)) ||
                  t("Enter a valid date as dd/mm/yyyy."),
              }}
              render={({ field, fieldState }) => (
                <Field label={t("From date")} error={fieldState.error?.message}>
                  <DateInput {...field} />
                </Field>
              )}
            />
            <Controller
              name="date_to"
              control={filters.control}
              rules={{
                validate: (value) => {
                  if (!value) return true;
                  const end = parseDate(value),
                    start = parseDate(filters.getValues("date_from"));
                  if (!end) return t("Enter a valid date as dd/mm/yyyy.");
                  return (
                    !start ||
                    end >= start ||
                    t("End date must be on or after start date.")
                  );
                },
              }}
              render={({ field, fieldState }) => (
                <Field label={t("To date")} error={fieldState.error?.message}>
                  <DateInput {...field} />
                </Field>
              )}
            />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("Dates and times are in Damascus time (24-hour).")}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit">{t("Search orders")}</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                filters.reset({
                  q: "",
                  status: "",
                  date_from: "",
                  date_to: "",
                });
                applyFilters({ q: "", status: "", date_from: "", date_to: "" });
              }}
            >
              {t("Clear filters")}
            </Button>
            {query.data && !query.isError && (
              <p
                role="status"
                className="ms-auto text-sm text-slate-500 dark:text-slate-400"
              >
                {t("{count} matching orders", { count: query.data.meta.total })}
              </p>
            )}
          </div>
        </form>
      </Card>
      {query.isLoading ? (
        <div role="status" aria-busy="true" className="grid gap-4">
          <span className="sr-only">{t("Loading")}</span>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="panel space-y-5 p-5 motion-safe:animate-pulse"
              aria-hidden="true"
            >
              <div className="flex justify-between gap-4">
                <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-5 w-16 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-10 rounded bg-slate-100 dark:bg-slate-800/60" />
            </div>
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => query.refetch()} />
      ) : orders.length === 0 ? (
        <Card className="flex flex-col items-center px-5 py-12 text-center">
          <span className="mb-4 grid size-12 place-items-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <ShoppingBag aria-hidden="true" className="size-5" />
          </span>
          <h2 className="font-semibold">
            {t(
              filtered
                ? "No orders match these filters"
                : "You have not placed an order yet",
            )}
          </h2>
          {filtered ? (
            <Button
              type="button"
              variant="outline"
              className="mt-6"
              onClick={() =>
                applyFilters({ q: "", status: "", date_from: "", date_to: "" })
              }
            >
              {t("Clear filters")}
            </Button>
          ) : (
            <Button asChild className="mt-6">
              <Link href="/shop">{t("Continue shopping")}</Link>
            </Button>
          )}
        </Card>
      ) : (
        <>
          <ul className="grid gap-4">
            {orders.map((order) => (
              <li key={order.id}>
                <article className="panel overflow-hidden">
                  <div className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5">
                    <div className="min-w-0">
                      <h2 className="flex flex-wrap items-center gap-x-2 text-base font-semibold">
                        <span>{t("Order")}</span>
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="rounded text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          <bdi dir="ltr">#{order.number.slice(0, 8)}</bdi>
                        </Link>
                      </h2>
                      <p className="mt-2 text-sm tabular-nums text-slate-500 dark:text-slate-400">
                        <time dateTime={order.created_at}>
                          <bdi dir="ltr">{dateTime(order.created_at)}</bdi>
                        </time>
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/80 bg-slate-50/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/20 sm:px-5">
                    <dl className="flex min-w-0 flex-wrap gap-x-8 gap-y-3 text-sm">
                      <div>
                        <dt className="text-slate-500 dark:text-slate-400">
                          {t("Total")}
                        </dt>
                        <dd className="mt-1 font-semibold">
                          <bdi dir="auto">{money(order.total_minor)}</bdi>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500 dark:text-slate-400">
                          {t("Payment")}
                        </dt>
                        <dd className="mt-1">
                          {order.payment_status === "paid"
                            ? t("Paid")
                            : order.payment_method === "cash_on_delivery"
                              ? t("Cash on delivery")
                              : t("Not recorded")}
                        </dd>
                      </div>
                    </dl>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full bg-white dark:bg-slate-900 sm:w-auto"
                    >
                      <Link href={`/account/orders/${order.id}`}>
                        <span>{t("View order")}</span>
                        <ArrowLeft
                          aria-hidden="true"
                          className="ltr:rotate-180"
                        />
                        <span className="sr-only">
                          <bdi dir="ltr">#{order.number.slice(0, 8)}</bdi>
                        </span>
                      </Link>
                    </Button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
          {last > 1 && (
            <div className="mt-5">
              <Pagination
                page={page}
                last={last}
                onPage={(value) => setPageText(String(value))}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}

export function StoreOrderDetail({ id }: { id: number }) {
  const { t, errorText, money, dateTime } = useLocale();

  const client = useQueryClient(),
    [confirm, setConfirm] = useState(false);
  const [placed] = useListFilter("placed", "");
  const query = useQuery({
    queryKey: ["store", "orders", "detail", id],
    queryFn: ({ signal }) =>
      api<Resource<StoreOrder>>(`/store/orders/${id}`, { signal }),
    refetchOnWindowFocus: true,
  });
  const cancel = useMutation({
    mutationFn: () => api(`/store/orders/${id}/cancel`, { method: "POST" }),
    onSuccess: async () => {
      setConfirm(false);
      await client.invalidateQueries({ queryKey: ["store", "orders"] });
      toast.success(t("Order cancelled"));
    },
    onError: async (error) => {
      toast.error(errorText(error.message));
      await query.refetch();
    },
  });
  if (query.isLoading) return <Loading />;
  if (query.isError)
    return <ErrorState error={query.error} retry={() => query.refetch()} />;
  if (!query.data) return null;
  const order = query.data.data,
    steps = ["pending", "confirmed", "processing", "completed"],
    current = steps.indexOf(order.status);
  return (
    <>
      {placed === "1" && (
        <p
          role="status"
          className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200"
        >
          {t("Your order has been placed. Pay on delivery.")}
        </p>
      )}
      <Link
        href="/account/orders"
        className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("My orders")}
      </Link>
      <PageHeading
        title={t("Order #{number}", { number: order.number.slice(0, 8) })}
        description={t("Placed {date}", { date: dateTime(order.created_at) })}
        action={
          <Badge
            tone={
              order.status === "cancelled"
                ? "red"
                : order.status === "completed"
                  ? "green"
                  : "indigo"
            }
          >
            {order.status}
          </Badge>
        }
      />
      <p className="mb-5 break-all text-sm text-slate-500">
        <span>{t("Order number")}: </span>
        <bdi dir="ltr">{order.number}</bdi>
      </p>
      <Card className="mb-6">
        {order.status === "cancelled" ? (
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
            {t("This order was cancelled.")}
          </p>
        ) : (
          <ol className="grid gap-5 sm:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step} className="flex items-center gap-3">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${index <= current ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 dark:bg-slate-800"}`}
                >
                  {index < current ? (
                    <Check className="h-4 w-4" />
                  ) : index === current ? (
                    <PackageCheck className="h-4 w-4" />
                  ) : (
                    <Clock3 className="h-4 w-4" />
                  )}
                </span>
                <span className="text-sm font-semibold capitalize">
                  {step === "completed" ? t("completed") : t(step)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </Card>
      <div className="grid items-start gap-6 lg:grid-cols-[1.7fr_1fr]">
        <Card>
          <h2 className="mb-4 font-bold">{t("Ordered items")}</h2>
          <DataTable
            rows={order.items ?? []}
            columns={[
              {
                label: t("Product"),
                render: (item) => (
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <bdi dir="ltr">{item.sku}</bdi>
                    </p>
                  </div>
                ),
              },
              { label: t("Quantity"), render: (item) => item.quantity },
              {
                label: t("Unit price"),
                render: (item) => (
                  <bdi dir="auto">{money(item.unit_price_minor)}</bdi>
                ),
              },
              {
                label: t("Total"),
                render: (item) => (
                  <bdi dir="auto">{money(item.subtotal_minor)}</bdi>
                ),
              },
            ]}
          />
          <dl className="ms-auto mt-6 grid max-w-xs gap-3 border-t border-slate-200 pt-5 text-sm dark:border-slate-700">
            <div className="flex justify-between">
              <dt>{t("Subtotal")}</dt>
              <dd>
                <bdi dir="auto">{money(order.subtotal_minor)}</bdi>
              </dd>
            </div>
            {order.discount_minor > 0 && (
              <div className="flex justify-between">
                <dt>{t("Discount")}</dt>
                <dd>
                  −<bdi dir="auto">{money(order.discount_minor)}</bdi>
                </dd>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <dt>{t("Total")}</dt>
              <dd>
                <bdi dir="auto">{money(order.total_minor)}</bdi>
              </dd>
            </div>
          </dl>
        </Card>
        <div className="grid gap-5">
          <Card>
            <h2 className="font-bold">{t("Payment")}</h2>
            <p className="mt-3 text-sm">
              {order.payment_method === "cash_on_delivery"
                ? t("Cash on delivery")
                : t("Payment method not recorded")}
            </p>
            <p className="mt-3">
              <Badge tone={order.payment_status === "paid" ? "green" : "amber"}>
                {order.payment_status === "paid"
                  ? t("Payment collected")
                  : order.status === "cancelled"
                    ? t("Order cancelled")
                    : order.payment_method === "cash_on_delivery"
                      ? t("Not yet collected")
                      : t("Not recorded")}
              </Badge>
            </p>
          </Card>
          {order.shipping && (
            <Card>
              <h2 className="font-bold">{t("Delivery address")}</h2>
              <p className="mt-3 text-sm font-semibold">
                {order.shipping.name}
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                <bdi dir="ltr">{order.shipping.phone}</bdi>
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-500 dark:text-slate-400">
                {order.shipping.address}
              </p>
            </Card>
          )}
          {order.can_cancel && (
            <Card>
              <h2 className="font-bold">{t("Need to cancel?")}</h2>
              <p className="my-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {t(
                  "You can cancel while the order is pending. After confirmation, contact the store.",
                )}
              </p>
              <Button variant="destructive" onClick={() => setConfirm(true)}>
                {t("Cancel order")}
              </Button>
            </Card>
          )}
        </div>
      </div>
      <Dialog
        open={confirm}
        onOpenChange={(open) => {
          if (!cancel.isPending) setConfirm(open);
        }}
        title={t("Cancel this order?")}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t(
            "The store will recheck its current status before cancelling and restoring the items to stock.",
          )}
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button
            variant="outline"
            disabled={cancel.isPending}
            onClick={() => setConfirm(false)}
          >
            {t("Keep order")}
          </Button>
          <Button
            variant="destructive"
            disabled={cancel.isPending}
            onClick={() => cancel.mutate()}
          >
            {cancel.isPending ? t("Cancelling…") : t("Confirm cancellation")}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
