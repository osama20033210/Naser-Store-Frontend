"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, Clock3, ShoppingBag } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { Button, Card } from "@/components/ui";

type Contact = { email: string | null; phone: string | null; address: string | null; hours: string | null };
export function StoreContact({ contact }: { contact: Contact }) {
  const { t } = useLocale();
  const configured = Boolean(contact.email || contact.phone || contact.address);
  return <div className="mx-auto max-w-5xl"><div className="mb-8 max-w-2xl"><p className="mb-3 text-sm font-medium text-indigo-700 dark:text-indigo-300">{t("Naser Store")}</p><h1 className="text-3xl font-semibold">{t("Contact the store")}</h1><p className="mt-4 leading-7 text-slate-500 dark:text-slate-400">{t("For an order question, keep your order number handy.")}</p></div>
    <div className="grid items-start gap-6 md:grid-cols-[1.3fr_1fr]"><Card><h2 className="mb-6 text-lg font-semibold">{t("Contact details")}</h2><dl className="space-y-6">
      {contact.email && <div className="flex gap-3"><Mail aria-hidden="true" className="mt-1 size-5 shrink-0 text-indigo-600"/><div className="min-w-0"><dt className="text-sm text-slate-500">{t("Email")}</dt><dd className="mt-1 break-all"><a href={`mailto:${contact.email}`}><bdi dir="ltr">{contact.email}</bdi></a></dd></div></div>}
      {contact.phone && <div className="flex gap-3"><Phone aria-hidden="true" className="mt-1 size-5 shrink-0 text-indigo-600"/><div><dt className="text-sm text-slate-500">{t("Phone")}</dt><dd className="mt-1"><a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}><bdi dir="ltr">{contact.phone}</bdi></a></dd></div></div>}
      {contact.address && <div className="flex gap-3"><MapPin aria-hidden="true" className="mt-1 size-5 shrink-0 text-indigo-600"/><div><dt className="text-sm text-slate-500">{t("Address")}</dt><dd className="mt-1 whitespace-pre-wrap leading-7">{contact.address}</dd></div></div>}
      {contact.hours && <div className="flex gap-3"><Clock3 aria-hidden="true" className="mt-1 size-5 shrink-0 text-indigo-600"/><div><dt className="text-sm text-slate-500">{t("Opening hours")}</dt><dd className="mt-1 leading-7">{contact.hours}</dd></div></div>}
    </dl>{!configured && <p role="status" className="rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{t("Contact details have not been configured by the store owner yet.")}</p>}</Card>
    <Card className="bg-orange-50/50 dark:bg-slate-900"><ShoppingBag aria-hidden="true" className="mb-4 size-6 text-indigo-600 dark:text-indigo-400"/><h2 className="text-lg font-semibold">{t("Looking for an order?")}</h2><p className="my-4 text-sm leading-7 text-slate-600 dark:text-slate-400">{t("Sign in to view the saved delivery details, total and current status of your orders.")}</p><Button asChild variant="outline"><Link href="/account/orders">{t("My orders")}</Link></Button></Card></div>
  </div>;
}

export function StoreInformation() {
  const { t } = useLocale();
  const sections = [
    { title: "Ordering", copy: "Add available products to your cart, sign in or create an account, and enter your delivery details. You can review the order before submitting it." },
    { title: "Payment", copy: "Payment is cash on delivery. This store does not collect card information. Prices are shown in USD; the checkout currently adds no tax or delivery fee." },
    { title: "Prices & availability", copy: "The store checks product prices and inventory again when you submit an order. If either changes, review the updated cart before continuing." },
    { title: "Tracking & cancellation", copy: "Your account shows the current order status and saved delivery details. You can cancel a storefront order while it is pending. After confirmation, contact the store." },
  ];
  return <div className="mx-auto max-w-3xl"><h1 className="mb-8 text-3xl font-semibold">{t("Ordering & payment")}</h1><div className="grid gap-5">{sections.map(section => <Card key={section.title}><h2 className="text-lg font-semibold">{t(section.title)}</h2><p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{t(section.copy)}</p></Card>)}</div><Button asChild variant="outline" className="mt-6"><Link href="/contact">{t("Contact the store")}</Link></Button></div>;
}

export function StorePolicies({ english, arabic }: { english: string | null; arabic: string | null }) {
  const { locale, t } = useLocale();
  const content = locale === "ar" ? arabic : english;
  return <div className="mx-auto max-w-3xl"><h1 className="mb-8 text-3xl font-semibold">{t("Store policies")}</h1><Card>{content ? <div className="whitespace-pre-wrap text-sm leading-8">{content}</div> : <p role="status" className="text-sm leading-7 text-slate-600 dark:text-slate-400">{t("Store policies have not been published in this language yet. Contact the store for returns, privacy and delivery terms before ordering.")}</p>}</Card><Button asChild variant="outline" className="mt-6"><Link href="/contact">{t("Contact the store")}</Link></Button></div>;
}
