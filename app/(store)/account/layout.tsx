"use client";
import { useLocale } from "@/components/locale-provider";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, UserRound } from "lucide-react";
import { CustomerGate } from "@/components/store-shell";
export default function Layout({children}:{children:React.ReactNode}){
  const { t } = useLocale();
  const pathname = usePathname();
  const links = [
    { href: "/account/orders", label: "My orders", icon: ShoppingBag, active: pathname.startsWith("/account/orders") },
    { href: "/account", label: "Profile & delivery details", icon: UserRound, active: pathname === "/account" },
  ];
  return <CustomerGate>
    <div className="mx-auto grid max-w-6xl items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
      <aside className="min-w-0 lg:sticky lg:top-48">
        <p className="mb-3 px-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{t("My account")}</p>
        <nav aria-label={t("Customer account")} className="panel grid grid-cols-2 gap-1 p-1.5 lg:grid-cols-1">
          {links.map(({ href, label, icon: Icon, active }) => <Link key={href} href={href} aria-current={active ? "page" : undefined}
            className={`flex min-h-12 items-center gap-2.5 rounded-control px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
            <Icon aria-hidden="true" className="size-4 shrink-0"/><span>{t(label)}</span>
          </Link>)}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  </CustomerGate>;
}
