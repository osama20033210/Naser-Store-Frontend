"use client";
import { useLocale } from "@/components/locale-provider";

import { Button } from "@/components/ui";
export default function Error({reset}:{reset:()=>void}){
  const { t } = useLocale();
return <div className="p-8"><h2 className="text-xl font-bold">{t("Unable to display this page")}</h2><p className="my-4 text-sm text-slate-500 dark:text-slate-400">{t("Please try again. If the problem continues, contact your administrator.")}</p><Button onClick={reset}>{t("Try again")}</Button></div>}
