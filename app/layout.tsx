import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { brand } from "@/lib/brand";
import { cookies } from "next/headers";
import { LocaleProvider } from "@/components/locale-provider";
import { LOCALE_COOKIE, translate } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await cookies()).get(LOCALE_COOKIE)?.value === "ar" ? "ar" : "en";
  return {
    title: `${brand.name} — ${translate(locale, "Workspace")}`,
    applicationName: brand.name,
    description: locale === "ar" ? `${brand.name} — إدارة الطلبات والمخزون` : `${brand.name} — order and inventory management`,
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = (await cookies()).get(LOCALE_COOKIE)?.value === "ar" ? "ar" : "en";
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <body>
        <LocaleProvider initialLocale={locale}><Providers>{children}</Providers></LocaleProvider>
      </body>
    </html>
  );
}
