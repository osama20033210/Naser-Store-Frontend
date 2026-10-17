"use client";
import { useLocale, LanguageSwitcher } from "@/components/locale-provider";
import { ThemeToggle } from "@/components/theme-provider";

import { Boxes, LogOut, Search, ShoppingBag, UserRound, Menu } from "lucide-react";
import { useState } from "react";
import { Dialog } from "@/components/ui";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/components/providers";
import { useCart } from "@/components/cart-provider";
import { Button, Card, Input, Loading } from "@/components/ui";
import { brand } from "@/lib/brand";
import { PageTransition } from "@/components/page-transition";
import { StoreCategoryMenu } from "@/components/store-category-menu";

export function StoreShell({ children }: { children: ReactNode }) {
  const { t } = useLocale();
  const pathname = usePathname(), router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const auth = useAuth(),
    cart = useCart();
  return (
    <div className="storefront flex min-h-screen flex-col bg-[var(--surface-canvas)]">
      <div className="bg-slate-950 px-4 py-2 text-center text-xs leading-5 text-slate-100">{t("Order online. Pay on delivery. Track your order in your account.")}</div>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-slate-950 dark:text-slate-100"
          >
            <span className="rounded-xl bg-indigo-600 p-2 text-white">
              <Boxes className="h-5 w-5" />
            </span>
            {brand.name}
          </Link>
          <div className="order-2 flex justify-end gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <nav
            aria-label={t("Store navigation")}
            className="order-3 col-span-2 flex items-center justify-end gap-2 text-sm lg:col-span-1"
          >
            <Link
              href="/cart"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 font-semibold leading-none text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">{t("Cart")}</span>
              <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
                {cart.ready ? cart.count : 0}
              </span>
            </Link>
            {auth.user ? (
              <>
                <Link
                  aria-label={t(
                    auth.user.account_type === "customer"
                      ? "My account"
                      : "Team workspace",
                  )}
                  className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-xl px-2 font-semibold leading-none text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 sm:px-4"
                  href={
                    auth.user.account_type === "customer"
                      ? "/account/orders"
                      : "/dashboard"
                  }
                >
                  <UserRound className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {auth.user.account_type === "customer"
                      ? t("My account")
                      : t("Team workspace")}
                  </span>
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={auth.logout}
                  aria-label={t("Sign out")}
                  className="text-slate-500 dark:text-slate-400"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button asChild variant="outline" className="px-3 sm:px-4">
                <Link href="/login">{t("Sign in")}</Link>
              </Button>
            )}
          </nav>
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-6">
          <Button type="button" variant="outline" className="md:hidden" onClick={() => setMenuOpen(true)}><Menu aria-hidden="true"/>{t("Menu")}</Button>
          <nav aria-label={t("Browse store")} className="hidden shrink-0 items-center gap-1 text-sm font-medium md:flex">
            {[{ href: "/", label: "Home" }, { href: "/shop", label: "Shop" }, { href: "/journal", label: "Journal" }, { href: "/contact", label: "Contact" }].map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-control px-3 ${pathname === item.href ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>{t(item.label)}</Link>)}
            <StoreCategoryMenu/>
          </nav>
          <form role="search" className="relative ms-auto min-w-0 flex-1 md:max-w-md" action="/shop" onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); router.push(`/shop?q=${encodeURIComponent(String(data.get("q") ?? "").trim())}`); }}>
            <Input name="q" type="search" maxLength={100} aria-label={t("Search store products")} placeholder={t("Search store products")} className="pe-12"/>
            <button type="submit" aria-label={t("Search products")} className="absolute end-0 top-0 grid size-11 place-items-center rounded-control text-slate-500"><Search aria-hidden="true" className="size-4"/></button>
          </form>
        </div>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6"
      >
        <PageTransition>{children}</PageTransition>
      </main>
      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 text-sm text-slate-600 dark:text-slate-400 sm:grid-cols-[1.5fr_1fr_1fr]">
          <div><Link href="/" className="text-lg font-semibold text-slate-950 dark:text-slate-100">{brand.name}</Link><p className="mt-3 max-w-sm leading-7">{t("Browse the catalog, order online and manage your purchases in one place.")}</p></div>
          <div><h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">{t("Shopping")}</h2><div className="grid justify-items-start gap-1"><Link href="/shop" className="py-2">{t("Shop")}</Link><Link href="/cart" className="py-2">{t("Cart")}</Link><Link href="/account/orders" className="py-2">{t("My orders")}</Link></div></div>
          <div><h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">{t("Help & information")}</h2><div className="grid justify-items-start gap-1"><Link href="/contact" className="py-2">{t("Contact")}</Link><Link href="/information" className="py-2">{t("Ordering & payment")}</Link><Link href="/policies" className="py-2">{t("Store policies")}</Link></div></div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 border-t border-slate-100 px-6 py-5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <p>
            {brand.name} {t("· Order online, pay on delivery.")}
          </p>
          <div className="flex gap-5">
            <Link href="/account/orders">{t("Track orders")}</Link>
          </div>
        </div>
      </footer>
      <Dialog open={menuOpen} onOpenChange={setMenuOpen} title={t("Browse store")} className="storefront" drawer><nav className="grid gap-2">{[{ href: "/", label: "Home" }, { href: "/shop", label: "Shop" }, { href: "/cart", label: "Cart" }, { href: "/journal", label: "Journal" }, { href: "/account/orders", label: "My orders" }, { href: "/contact", label: "Contact" }, { href: "/information", label: "Ordering & payment" }].map(item => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} aria-current={pathname === item.href ? "page" : undefined} className="flex min-h-11 items-center rounded-control px-3 py-2 hover:bg-indigo-50 dark:hover:bg-slate-800">{t(item.label)}</Link>)}</nav></Dialog>
    </div>
  );
}

export function CustomerGate({
  children,
  checkout = false,
}: {
  children: ReactNode;
  checkout?: boolean;
}) {
  const { t } = useLocale();

  const auth = useAuth();
  if (auth.loading) return <Loading />;
  if (!auth.user)
    return (
      <Card className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-black">{t("Sign in to continue")}</h1>
        <p className="my-4 text-sm text-slate-500 dark:text-slate-400">
          {t("Your account keeps delivery details and order history together.")}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href={`/login${checkout ? "?returnTo=/checkout" : ""}`}>
              {t("Sign in")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/register${checkout ? "?returnTo=/checkout" : ""}`}>
              {t("Create an account")}
            </Link>
          </Button>
        </div>
      </Card>
    );
  if (auth.user.account_type !== "customer")
    return (
      <Card className="mx-auto max-w-lg text-center">
        <h1 className="text-xl font-bold">{t("Customer account required")}</h1>
        <p className="my-4 text-sm text-slate-500 dark:text-slate-400">
          {t(
            "You are signed in with a team account. Use a customer account to place personal storefront orders.",
          )}
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={auth.logout}>{t("Sign out")}</Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">{t("Team workspace")}</Link>
          </Button>
        </div>
      </Card>
    );
  return children;
}
