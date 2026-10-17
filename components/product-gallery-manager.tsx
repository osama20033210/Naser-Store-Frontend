"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/components/locale-provider";
import { Button, Card, Dialog } from "@/components/ui";
import { api, ApiError } from "@/lib/api";

export function ProductGalleryManager({ id, images }: { id: number; images: { id: number; url: string }[] }) {
  const { t, errorText } = useLocale(), client = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const action = useMutation({ mutationFn: async (operation: { file: File } | { remove: number } | { ids: number[] }) => {
    if ("file" in operation) { const form = new FormData(); form.append("image", operation.file); return api(`/products/${id}/images`, { method: "POST", body: form }); }
    if ("remove" in operation) return api(`/products/${id}/images/${operation.remove}`, { method: "DELETE" });
    return api(`/products/${id}/images/order`, { method: "PUT", body: JSON.stringify({ ids: operation.ids }) });
  }, onSuccess: async () => { setRemoving(null); toast.success(t("Gallery updated")); await client.invalidateQueries({ queryKey: ["products", id] }); await client.invalidateQueries({ queryKey: ["store"] }); },
  onError: async error => { const message = error instanceof ApiError ? Object.values(error.body.errors ?? {}).flat()[0] ?? error.message : error.message; toast.error(errorText(message)); await client.invalidateQueries({ queryKey: ["products", id] }); } });
  const move = (index: number, by: number) => { const ids = images.map(image => image.id); [ids[index], ids[index + by]] = [ids[index + by], ids[index]]; action.mutate({ ids }); };
  return <Card className="mt-5"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">{t("Product gallery")}</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t("Up to eight additional images. Gallery changes save immediately.")}</p></div><Button type="button" variant="outline" disabled={action.isPending || images.length >= 8} onClick={() => fileInput.current?.click()}><Upload aria-hidden="true"/>{t("Add image")}</Button></div>
    <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" aria-label={t("Add image")} onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) { toast.error(t("Choose a JPEG, PNG or WebP image up to 2 MiB.")); return; } action.mutate({ file }); }}/>
    <div aria-busy={action.isPending} className="grid grid-cols-2 gap-3 sm:grid-cols-4">{images.map((image, index) => <div key={image.id} className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"><img src={image.url} alt={t("Gallery image {number}", { number: index + 1 })} width={320} height={240} loading="lazy" className="aspect-[4/3] w-full object-contain"/><div className="flex flex-wrap justify-center gap-1 border-t border-slate-200 p-1 dark:border-slate-800"><Button type="button" size="icon" variant="ghost" disabled={action.isPending || index === 0} aria-label={t("Move image earlier")} onClick={() => move(index, -1)}><ArrowLeft className="rtl:rotate-180"/></Button><Button type="button" size="icon" variant="ghost" disabled={action.isPending || index === images.length - 1} aria-label={t("Move image later")} onClick={() => move(index, 1)}><ArrowRight className="rtl:rotate-180"/></Button><Button type="button" size="icon" variant="ghost" disabled={action.isPending} aria-label={t("Delete image")} onClick={() => setRemoving(image.id)}><Trash2 className="text-rose-600"/></Button></div></div>)}</div>
    {!images.length && <p className="py-5 text-sm text-slate-500 dark:text-slate-400">{t("No additional images yet.")}</p>}
    <Dialog open={removing !== null} onOpenChange={open => { if (!open && !action.isPending) setRemoving(null); }} title={t("Delete image?")}><p className="text-sm text-slate-500">{t("This removes the image from the product gallery.")}</p><div className="mt-5 flex justify-end gap-2"><Button type="button" variant="outline" disabled={action.isPending} onClick={() => setRemoving(null)}>{t("Cancel")}</Button><Button type="button" variant="destructive" disabled={action.isPending} onClick={() => { if (removing !== null) action.mutate({ remove: removing }); }}>{t("Delete")}</Button></div></Dialog>
  </Card>;
}
