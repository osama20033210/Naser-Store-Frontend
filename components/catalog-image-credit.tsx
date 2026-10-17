"use client";

import { useLocale } from "@/components/locale-provider";

export function CatalogImageCredit({ credit }: { credit?: { author: string; source_url: string; license_url: string } | null }) {
  const { t } = useLocale();
  return <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">{t("Illustrative photo; the actual product may differ.")}{credit && <span className="block">{t("Photo")}: <a className="underline underline-offset-2" href={credit.source_url} target="_blank" rel="noopener noreferrer"><bdi>{credit.author}</bdi></a><span aria-hidden="true"> · </span><a className="underline underline-offset-2" href={credit.license_url} target="_blank" rel="noopener noreferrer">{t("Image license")}</a><span className="block">{t("Resized for display.")}</span></span>}</p>;
}
