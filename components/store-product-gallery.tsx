"use client";

import { useState } from "react";
import { CatalogImageCredit } from "@/components/catalog-image-credit";
import { useLocale } from "@/components/locale-provider";
import { ProductMedia } from "@/components/product-media";
import { Button, Dialog } from "@/components/ui";
import type { StoreProduct } from "@/lib/store-types";

export function StoreProductGallery({ product }: { product: StoreProduct }) {
  const { t } = useLocale();
  const photos = [...new Set([product.image_url, ...(product.images ?? []).map(image => image.url)].filter((url): url is string => Boolean(url)))];
  const [selected, setSelected] = useState(0), [open, setOpen] = useState(false);
  const index = Math.min(selected, Math.max(0, photos.length - 1));
  return <div className="min-w-0"><ProductMedia key={photos[index] ?? "empty"} large name={product.name} category={product.category?.name} src={photos[index]}/>
    {product.image_is_illustrative && index === 0 && <CatalogImageCredit credit={product.image_credit}/>}
    {photos.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-2" aria-label={t("Product gallery")}>{photos.map((url, position) => <button key={url} type="button" aria-label={t("View image {number}", { number: position + 1 })} aria-pressed={index === position} onClick={() => setSelected(position)} className={`size-16 shrink-0 overflow-hidden rounded-control border-2 ${index === position ? "border-indigo-600" : "border-slate-200 dark:border-slate-700"}`}><img src={url} alt="" width={64} height={64} loading="lazy" className="size-full object-contain"/></button>)}</div>}
    {photos.length > 0 && <Button type="button" variant="outline" className="mt-3" onClick={() => setOpen(true)}>{t("View larger image")}</Button>}
    <Dialog open={open} onOpenChange={setOpen} title={product.name} className="storefront"><ProductMedia key={photos[index]} large name={product.name} src={photos[index]}/>{photos.length > 1 && <div className="mt-4 flex items-center justify-between gap-3"><Button type="button" variant="outline" disabled={index === 0} onClick={() => setSelected(index - 1)}>{t("Previous")}</Button><span className="text-sm tabular-nums"><bdi>{index + 1} / {photos.length}</bdi></span><Button type="button" variant="outline" disabled={index === photos.length - 1} onClick={() => setSelected(index + 1)}>{t("Next")}</Button></div>}</Dialog>
  </div>;
}
