"use client";
import { useLocale } from "@/components/locale-provider";


import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Clock3, PackageCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DataTable, ErrorState, PageHeading } from "@/components/data";
import { useAuth } from "@/components/providers";
import { Badge, Button, Card, Dialog, Field, Input, Loading, Pagination, Textarea } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { StoreOrder, StoreProfile } from "@/lib/store-types";
import type { Page, Resource } from "@/lib/types";

export function StoreProfilePage(){
  const { t, errorText } = useLocale();

 const auth=useAuth(),client=useQueryClient();
 const query=useQuery({queryKey:["store","profile"],queryFn:({signal})=>api<Resource<StoreProfile>>("/store/profile",{signal})});
 const {register,handleSubmit,setError,formState:{errors,isSubmitting}}=useForm<{name:string;phone:string;address:string}>({values:{name:query.data?.data.name??"",phone:query.data?.data.phone??"",address:query.data?.data.address??""}});
 if(query.isLoading)return <Loading/>;if(query.isError)return <ErrorState error={query.error} retry={()=>query.refetch()}/>;
 return <><PageHeading title={t("Your profile")} description={t("Save contact details to make your next checkout easier.")}/><Card className="max-w-2xl"><form className="grid gap-5" onSubmit={handleSubmit(async values=>{try{await api("/store/profile",{method:"PUT",body:JSON.stringify(values)});await client.invalidateQueries({queryKey:["store","profile"]});await auth.refreshUser();toast.success(t("Profile saved"))}catch(error){if(error instanceof ApiError)Object.entries(error.body.errors??{}).forEach(([key,messages])=>setError(key as keyof typeof values,{message:messages[0]}));toast.error(errorText(error instanceof Error?error.message:t("Save failed")))}})}><Field label={t("Full name")} error={errors.name?.message}><Input autoComplete="name" {...register("name",{required:"Name is required",maxLength:255})}/></Field><Field label={t("Email")}><Input type="email" readOnly value={query.data?.data.email??""}/></Field><Field label={t("Phone")} error={errors.phone?.message}><Input type="tel" autoComplete="tel" {...register("phone",{maxLength:40})}/></Field><Field label={t("Delivery address")} error={errors.address?.message}><Textarea autoComplete="street-address" {...register("address",{maxLength:2000})}/></Field><p className="text-xs text-slate-500">{t("Saved details do not change delivery addresses on orders you already placed.")}</p><Button disabled={isSubmitting}>{isSubmitting?t("Saving…"):t("Save profile")}</Button></form></Card></>;
}

