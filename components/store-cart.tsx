"use client";
import { useLocale } from "@/components/locale-provider";


import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Banknote, Minus, Package, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useCart } from "@/components/cart-provider";
import { ErrorState, PageHeading } from "@/components/data";
import { CustomerGate } from "@/components/store-shell";
import { useAuth } from "@/components/providers";
import { Button, Card, Empty, Field, Input, Loading, Textarea } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { quoteChanged, savedCheckoutKey } from "@/lib/checkout";
import type { CartQuote, StoreOrder, StoreProfile } from "@/lib/store-types";
import type { Resource } from "@/lib/types";

function useQuote(){const cart=useCart();return useQuery({queryKey:["store","quote",cart.items],queryFn:({signal})=>api<Resource<CartQuote>>("/store/cart/quote",{method:"POST",body:JSON.stringify({items:cart.items}),signal}),enabled:cart.ready&&cart.items.length>0,refetchOnWindowFocus:true})}
function EmptyCart(){
  const { t } = useLocale();
return <Card><Empty title={t("Your cart is waiting")} detail={t("Explore the catalog and add something you like.")}/><div className="text-center"><Button asChild><Link href="/shop">{t("Explore products")}</Link></Button></div></Card>}
function Totals({quote}:{quote:CartQuote}){
  const { t, money } = useLocale();
return <><div className="flex items-center justify-between"><span className="text-sm text-slate-500 dark:text-slate-400">{t("Product total")}</span><span className="text-2xl font-black"><bdi dir="auto">{money(quote.total_minor)}</bdi></span></div><p className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Banknote className="h-4 w-4"/>{t("Cash on delivery")}</p><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{t("Prices are in USD. No tax or delivery fee is added by this checkout. Final product prices and availability are confirmed by the store when the order is submitted.")}</p></>}

