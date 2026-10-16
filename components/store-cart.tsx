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
import type { CartQuote, StoreOrder, StoreProfile } from "@/lib/store-types";
import type { Resource } from "@/lib/types";

function useQuote(){const cart=useCart();return useQuery({queryKey:["store","quote",cart.items],queryFn:({signal})=>api<Resource<CartQuote>>("/store/cart/quote",{method:"POST",body:JSON.stringify({items:cart.items}),signal}),enabled:cart.ready&&cart.items.length>0,refetchOnWindowFocus:true})}
function EmptyCart(){
  const { t } = useLocale();
return <Card><Empty title={t("Your cart is waiting")} detail={t("Explore the catalog and add something you like.")}/><div className="text-center"><Button asChild><Link href="/shop">{t("Explore products")}</Link></Button></div></Card>}
function Totals({quote}:{quote:CartQuote}){
  const { t, money } = useLocale();
return <><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{t("Product total")}</span><span className="text-2xl font-black">{money(quote.total_minor)}</span></div><p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><Banknote className="h-4 w-4"/>{t("Cash on delivery")}</p><p className="mt-3 text-xs leading-5 text-slate-500">{t("Prices are in USD. No tax or delivery fee is added by this checkout. Final product prices and availability are confirmed by the store when the order is submitted.")}</p></>}

