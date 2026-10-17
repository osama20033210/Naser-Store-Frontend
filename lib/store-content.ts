import { cookies } from "next/headers";
import { LOCALE_COOKIE, translate } from "@/lib/i18n";
import { brand } from "@/lib/brand";

export async function storeMetadata(page: string) {
  const locale = (await cookies()).get(LOCALE_COOKIE)?.value === "ar" ? "ar" : "en";
  return { title: `${brand.name} — ${translate(locale, page)}` };
}

/** Public business information only; secrets and transport credentials must never be passed here. */
export function storeContact() {
  const email = process.env.STORE_CONTACT_EMAIL?.trim() ?? "";
  const phone = process.env.STORE_CONTACT_PHONE?.trim() ?? "";
  return {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null,
    phone: /^\+?[\d ()-]{5,40}$/.test(phone) ? phone : null,
    address: process.env.STORE_CONTACT_ADDRESS?.trim() || null,
    hours: process.env.STORE_CONTACT_HOURS?.trim() || null,
  };
}
