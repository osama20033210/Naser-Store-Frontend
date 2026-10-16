import { currentLocale, type Locale } from "@/lib/i18n";

export const money = (minor: number, locale: Locale = currentLocale()) =>
  new Intl.NumberFormat(locale === "ar" ? "ar" : "en-US", { style: "currency", currency: "USD" }).format(
    minor / 100,
  );
export const dateTime = (value: string, locale: Locale = currentLocale()) =>
  new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
