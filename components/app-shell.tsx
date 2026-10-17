"use client";

import * as Drawer from "@radix-ui/react-dialog";
import { Boxes, ChartNoAxesCombined, ChevronRight, ClipboardList, LogOut, Menu, Package, PanelLeftClose, PanelLeftOpen, Settings, ShoppingBag, Tags, Users, Warehouse, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useLocale, LanguageSwitcher } from "@/components/locale-provider";
import { ThemeToggle } from "@/components/theme-provider";
import { useAuth } from "@/components/providers";
import { Button, Loading } from "@/components/ui";
import { PageTransition } from "@/components/page-transition";
import { MotionProvider } from "@/components/motion-provider";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";

const links = [
  { href: "/dashboard", label: "Overview", icon: ChartNoAxesCombined, permission: "dashboard.view", group: "Workspace" },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList, permission: "orders.view", group: "Operations" },
  { href: "/dashboard/products", label: "Products", icon: Package, permission: "products.view", group: "Operations" },
  { href: "/dashboard/categories", label: "Categories", icon: Tags, permission: "categories.view", group: "Operations" },
  { href: "/dashboard/customers", label: "Customers", icon: Users, permission: "customers.view", group: "Operations" },
  { href: "/dashboard/inventory", label: "Inventory", icon: Warehouse, permission: "inventory.view", group: "Operations" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, group: "Account" },
];

