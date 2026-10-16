"use client";
import { useLocale, LanguageSwitcher } from "@/components/locale-provider";
import { ThemeToggle } from "@/components/theme-provider";

import { Boxes, LogOut, Search, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/components/providers";
import { useCart } from "@/components/cart-provider";
import { Button, Card, Input, Loading } from "@/components/ui";
import { brand } from "@/lib/brand";

export function StoreShell({ children }: { children: ReactNode }) {
  const { t } = useLocale();

  const auth = useAuth(),
    cart = useCart();
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6 lg:grid-cols-[auto_minmax(180px,1fr)_auto_auto]">
          <Link
            href="/shop"
            className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-slate-950 dark:text-slate-100"
          >
            <span className="rounded-xl bg-indigo-600 p-2 text-white">
              <Boxes className="h-5 w-5" />
            </span>
            {brand.name}
          </Link>
          <div className="order-2 flex justify-end gap-2 lg:order-4"><LanguageSwitcher/><ThemeToggle/></div>
          <form action="/shop" method="get" role="search" className="relative order-3 min-w-0 lg:order-2">
            <Input name="q" aria-label={t("Search store products")} placeholder={t("Search products…")} className="pe-12" maxLength={100}/>
            <button type="submit" aria-label={t("Search products")} className="absolute inset-y-0 end-0 grid w-11 place-items-center rounded-e-xl text-slate-500"><Search className="h-4 w-4"/></button>
          </form>
          <nav
            aria-label={t("Store navigation")}
            className="order-4 flex items-center justify-end gap-2 text-sm lg:order-3"
          >
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
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
                  aria-label={t(auth.user.account_type === "customer" ? "My account" : "Team workspace")}
                  className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200"
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
                <button
                  onClick={auth.logout}
                  aria-label={t("Sign out")}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="font-semibold text-indigo-600 dark:text-indigo-400"
              >
                {t("Sign in")}
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-6 py-6 text-xs text-slate-500 dark:text-slate-400">
          <p>
            {brand.name} {t("· Order online, pay on delivery.")}
          </p>
          <div className="flex gap-5">
            <Link href="/account/orders">{t("Track orders")}</Link>
            <Link href="/login">{t("Team access")}</Link>
          </div>
        </div>
      </footer>
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
