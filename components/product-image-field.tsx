"use client";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { ProductMedia } from "@/components/product-media";
import { Button, Field, Input } from "@/components/ui";

export function ProductImageField({name,currentUrl,file,remove,disabled,error,onFile,onRemove,onError}: {
  name:string;currentUrl?:string|null;file:File|null;remove:boolean;disabled:boolean;error?:string;
  onFile:(file:File|null)=>void;onRemove:(remove:boolean)=>void;onError:(message:string)=>void;
}) {
  const {t}=useLocale(),[preview,setPreview]=useState<string|null>(null);
  useEffect(()=>{if(!file){setPreview(null);return}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url)},[file]);
  const source=file?preview:remove?null:currentUrl;
  return <section className="grid gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:col-span-2"><h2 className="text-lg font-semibold">{t("Product image")}</h2><div className="grid items-start gap-4 sm:grid-cols-[160px_1fr]"><ProductMedia name={name||t("Product")} src={source}/><div className="grid gap-3"><Field label={t("Choose image")} error={error} hint={t("JPEG, PNG or WebP. Up to 2 MiB and 4096 × 4096 pixels.")}><Input type="file" dir="ltr" accept="image/jpeg,image/png,image/webp" disabled={disabled} onChange={event=>{
    const selected=event.target.files?.[0];event.target.value="";if(!selected)return;
    if(!["image/jpeg","image/png","image/webp"].includes(selected.type)||selected.size>2*1024*1024){onError("Choose a JPEG, PNG or WebP image up to 2 MiB.");return}
    onFile(selected);
  }}/></Field>{file&&<p className="break-all text-sm text-slate-600 dark:text-slate-400"><bdi dir="ltr">{file.name}</bdi></p>}<div className="flex flex-wrap gap-2">{(file||currentUrl&&!remove)&&<Button type="button" variant="secondary" disabled={disabled} onClick={()=>onRemove(true)}>{t("Remove image")}</Button>}{remove&&currentUrl&&<Button type="button" variant="secondary" disabled={disabled} onClick={()=>onRemove(false)}>{t("Keep current image")}</Button>}</div><p className="text-sm text-slate-600 dark:text-slate-400">{t("Image changes take effect when you save the product.")}</p></div></div></section>;
}
