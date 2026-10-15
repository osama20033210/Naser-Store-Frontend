import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${brand.name} — Operations`,
  applicationName: brand.name,
  description: `${brand.name} — order and inventory management`,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
