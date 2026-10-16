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
import { Languages } from "lucide-react";
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
    document.title = `${brand.name} — ${translate(locale, path === "/login" ? "Sign in" : "Shop")}`;
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
      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold leading-none text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
    >
      <Languages aria-hidden="true" className="hidden h-4 w-4 sm:block" />
      {locale === "ar" ? "English" : "العربية"}
    </button>
  );
}
