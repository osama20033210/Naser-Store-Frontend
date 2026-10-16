"use client";
import { useLocale, LanguageSwitcher } from "@/components/locale-provider";
import { ThemeToggle } from "@/components/theme-provider";

import { Boxes, LogOut, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/components/providers";
import { useCart } from "@/components/cart-provider";
import { Button, Card, Loading } from "@/components/ui";
import { brand } from "@/lib/brand";

export function StoreShell({ children }: { children: ReactNode }) {
  const { t } = useLocale();

  const auth = useAuth(),
    cart = useCart();
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link
            href="/shop"
            className="flex items-center gap-2 font-black tracking-tight text-slate-950 dark:text-slate-100"
          >
            <span className="rounded-xl bg-indigo-600 p-2 text-white">
              <Boxes className="h-5 w-5" />
            </span>
            {brand.name}
          </Link>
          <nav
            aria-label={t("Store navigation")}
            className="flex flex-wrap items-center gap-3 text-sm"
          >
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <ShoppingBag className="h-4 w-4" />
              {t("Cart")}
              <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
                {cart.ready ? cart.count : 0}
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            {auth.user ? (
              <>
                <Link
                  className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400"
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
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
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
