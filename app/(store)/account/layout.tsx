"use client";
import { useLocale } from "@/components/locale-provider";

import Link from "next/link";
import { CustomerGate } from "@/components/store-shell";
export default function Layout({children}:{children:React.ReactNode}){
  const { t } = useLocale();
return <CustomerGate><nav aria-label={t("Customer account")} className="mb-7 flex gap-5 border-b border-slate-200 pb-4 text-sm font-semibold text-indigo-600 dark:border-slate-700 dark:text-indigo-400"><Link href="/account/orders">{t("My orders")}</Link><Link href="/account">{t("Profile & delivery details")}</Link></nav>{children}</CustomerGate>}
