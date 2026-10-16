"use client";
import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, Upload, Trash2 } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { ProductMedia } from "@/components/product-media";
import { Button } from "@/components/ui";

export function ProductImageField({name,currentUrl,file,remove,disabled,error,onFile,onRemove,onError}: {
  name:string;currentUrl?:string|null;file:File|null;remove:boolean;disabled:boolean;error?:string;
  onFile:(file:File|null)=>void;onRemove:(remove:boolean)=>void;onError:(message:string)=>void;
}) {
  const {t,errorText}=useLocale(),[preview,setPreview]=useState<string|null>(null);
  const inputRef=useRef<HTMLInputElement>(null),descriptionId=useId(),errorId=useId();
  useEffect(()=>{if(!file){setPreview(null);return}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url)},[file]);
  const source=file?preview:remove?null:currentUrl;
  return <section className="grid gap-4"><h2 className="text-lg font-semibold">{t("Product image")}</h2>
    {source?<ProductMedia name={name||t("Product")} src={source} large/>:<div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-400"><ImagePlus className="h-9 w-9" strokeWidth={1.5} aria-hidden="true"/><span className="text-sm">{t("No image provided")}</span></div>}
    <input ref={inputRef} type="file" className="hidden" aria-label={t("Choose image")} accept="image/jpeg,image/png,image/webp" disabled={disabled} onChange={event=>{
    const selected=event.target.files?.[0];event.target.value="";if(!selected)return;
    if(!["image/jpeg","image/png","image/webp"].includes(selected.type)||selected.size>2*1024*1024){onError("Choose a JPEG, PNG or WebP image up to 2 MiB.");return}
    onFile(selected);
  }}/>
    <Button type="button" variant="outline" className="w-full" disabled={disabled} aria-describedby={`${descriptionId}${error?` ${errorId}`:""}`} aria-invalid={Boolean(error)} onClick={()=>inputRef.current?.click()}><Upload aria-hidden="true"/>{t(source?"Replace image":"Choose image")}</Button>
    {file&&<p className="break-all text-xs text-slate-500 dark:text-slate-400"><bdi dir="ltr">{file.name}</bdi></p>}
    {error&&<p id={errorId} role="alert" className="text-sm text-rose-600 dark:text-rose-400">{errorText(error)}</p>}
    <p id={descriptionId} className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{t("JPEG, PNG or WebP. Up to 2 MiB and 4096 × 4096 pixels.")}</p>
    {(file||currentUrl&&!remove)&&<Button type="button" variant="ghost" className="w-full text-rose-600 dark:text-rose-400" disabled={disabled} onClick={()=>onRemove(true)}><Trash2 aria-hidden="true"/>{t("Remove image")}</Button>}
    {remove&&currentUrl&&<Button type="button" variant="secondary" disabled={disabled} onClick={()=>onRemove(false)}>{t("Keep current image")}</Button>}
    <p className="border-t border-slate-200 pt-3 text-xs leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400">{t("Image changes take effect when you save the product.")}</p>
  </section>;
}
