"use client";
import * as Drawer from "@radix-ui/react-dialog";
import { Boxes, ChartNoAxesCombined, ChevronRight, ClipboardList, LogOut, Menu, Package, Settings, ShoppingBag, Tags, Users, Warehouse, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useLocale, LanguageSwitcher } from "@/components/locale-provider";
import { ThemeToggle } from "@/components/theme-provider";
import { useAuth } from "@/components/providers";
import { Loading } from "@/components/ui";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";

const links = [
  { href: "/dashboard", label: "Overview", icon: ChartNoAxesCombined, permission: "dashboard.view" },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList, permission: "orders.view" },
  { href: "/dashboard/products", label: "Products", icon: Package, permission: "products.view" },
  { href: "/dashboard/categories", label: "Categories", icon: Tags, permission: "categories.view" },
  { href: "/dashboard/customers", label: "Customers", icon: Users, permission: "customers.view" },
  { href: "/dashboard/inventory", label: "Inventory", icon: Warehouse, permission: "inventory.view" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];
export function AppShell({ children }: { children: ReactNode }) {
  const { t, locale } = useLocale(), { user, loading, can, logout } = useAuth(), router = useRouter(), path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (user?.account_type === "customer") router.replace("/account/orders");
  }, [loading, user, router]);
  if (loading || !user || user.account_type === "customer") return <Loading/>;
  const current = links.find(link => path === link.href) || links.slice(1).find(link => path.startsWith(link.href + "/"));
  const detail = path.endsWith("/new") ? "New" : path.endsWith("/edit") ? "Edit" : /\/\d+$/.test(path) ? "Details" : null;
  const navigation = <>
    <Link href="/dashboard" onClick={() => setOpen(false)} className="mb-7 flex items-center gap-3 px-2 py-3 text-lg font-bold"><span className="rounded-xl bg-indigo-600 p-2 text-white"><Boxes className="h-5 w-5"/></span>{brand.name}</Link>
    <p className="mb-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400">{t("Workspace")}</p>
    <nav aria-label={t("Workspace navigation")} className="grid gap-1">{links.filter(link => !link.permission || can(link.permission)).map(({ href, label, icon: Icon }) => {
      const active = path === href || href !== "/dashboard" && path.startsWith(href + "/");
      return <Link key={href} href={href} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-xl border-s-2 px-3 py-3 text-sm font-medium", active ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300" : "border-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}><Icon className="h-4 w-4 shrink-0"/>{t(label)}</Link>;
    })}</nav>
    <div className="mt-auto border-t border-slate-200 pt-5 dark:border-slate-800"><div className="flex min-w-0 items-center gap-3 px-2"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 font-semibold dark:bg-slate-800">{user.name.slice(0,1).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-sm text-slate-500 dark:text-slate-400">{user.roles.map(role => t(role)).join(locale === "ar" ? "، " : ", ")}</p></div></div><button type="button" onClick={logout} className="mt-3 flex h-11 w-full items-center gap-2 rounded-xl px-4 text-sm font-semibold leading-none text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><LogOut className="h-4 w-4"/>{t("Sign out")}</button></div>
  </>;
  return <Drawer.Root open={open} onOpenChange={setOpen}><div className="min-h-screen lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
    <aside className="sticky top-0 hidden h-dvh flex-col border-e border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:flex">{navigation}</aside>
    <Drawer.Portal><Drawer.Overlay className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"/><Drawer.Content className="fixed inset-y-0 start-0 z-50 flex w-[min(86vw,280px)] flex-col overflow-y-auto bg-white p-4 shadow-xl dark:bg-slate-900 lg:hidden"><Drawer.Title className="sr-only">{t("Workspace navigation")}</Drawer.Title><Drawer.Description className="sr-only">{t("Choose a workspace page.")}</Drawer.Description><Drawer.Close aria-label={t("Close navigation")} className="absolute end-2 top-2 grid h-11 w-11 place-items-center rounded-xl"><X className="h-4 w-4"/></Drawer.Close>{navigation}</Drawer.Content></Drawer.Portal>
    <div className="min-w-0"><header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-2 border-b border-slate-200 bg-white/95 px-4 py-2 dark:border-slate-800 dark:bg-slate-950/95 md:px-6"><div className="flex min-w-0 items-center gap-2"><Drawer.Trigger asChild><button type="button" aria-label={t("Open navigation")} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl lg:hidden"><Menu className="h-5 w-5"/></button></Drawer.Trigger><nav aria-label={t("Breadcrumbs")} className="flex min-w-0 items-center gap-2 text-sm"><Link href={current?.href ?? "/dashboard"} className="truncate text-slate-600 dark:text-slate-300">{t(current?.label ?? "Workspace")}</Link>{detail && <><ChevronRight className="h-3 w-3 shrink-0 text-slate-400"/><span aria-current="page" className="font-medium">{t(detail)}</span></>}</nav></div><div className="flex shrink-0 items-center gap-2"><Link href="/shop" aria-label={t("Shop")} className="hidden h-11 w-11 place-items-center rounded-xl text-slate-500 sm:grid"><ShoppingBag className="h-5 w-5"/></Link><LanguageSwitcher/><ThemeToggle/></div></header><main id="main-content" className="mx-auto max-w-[1600px] p-4 md:p-6 xl:p-8">{children}</main></div>
  </div></Drawer.Root>;
}