export function AppShell({ children, initialCollapsed = false }: { children: ReactNode; initialCollapsed?: boolean }) {
  const { t, locale } = useLocale(), { user, loading, can, logout } = useAuth();
  const router = useRouter(), path = usePathname();
  const [open, setOpen] = useState(false), [collapsed, setCollapsed] = useState(initialCollapsed);
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (user?.account_type === "customer") router.replace("/account/orders");
  }, [loading, user, router]);
  if (loading || !user || user.account_type === "customer") return <Loading/>;

  const current = links.find(link => path === link.href) || links.slice(1).find(link => path.startsWith(link.href + "/"));
  const detail = path.endsWith("/new") ? "New" : path.endsWith("/edit") ? "Edit" : /\/\d+$/.test(path) ? "Details" : null;
  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `naser-sidebar=${next ? "collapsed" : "expanded"}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  };
  const navigation = (compact: boolean) => <>
    <Link href="/dashboard" aria-label={brand.name} onClick={() => setOpen(false)} className={cn("mb-6 flex min-h-12 items-center gap-2.5 px-2 text-base font-semibold", compact && "justify-center px-0")}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm"><Boxes aria-hidden="true" className="h-5 w-5"/></span>
      <span className={compact ? "sr-only" : "truncate"}>{brand.name}</span>
    </Link>
    <nav aria-label={t("Workspace navigation")} className="grid gap-5">
      {["Workspace", "Operations", "Account"].map(group => {
        const visible = links.filter(link => link.group === group && (!link.permission || can(link.permission)));
        if (!visible.length) return null;
        return <div key={group}>
          <p className={cn("mb-2 px-3 text-xs font-medium text-slate-500 dark:text-slate-400", compact && "sr-only")}>{t(group)}</p>
          <div className="grid gap-1">{visible.map(({href, label, icon: Icon}) => {
            const active = path === href || href !== "/dashboard" && path.startsWith(href + "/");
            return <Link key={href} href={href} title={compact ? t(label) : undefined} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)} className={cn("workspace-link relative flex h-11 items-center gap-3 rounded-control px-3 text-sm font-medium", compact && "justify-center px-0", active ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70")}>
              <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0"/><span className={compact ? "sr-only" : "truncate"}>{t(label)}</span>
              {active && <span aria-hidden="true" className="absolute end-0 h-4 w-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400"/>}
            </Link>;
          })}</div>
        </div>;
      })}
    </nav>
    <div className="mt-auto border-t border-[var(--border-subtle)] pt-4">
      <Link href="/dashboard/settings" title={compact ? user.name : undefined} onClick={() => setOpen(false)} className={cn("flex min-h-12 min-w-0 items-center gap-2.5 rounded-control p-2 hover:bg-slate-100 dark:hover:bg-slate-800/70", compact && "justify-center px-0")}>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-100">{user.name.slice(0, 1).toUpperCase()}</span>
        <span className={compact ? "sr-only" : "min-w-0"}><span className="block truncate text-sm font-medium">{user.name}</span><span className="muted-copy block truncate text-xs">{user.roles.map(role => t(role)).join(locale === "ar" ? "، " : ", ")}</span></span>
      </Link>
      <Button type="button" variant="ghost" className={cn("mt-1 w-full justify-start text-slate-500 dark:text-slate-400", compact && "justify-center px-0")} title={compact ? t("Sign out") : undefined} onClick={logout}><LogOut aria-hidden="true"/><span className={compact ? "sr-only" : undefined}>{t("Sign out")}</span></Button>
    </div>
  </>;

  return <MotionProvider><Drawer.Root open={open} onOpenChange={setOpen}><div className="workspace-layout min-h-screen bg-[var(--surface-canvas)] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]" style={{"--sidebar-width": collapsed ? "80px" : "240px"} as CSSProperties}>
    <aside id="workspace-sidebar" aria-label={t("Workspace navigation")} className="sticky top-0 hidden h-dvh flex-col overflow-y-auto border-e border-[var(--border-subtle)] bg-[var(--surface-panel)] px-3 py-5 lg:flex">{navigation(collapsed)}</aside>
    <Drawer.Portal><Drawer.Overlay className="drawer-overlay fixed inset-0 z-40 bg-slate-950/60 lg:hidden"/><Drawer.Content className="drawer-panel fixed inset-y-0 start-0 z-50 flex w-[min(86vw,288px)] flex-col overflow-y-auto border-e border-[var(--border-subtle)] bg-[var(--surface-panel)] p-4 shadow-floating lg:hidden"><Drawer.Title className="sr-only">{t("Workspace navigation")}</Drawer.Title><Drawer.Description className="sr-only">{t("Choose a workspace page.")}</Drawer.Description><Drawer.Close asChild><Button variant="ghost" size="icon" aria-label={t("Close navigation")} className="absolute end-2 top-2"><X/></Button></Drawer.Close>{navigation(false)}</Drawer.Content></Drawer.Portal>
    <div className="min-w-0">
      <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-2 border-b border-[var(--border-subtle)] bg-[var(--surface-panel)] px-3 py-2 md:px-6">
        <div className="flex min-w-0 items-center gap-1 sm:gap-3">
          <Drawer.Trigger asChild><Button variant="ghost" size="icon" aria-label={t("Open navigation")} className="lg:hidden"><Menu/></Button></Drawer.Trigger>
          <Button variant="ghost" size="icon" aria-label={t(collapsed ? "Expand sidebar" : "Collapse sidebar")} aria-controls="workspace-sidebar" aria-expanded={!collapsed} onClick={toggleSidebar} className="hidden text-slate-500 lg:inline-flex">{collapsed ? <PanelLeftOpen/> : <PanelLeftClose/>}</Button>
          <nav aria-label={t("Breadcrumbs")} className="flex min-w-0 items-center gap-2 text-sm"><Link href={current?.href ?? "/dashboard"} className="muted-copy truncate">{t(current?.label ?? "Workspace")}</Link>{detail && <><ChevronRight aria-hidden="true" className="h-3 w-3 shrink-0 text-slate-400"/><span aria-current="page" className="truncate font-medium">{t(detail)}</span></>}</nav>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2"><Button asChild variant="ghost" size="icon" className="hidden text-slate-500 sm:inline-flex"><Link href="/shop" aria-label={t("Shop")} title={t("Shop")}><ShoppingBag/></Link></Button><LanguageSwitcher/><ThemeToggle/></div>
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-[1600px] p-4 outline-none md:p-6 xl:p-8"><PageTransition>{children}</PageTransition></main>
    </div>
  </div></Drawer.Root></MotionProvider>;
}