export function StoreCart(){
  const { t, money } = useLocale();

 const cart=useCart(),quote=useQuote();
 if(!cart.ready)return <Loading/>;
 return <><PageHeading title={t("Your cart")} description={t("Review your items before placing an order.")}/>{!cart.items.length?<EmptyCart/>:quote.isLoading?<Loading/>:quote.isError?<ErrorState error={quote.error} retry={()=>quote.refetch()}/>:quote.data?<div className="grid items-start gap-6 lg:grid-cols-[1.7fr_1fr]"><Card><div className="divide-y divide-slate-100 dark:divide-slate-800">{quote.data.data.items.map(line=><div key={line.product_id} className="flex flex-wrap items-center gap-4 py-5 first:pt-0"><span className="rounded-2xl bg-indigo-50 p-4 text-indigo-400 dark:bg-indigo-500/10"><Package className="h-7 w-7"/></span><div className="min-w-36 flex-1"><Link href={`/shop/${line.product_id}`} className="font-bold">{line.product?.name??t("Unavailable product #{id}",{id:line.product_id})}</Link><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{line.product?money(line.product.price_minor):t("Remove this item to continue")}</p>{!line.available&&<p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400">{line.product?t("Only {count} currently available.",{count:line.product.max_order_quantity}):t("No longer available.")}</p>}</div><div className="flex items-center gap-2"><Button variant="outline" size="icon" aria-label={t("Decrease quantity")} disabled={line.quantity<=1} onClick={()=>cart.setQuantity(line.product_id,line.quantity-1)}><Minus className="h-3 w-3"/></Button><Input aria-label={t("Quantity for {name}",{name:line.product?.name??t("unavailable item")})} type="number" min={1} max={line.product?.max_order_quantity??100000} className="w-20 text-center" value={line.quantity} onChange={e=>{const next=Number(e.target.value);if(!line.product||next<=line.product.max_order_quantity)cart.setQuantity(line.product_id,next)}}/><Button variant="outline" size="icon" aria-label={t("Increase quantity")} disabled={line.quantity>=(line.product?.max_order_quantity??0)} onClick={()=>cart.setQuantity(line.product_id,line.quantity+1)}><Plus className="h-3 w-3"/></Button></div><p className="w-24 text-end text-sm font-bold">{line.subtotal_minor===null?"—":money(line.subtotal_minor)}</p><button aria-label={t("Remove {name}",{name:line.product?.name??t("item")})} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-rose-500 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10" onClick={()=>cart.remove(line.product_id)}><Trash2 className="h-4 w-4"/></button></div>)}</div><Link href="/shop" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400"><ArrowLeft className="h-4 w-4"/>{t("Keep shopping")}</Link></Card><Card><h2 className="mb-6 font-bold">{t("Order summary")}</h2><Totals quote={quote.data.data}/>{!quote.data.data.can_checkout&&<p className="mt-4 text-sm text-rose-600 dark:text-rose-400">{t("Update quantities or remove unavailable products to continue.")}</p>}<Button asChild={quote.data.data.can_checkout&&!quote.isFetching} className="mt-6 w-full" disabled={!quote.data.data.can_checkout||quote.isFetching}>{quote.data.data.can_checkout&&!quote.isFetching?<Link href="/checkout">{t("Continue to checkout")}</Link>:<span>{quote.isFetching?t("Updating…"):t("Check item availability")}</span>}</Button></Card></div>:null}</>;
}

const checkoutSchema=z.object({shipping_name:z.string().trim().min(1,"Recipient name is required").max(255),shipping_phone:z.string().trim().min(1,"Phone is required").max(40),shipping_address:z.string().trim().min(1,"Delivery address is required").max(2000),notes:z.string().max(5000)});
type Values=z.infer<typeof checkoutSchema>;
export function StoreCheckout(){
  
return <CustomerGate checkout><CheckoutContent/></CustomerGate>}
function CheckoutContent(){
  

 const cart=useCart(),quote=useQuote();
 const profile=useQuery({queryKey:["store","profile"],queryFn:({signal})=>api<Resource<StoreProfile>>("/store/profile",{signal})});
 if(!cart.ready)return <Loading/>;if(!cart.items.length)return <EmptyCart/>;
 if(quote.isLoading||profile.isLoading)return <Loading/>;
 if((quote.isError&&!quote.data)||(profile.isError&&!profile.data))return <ErrorState error={quote.error??profile.error} retry={()=>{quote.refetch();profile.refetch()}}/>;
 if(!quote.data||!profile.data)return null;
 return <>{quote.isError&&<ErrorState error={quote.error} retry={()=>quote.refetch()}/>}<CheckoutForm quote={quote.data.data} profile={profile.data.data} refreshing={quote.isFetching} refreshQuote={async()=>{const result=await quote.refetch();if(result.error||!result.data)throw result.error??new Error("Unable to load data.");return result.data.data}}/></>;
}
function CheckoutForm({quote,profile,refreshing,refreshQuote}:{quote:CartQuote;profile:StoreProfile;refreshing:boolean;refreshQuote:()=>Promise<CartQuote>}){
  const { t, errorText, money } = useLocale();

 const cart=useCart(),router=useRouter(),client=useQueryClient(),auth=useAuth();
 const attempt=useRef<{fingerprint:string;key:string}|null>(null),[uncertain,setUncertain]=useState(false);
 const {register,handleSubmit,setError,formState:{errors,isSubmitting}}=useForm<Values>({resolver:zodResolver(checkoutSchema),defaultValues:{shipping_name:profile.name,shipping_phone:profile.phone??"",shipping_address:profile.address??"",notes:""}});
 const submit=handleSubmit(async values=>{
  if(!uncertain){try{const latest=await refreshQuote();if(!latest.can_checkout||quoteChanged(quote,latest)){toast.error(t("Prices or availability changed. Review the updated order before submitting again."));return}}catch(error){toast.error(errorText(error instanceof Error?error.message:"Unable to load data."));return}}
  const payload={...values,items:cart.items};const body=JSON.stringify(payload);
  const fingerprint=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(body)))).map(byte=>byte.toString(16).padStart(2,"0")).join("");
  const storageKey=`naser-orderly-checkout-${auth.user!.id}`;
  if(!attempt.current||attempt.current.fingerprint!==fingerprint){
   let key=crypto.randomUUID();
   try{const saved=JSON.parse(sessionStorage.getItem(storageKey)??"null");key=savedCheckoutKey(saved,fingerprint)??key;sessionStorage.setItem(storageKey,JSON.stringify({fingerprint,key}))}catch{/* Retry protection still works in memory if storage is unavailable. */}
   attempt.current={fingerprint,key};
  }
  try{
   const result=await api<Resource<StoreOrder>>("/store/orders",{method:"POST",body:JSON.stringify({...payload,checkout_key:attempt.current.key})});
   try{sessionStorage.removeItem(storageKey)}catch{/* Browser storage is optional. */}
   cart.clear();await client.invalidateQueries({queryKey:["store","orders"]});toast.success(t("Order #{number} placed. Pay on delivery.",{number:result.data.number}),{action:{label:t("View order"),onClick:()=>router.push(`/account/orders/${result.data.id}`)}});router.replace(`/account/orders/${result.data.id}?placed=1`);
  }catch(error){
   if(error instanceof ApiError){Object.entries(error.body.errors??{}).forEach(([key,messages])=>setError(key as keyof Values,{message:messages[0]}));if(error.status>=500)setUncertain(true)}else setUncertain(true);
   toast.error(errorText(error instanceof Error?error.message:t("We could not confirm the order. Check your orders before trying again.")));
   try{await refreshQuote()}catch(refreshError){toast.error(errorText(refreshError instanceof Error?refreshError.message:"Unable to load data."))}
  }
 });
 return <><PageHeading title={t("Checkout")} description={t("Confirm delivery details and place your cash-on-delivery order.")}/><form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-[1.7fr_1fr]"><Card><h2 className="mb-5 font-bold">{t("Delivery details")}</h2><div className="grid gap-5 sm:grid-cols-2"><Field label={t("Recipient name")} error={errors.shipping_name?.message}><Input autoComplete="shipping name" readOnly={uncertain||isSubmitting} {...register("shipping_name")}/></Field><Field label={t("Phone number")} error={errors.shipping_phone?.message}><Input type="tel" autoComplete="shipping tel" readOnly={uncertain||isSubmitting} {...register("shipping_phone")}/></Field><div className="sm:col-span-2"><Field label={t("Full delivery address")} error={errors.shipping_address?.message}><Textarea autoComplete="shipping street-address" placeholder={t("Street, building, city, region and postal code")} readOnly={uncertain||isSubmitting} {...register("shipping_address")}/></Field></div><div className="sm:col-span-2"><Field label={t("Delivery notes (optional)")} error={errors.notes?.message}><Textarea readOnly={uncertain||isSubmitting} {...register("notes")}/></Field></div></div></Card><Card className="lg:sticky lg:top-32"><h2 className="mb-2 text-lg font-semibold">{t("Review your order")}</h2><p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{t("Check the products, quantities and delivery details before placing your order.")}</p><ul className="mb-5 grid gap-3 border-b border-slate-200 pb-5 text-sm dark:border-slate-800">{quote.items.map(line=><li key={line.product_id} className="flex justify-between gap-3"><span>{line.product?.name??t("Unavailable item")} × {line.quantity}</span><span className="whitespace-nowrap font-semibold"><bdi dir="auto">{money(line.subtotal_minor??0)}</bdi></span></li>)}</ul><Totals quote={quote}/>{!quote.can_checkout&&<p className="mt-4 text-sm text-rose-600 dark:text-rose-400">{t("Some items are no longer available in the requested quantity.")} <Link href="/cart" className="underline">{t("Update your cart.")}</Link></p>}{uncertain&&<p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">{t("We could not confirm the last response.")} <Link className="font-semibold underline" href="/account/orders">{t("Check your orders")}</Link> {t("before changing the cart. Retrying this unchanged request uses the same checkout key.")}</p>}<Button className="mt-6 w-full" disabled={isSubmitting||(!uncertain&&(refreshing||!quote.can_checkout))}>{isSubmitting?t("Placing order…"):uncertain?t("Retry original order"):t("Place order · Pay on delivery")}</Button><Link className="mt-4 block text-center text-sm text-indigo-600 dark:text-indigo-400" href="/cart">{t("Back to cart")}</Link></Card></form></>;
}
