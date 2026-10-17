"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { brand } from "@/lib/brand";
import { money, dateTime } from "@/lib/format";
import {
  LOCALE_COOKIE,
  translate,
  translateError,
  type Locale,
  type TranslationValues,
} from "@/lib/i18n";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: TranslationValues) => string;
  errorText: (message: string) => string;
  money: (minor: number) => string;
  dateTime: (value: string) => string;
} | null>(null);

/** Shared language state preserves mounted forms, cart and authentication when toggled. */
export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale, updateLocale] = useState<Locale>(initialLocale);
  const path = usePathname();
  const value = useMemo(
    () => ({
      locale,
      setLocale: (next: Locale) => {
        document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
        document.documentElement.lang = next;
        document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
        updateLocale(next);
      },
      t: (key: string, values?: TranslationValues) =>
        translate(locale, key, values),
      errorText: (message: string) => translateError(locale, message),
      money: (minor: number) => money(minor, locale),
      dateTime: (value: string) => dateTime(value, locale),
    }),
    [locale],
  );
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    const pageTitle = path === "/" ? "Home" : path === "/login" ? "Sign in" : path === "/contact" ? "Contact" : path === "/information" ? "Ordering & payment" : path === "/policies" ? "Store policies" : path === "/cart" ? "Cart" : path === "/checkout" ? "Checkout" : path.startsWith("/account/orders") ? "My orders" : path === "/account" ? "Your profile" : "Shop";
    document.title = `${brand.name} — ${translate(locale, pageTitle)}`;
  }, [locale, path]);
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("LocaleProvider is missing");
  return value;
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
      lang={locale === "ar" ? "en" : "ar"}
      dir="auto"
      aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-control border border-slate-300 bg-white px-4 text-sm font-semibold leading-none text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
    >
      {locale === "ar" ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 76 40"
          className="h-4 w-6 shrink-0 overflow-hidden rounded-sm"
        >
          <rect width="76" height="40" fill="#fff" />
          {Array.from({ length: 7 }, (_, row) => (
            <rect
              key={row}
              y={(row * 80) / 13}
              width="76"
              height={40 / 13}
              fill="#b22234"
            />
          ))}
          <rect width="30.4" height={280 / 13} fill="#3c3b6e" />
          {Array.from({ length: 9 }, (_, row) =>
            Array.from({ length: row % 2 === 0 ? 6 : 5 }, (_, col) => (
              <path
                key={`${row}-${col}`}
                d="M0 -1.25 .28 -.39 1.19 -.39 .45 .15 .73 1.01 0 .48 -.73 1.01 -.45 .15 -1.19 -.39 -.28 -.39Z"
                transform={`translate(${((col + 1) * 30.4) / 7 + (row % 2 ? 30.4 / 14 : 0)} ${((row + 1) * 28) / 13})`}
                fill="#fff"
              />
            )),
          )}
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 60 40"
          className="h-4 w-6 shrink-0 overflow-hidden rounded-sm"
        >
          <path fill="#007a3d" d="M0 0h60v13.333H0z" />
          <path fill="#fff" d="M0 13.333h60v13.334H0z" />
          <path fill="#000" d="M0 26.667h60V40H0z" />
          {[15, 30, 45].map((x) => (
            <path
              key={x}
              d="M0 -5 1.12 -1.55 4.76 -1.55 1.82 .59 2.94 4.05 0 1.91 -2.94 4.05 -1.82 .59 -4.76 -1.55 -1.12 -1.55Z"
              transform={`translate(${x} 20)`}
              fill="#ce1126"
            />
          ))}
        </svg>
      )}
      {locale === "ar" ? "English" : "العربية"}
    </button>
  );
}