export function StoreCart(){
  const { t, money } = useLocale();

 const cart=useCart(),quote=useQuote();
 if(!cart.ready)return <Loading/>;
 return <><PageHeading title={t("Your cart")} description={t("Review your items before placing an order.")}/>{!cart.items.length?<EmptyCart/>:quote.isLoading?<Loading/>:quote.isError?<ErrorState error={quote.error} retry={()=>quote.refetch()}/>:quote.data?<div className="grid items-start gap-6 lg:grid-cols-[1.7fr_1fr]"><Card><div className="divide-y divide-slate-100 dark:divide-slate-800">{quote.data.data.items.map(line=><div key={line.product_id} className="flex flex-wrap items-center gap-4 py-5 first:pt-0"><span className="rounded-2xl bg-indigo-50 p-4 text-indigo-400"><Package className="h-7 w-7"/></span><div className="min-w-36 flex-1"><Link href={`/shop/${line.product_id}`} className="font-bold">{line.product?.name??t("Unavailable product #{id}",{id:line.product_id})}</Link><p className="mt-1 text-xs text-slate-500">{line.product?money(line.product.price_minor):t("Remove this item to continue")}</p>{!line.available&&<p className="mt-2 text-xs font-semibold text-rose-600">{line.product?t("Only {count} currently available.",{count:line.product.max_order_quantity}):t("No longer available.")}</p>}</div><div className="flex items-center gap-2"><Button variant="outline" size="icon" aria-label={t("Decrease quantity")} disabled={line.quantity<=1} onClick={()=>cart.setQuantity(line.product_id,line.quantity-1)}><Minus className="h-3 w-3"/></Button><Input aria-label={t("Quantity for {name}",{name:line.product?.name??t("unavailable item")})} type="number" min={1} max={100000} className="w-20 text-center" value={line.quantity} onChange={e=>cart.setQuantity(line.product_id,Number(e.target.value))}/><Button variant="outline" size="icon" aria-label={t("Increase quantity")} disabled={line.quantity>=(line.product?.max_order_quantity??0)} onClick={()=>cart.setQuantity(line.product_id,line.quantity+1)}><Plus className="h-3 w-3"/></Button></div><p className="w-24 text-end text-sm font-bold">{line.subtotal_minor===null?"—":money(line.subtotal_minor)}</p><button aria-label={t("Remove {name}",{name:line.product?.name??t("item")})} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50" onClick={()=>cart.remove(line.product_id)}><Trash2 className="h-4 w-4"/></button></div>)}</div><Link href="/shop" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600"><ArrowLeft className="h-4 w-4"/>{t("Keep shopping")}</Link></Card><Card><h2 className="mb-6 font-bold">{t("Order summary")}</h2><Totals quote={quote.data.data}/>{!quote.data.data.can_checkout&&<p className="mt-4 text-sm text-rose-600">{t("Update quantities or remove unavailable products to continue.")}</p>}<Button asChild={quote.data.data.can_checkout&&!quote.isFetching} className="mt-6 w-full" disabled={!quote.data.data.can_checkout||quote.isFetching}>{quote.data.data.can_checkout&&!quote.isFetching?<Link href="/checkout">{t("Continue to checkout")}</Link>:<span>{quote.isFetching?t("Updating…"):t("Check item availability")}</span>}</Button></Card></div>:null}</>;
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
 if(quote.isError||profile.isError)return <ErrorState error={quote.error??profile.error} retry={()=>{quote.refetch();profile.refetch()}}/>;
 if(!quote.data||!profile.data)return null;
 return <CheckoutForm quote={quote.data.data} profile={profile.data.data} refreshing={quote.isFetching} refreshQuote={()=>quote.refetch()}/>;
}
function CheckoutForm({quote,profile,refreshing,refreshQuote}:{quote:CartQuote;profile:StoreProfile;refreshing:boolean;refreshQuote:()=>Promise<unknown>}){
  const { t, errorText, money } = useLocale();

 const cart=useCart(),router=useRouter(),client=useQueryClient(),auth=useAuth();
 const attempt=useRef<{fingerprint:string;key:string}|null>(null),[uncertain,setUncertain]=useState(false);
 const {register,handleSubmit,setError,formState:{errors,isSubmitting}}=useForm<Values>({resolver:zodResolver(checkoutSchema),defaultValues:{shipping_name:profile.name,shipping_phone:profile.phone??"",shipping_address:profile.address??"",notes:""}});
 const submit=handleSubmit(async values=>{
  const payload={...values,items:cart.items};const body=JSON.stringify(payload);
  const fingerprint=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(body)))).map(byte=>byte.toString(16).padStart(2,"0")).join("");
  const storageKey=`naser-orderly-checkout-${auth.user!.id}`;
  if(!attempt.current||attempt.current.fingerprint!==fingerprint){
   let key=crypto.randomUUID();
   try{const saved=JSON.parse(sessionStorage.getItem(storageKey)??"null");if(saved?.fingerprint===fingerprint&&typeof saved.key==="string"&&/^[0-9a-f-]{36}$/i.test(saved.key))key=saved.key;sessionStorage.setItem(storageKey,JSON.stringify({fingerprint,key}))}catch{/* Retry protection still works in memory if storage is unavailable. */}
   attempt.current={fingerprint,key};
  }
  try{
   const result=await api<Resource<StoreOrder>>("/store/orders",{method:"POST",body:JSON.stringify({...payload,checkout_key:attempt.current.key})});
   try{sessionStorage.removeItem(storageKey)}catch{/* Browser storage is optional. */}
   cart.clear();await client.invalidateQueries({queryKey:["store","orders"]});toast.success(t("Order placed. Pay on delivery."));router.replace(`/account/orders/${result.data.id}`);
  }catch(error){
   if(error instanceof ApiError){Object.entries(error.body.errors??{}).forEach(([key,messages])=>setError(key as keyof Values,{message:messages[0]}));if(error.status>=500)setUncertain(true)}else setUncertain(true);
   toast.error(errorText(error instanceof Error?error.message:t("We could not confirm the order. Check your orders before trying again.")));await refreshQuote();
  }
 });
 return <><PageHeading title={t("Checkout")} description={t("Confirm delivery details and place your cash-on-delivery order.")}/><form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-[1.7fr_1fr]"><Card><h2 className="mb-5 font-bold">{t("Delivery details")}</h2><div className="grid gap-5 sm:grid-cols-2"><Field label={t("Recipient name")} error={errors.shipping_name?.message}><Input autoComplete="shipping name" readOnly={uncertain} {...register("shipping_name")}/></Field><Field label={t("Phone number")} error={errors.shipping_phone?.message}><Input type="tel" autoComplete="shipping tel" readOnly={uncertain} {...register("shipping_phone")}/></Field><div className="sm:col-span-2"><Field label={t("Full delivery address")} error={errors.shipping_address?.message}><Textarea autoComplete="shipping street-address" placeholder={t("Street, building, city, region and postal code")} readOnly={uncertain} {...register("shipping_address")}/></Field></div><div className="sm:col-span-2"><Field label={t("Delivery notes (optional)")} error={errors.notes?.message}><Textarea readOnly={uncertain} {...register("notes")}/></Field></div></div></Card><Card><h2 className="mb-4 font-bold">{t("Your order")}</h2><ul className="mb-5 grid gap-3 border-b border-slate-200 pb-5 text-sm dark:border-slate-800">{quote.items.map(line=><li key={line.product_id} className="flex justify-between gap-3"><span>{line.product?.name??t("Unavailable item")} × {line.quantity}</span><span className="whitespace-nowrap font-semibold">{money(line.subtotal_minor??0)}</span></li>)}</ul><Totals quote={quote}/>{!quote.can_checkout&&<p className="mt-4 text-sm text-rose-600">{t("Some items are no longer available in the requested quantity.")} <Link href="/cart" className="underline">{t("Update your cart.")}</Link></p>}{uncertain&&<p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{t("We could not confirm the last response.")} <Link className="font-semibold underline" href="/account/orders">{t("Check your orders")}</Link> {t("before changing the cart. Retrying this unchanged request uses the same checkout key.")}</p>}<Button className="mt-6 w-full" disabled={isSubmitting||(!uncertain&&(refreshing||!quote.can_checkout))}>{isSubmitting?t("Placing order…"):uncertain?t("Retry original order"):t("Place order · Pay on delivery")}</Button><Link className="mt-4 block text-center text-sm text-indigo-600" href="/cart">{t("Back to cart")}</Link></Card></form></>;
}