export function StoreOrders(){
  const { t, money, dateTime } = useLocale();

 const [page,setPage]=useState(1);
 const query=useQuery({queryKey:["store","orders",page],queryFn:({signal})=>api<Page<StoreOrder>>(`/store/orders?page=${page}`,{signal}),refetchOnWindowFocus:true});
 return <><PageHeading title={t("My orders")} description={t("Follow your orders from confirmation to delivery.")}/><Card>{query.isLoading?<Loading/>:query.isError?<ErrorState error={query.error} retry={()=>query.refetch()}/>:<><DataTable rows={query.data?.data??[]} emptyTitle={t("You have not placed an order yet")} columns={[{label:t("Order"),render:order=><Link href={`/account/orders/${order.id}`} className="font-semibold text-indigo-600">#{order.number.slice(0,8)}</Link>},{label:t("Placed"),render:order=>dateTime(order.created_at)},{label:t("Status"),render:order=><Badge tone={order.status==="completed"?"green":order.status==="cancelled"?"red":"indigo"}>{order.status}</Badge>},{label:t("Payment"),render:order=>order.payment_status==="paid"?t("Paid"):order.payment_method==="cash_on_delivery"?t("Cash on delivery"):t("Not recorded")},{label:t("Total"),render:order=>money(order.total_minor)}]}/><Pagination page={page} last={query.data?.meta.last_page??1} onPage={setPage}/></>}</Card><Button asChild variant="outline" className="mt-5"><Link href="/shop">{t("Continue shopping")}</Link></Button></>;
}

export function StoreOrderDetail({id}:{id:number}){
  const { t, errorText, money, dateTime } = useLocale();

 const client=useQueryClient(),[confirm,setConfirm]=useState(false);
 const query=useQuery({queryKey:["store","orders","detail",id],queryFn:({signal})=>api<Resource<StoreOrder>>(`/store/orders/${id}`,{signal}),refetchOnWindowFocus:true});
 const cancel=useMutation({mutationFn:()=>api(`/store/orders/${id}/cancel`,{method:"POST"}),onSuccess:async()=>{setConfirm(false);await client.invalidateQueries({queryKey:["store","orders"]});toast.success(t("Order cancelled"))},onError:async error=>{toast.error(errorText(error.message));await query.refetch()}});
 if(query.isLoading)return <Loading/>;if(query.isError)return <ErrorState error={query.error} retry={()=>query.refetch()}/>;if(!query.data)return null;
 const order=query.data.data,steps=["pending","confirmed","processing","completed"],current=steps.indexOf(order.status);
 return <><Link href="/account/orders" className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft className="h-4 w-4"/>{t("My orders")}</Link><PageHeading title={t("Order #{number}",{number:order.number.slice(0,8)})} description={t("Placed {date}",{date:dateTime(order.created_at)})} action={<Badge tone={order.status==="cancelled"?"red":order.status==="completed"?"green":"indigo"}>{order.status}</Badge>}/><Card className="mb-6">{order.status==="cancelled"?<p className="text-sm font-semibold text-rose-600">{t("This order was cancelled.")}</p>:<ol className="grid gap-5 sm:grid-cols-4">{steps.map((step,index)=><li key={step} className="flex items-center gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${index<=current?"bg-indigo-600 text-white":"bg-slate-100 text-slate-400"}`}>{index<current?<Check className="h-4 w-4"/>:index===current?<PackageCheck className="h-4 w-4"/>:<Clock3 className="h-4 w-4"/>}</span><span className="text-sm font-semibold capitalize">{step==="completed"?t("Completed / delivered"):t(step)}</span></li>)}</ol>}</Card><div className="grid items-start gap-6 lg:grid-cols-[1.7fr_1fr]"><Card><h2 className="mb-4 font-bold">{t("Ordered items")}</h2><DataTable rows={order.items??[]} columns={[{label:t("Product"),render:item=><div><p className="font-semibold">{item.name}</p><p className="mt-1 text-xs text-slate-500">{item.sku}</p></div>},{label:t("Quantity"),render:item=>item.quantity},{label:t("Unit price"),render:item=>money(item.unit_price_minor)},{label:t("Total"),render:item=>money(item.subtotal_minor)}]}/><dl className="ms-auto mt-6 grid max-w-xs gap-3 border-t border-slate-200 pt-5 text-sm"><div className="flex justify-between"><dt>{t("Subtotal")}</dt><dd>{money(order.subtotal_minor)}</dd></div>{order.discount_minor>0&&<div className="flex justify-between"><dt>{t("Discount")}</dt><dd>−{money(order.discount_minor)}</dd></div>}<div className="flex justify-between font-bold"><dt>{t("Total")}</dt><dd>{money(order.total_minor)}</dd></div></dl></Card><div className="grid gap-5"><Card><h2 className="font-bold">{t("Payment")}</h2><p className="mt-3 text-sm">{order.payment_method==="cash_on_delivery"?t("Cash on delivery"):t("Payment method not recorded")}</p><p className="mt-3"><Badge tone={order.payment_status==="paid"?"green":"amber"}>{order.payment_status==="paid"?t("Payment collected"):order.status==="cancelled"?t("Order cancelled"):order.payment_method==="cash_on_delivery"?t("Not yet collected"):t("Not recorded")}</Badge></p></Card>{order.shipping&&<Card><h2 className="font-bold">{t("Delivery address")}</h2><p className="mt-3 text-sm font-semibold">{order.shipping.name}</p><p className="mt-2 text-sm text-slate-500">{order.shipping.phone}</p><p className="mt-2 whitespace-pre-wrap text-sm text-slate-500">{order.shipping.address}</p></Card>}{order.can_cancel&&<Card><h2 className="font-bold">{t("Need to cancel?")}</h2><p className="my-3 text-xs leading-5 text-slate-500">{t("You can cancel while the order is pending. After confirmation, contact the store.")}</p><Button variant="destructive" onClick={()=>setConfirm(true)}>{t("Cancel order")}</Button></Card>}</div></div><Dialog open={confirm} onOpenChange={open=>{if(!cancel.isPending)setConfirm(open)}} title={t("Cancel this order?")}><p className="text-sm text-slate-500">{t("The store will recheck its current status before cancelling and restoring the items to stock.")}</p><div className="mt-5 flex justify-end gap-3"><Button variant="outline" disabled={cancel.isPending} onClick={()=>setConfirm(false)}>{t("Keep order")}</Button><Button variant="destructive" disabled={cancel.isPending} onClick={()=>cancel.mutate()}>{cancel.isPending?t("Cancelling…"):t("Confirm cancellation")}</Button></div></Dialog></>;
}
