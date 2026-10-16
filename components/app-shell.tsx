"use client";
import { useLocale, LanguageSwitcher } from "@/components/locale-provider";
import { ThemeToggle } from "@/components/theme-provider";


import {
  Boxes,
  ChartNoAxesCombined,
  ChevronRight,
  ClipboardList,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBasket,
  Tags,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/providers";
import { Loading } from "@/components/ui";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";

const links = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: ChartNoAxesCombined,
    permission: "dashboard.view",
  },
  {
    href: "/dashboard/orders",
    label: "Orders",
    icon: ClipboardList,
    permission: "orders.view",
  },
  {
    href: "/dashboard/products",
    label: "Products",
    icon: Package,
    permission: "products.view",
  },
  {
    href: "/dashboard/categories",
    label: "Categories",
    icon: Tags,
    permission: "categories.view",
  },
  {
    href: "/dashboard/customers",
    label: "Customers",
    icon: Users,
    permission: "customers.view",
  },
  {
    href: "/dashboard/inventory",
    label: "Inventory",
    icon: Warehouse,
    permission: "inventory.view",
  },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];
export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useLocale();

  const { user, loading, can, logout } = useAuth(),
    router = useRouter(),
    path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (user?.account_type === "customer") router.replace("/account/orders");
  }, [loading, user, router]);
  if (loading || !user || user.account_type === "customer") return <Loading />;
  const current =
    links.find((link) => path === link.href) ||
    links.slice(1).find((link) => path.startsWith(link.href + "/"));
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      {open && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label={t("Close menu")}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-40 flex w-[250px] flex-col bg-slate-950 p-4 text-slate-300 transition-transform lg:sticky lg:top-0 lg:h-screen",
          open ? "translate-x-0" : "hidden lg:flex lg:translate-x-0",
        )}
      >
        <div className="flex h-14 items-center justify-between px-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-black text-white"
          >
            <span className="rounded-xl bg-indigo-600 p-2">
              <Boxes className="h-5 w-5" />
            </span>
            {brand.name}
          </Link>
          <button className="lg:hidden" aria-label={t("Close navigation")} onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>
        <nav className="mt-7 grid gap-1">
          {links
            .filter((l) => !l.permission || can(l.permission))
            .map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
                  path === href ||
                    (href !== "/dashboard" && path.startsWith(href + "/"))
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {t(label)}
              </Link>
            ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-white/5 p-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500 font-bold text-white">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user.name}
              </p>
              <p className="truncate text-xs text-slate-400">
                {user.roles.map(role => t(role)).join("، ")}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" /> {t("Sign out")} </button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
              onClick={() => setOpen(true)}
                aria-label={t("Open navigation")}
                aria-expanded={open}
            >
              <Menu />
            </button>
            <div className="flex min-w-0 items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <ShoppingBasket className="hidden h-4 w-4 sm:block" />
              <ChevronRight className="hidden h-3 w-3 sm:block" />
              <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
                {t(current?.label ?? "Workspace")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2"><LanguageSwitcher/><ThemeToggle/></div>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
