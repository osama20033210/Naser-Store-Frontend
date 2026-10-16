import { StoreShell } from "@/components/store-shell";
import { brand } from "@/lib/brand";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, translate } from "@/lib/i18n";
export async function generateMetadata(){
  const locale=(await cookies()).get(LOCALE_COOKIE)?.value === "ar" ? "ar" : "en";
  return {title:`${brand.name} — ${translate(locale,"Shop")}`,description:locale === "ar" ? "تصفح المنتجات واطلب عبر المتجر وادفع عند الاستلام وتابع طلباتك." : "Browse products, order online, pay on delivery and track your orders."};
}
export default function Layout({children}:{children:React.ReactNode}){return <StoreShell>{children}</StoreShell>}
