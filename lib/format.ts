import { currentLocale, type Locale } from "@/lib/i18n";

export const money = (minor: number, locale: Locale = currentLocale()) =>
  new Intl.NumberFormat(locale === "ar" ? "ar" : "en-US", {
    style: "currency",
    currency: "USD",
  }).format(minor / 100);
export const dateTime = (value: string, locale: Locale = currentLocale()) => {
  const parts = new Intl.DateTimeFormat(locale === "ar" ? "ar-SY" : "en-GB", {
    timeZone: "Asia/Damascus",
    calendar: "gregory",
    numberingSystem: "latn",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const part = (name: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === name)?.value;
  return `${part("day")}/${part("month")}/${part("year")}, ${part("hour")}:${part("minute")}`;
};
