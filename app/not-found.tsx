"use client";
import { useLocale } from "@/components/locale-provider";
import Link from "next/link";
export default function NotFound(){
  const { t } = useLocale();
return <main className="grid min-h-screen place-items-center p-6 text-center"><div><h1 className="text-3xl font-black">{t("Page not found")}</h1><Link className="mt-5 inline-block font-semibold text-indigo-600" href="/dashboard">{t("Return to workspace")}</Link></div></main>}
