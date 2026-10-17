"use client";
import { ImageOff } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

/** Keep the same aspect ratio for uploaded images and explicit missing/broken-image states. */
export function ProductMedia({ name, category, src, large = false, fit = "contain", priority = false }: { name: string; category?: string; src?: string | null; large?: boolean; fit?: "contain" | "cover"; priority?: boolean }) {
  const { t } = useLocale();
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (src && !failed) return <div className={cn("w-full overflow-hidden border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950",large?"aspect-[4/3] rounded-2xl border":"aspect-[4/3] border-b")}><img src={src} alt={name} width={640} height={480} loading={large || priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" onError={()=>setFailed(true)} className={cn("h-full w-full object-center",fit==="cover"?"object-cover":"object-contain")}/></div>;
  const initials = name.trim().split(/\s+/).slice(0, 2).map(word => Array.from(word)[0]).join("");
  return <div role="img" aria-label={t("No product image for {name}", { name })} className={cn("relative flex w-full flex-col items-center justify-center overflow-hidden border-b border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400", large ? "aspect-[4/3] rounded-2xl border" : "aspect-[4/3]")}><ImageOff aria-hidden="true" className="absolute end-4 top-4 h-5 w-5 opacity-60"/><span aria-hidden="true" className={cn("select-none font-bold tracking-tight text-indigo-300 dark:text-indigo-800", large ? "text-8xl" : "text-6xl")}>{initials}</span><span className="mt-3 max-w-[85%] truncate text-sm">{category}</span><span className="absolute bottom-3 text-xs">{t(src&&failed?"Image unavailable":"No image provided")}</span></div>;
}
