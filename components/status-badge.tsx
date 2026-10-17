"use client";

import { useLocale } from "@/components/locale-provider";
import { Badge } from "@/components/ui";
import type { OrderStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useLocale();
  return <Badge className="capitalize" tone={status === "completed" ? "green" : status === "cancelled" ? "red" : status === "pending" ? "amber" : "indigo"}>{t(status)}</Badge>;
}
