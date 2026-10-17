"use client";
import { useLocale } from "@/components/locale-provider";


import { OrderDelivery } from "@/components/order-delivery";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useListFilter } from "@/components/use-list-filters";
import { decimalToMinor } from "@/lib/money";
import { savedCheckoutKey } from "@/lib/checkout";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DataTable, ErrorState, Lookup, PageHeading, RequirePermission } from "@/components/data";
import { useAuth } from "@/components/providers";
import { Badge, Button, Card, Dialog, Field, Input, Loading, Pagination, Select, Textarea } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { Order, OrderStatus, Page, Resource } from "@/lib/types";

export function StatusBadge({status}:{status:OrderStatus}){
  const { t } = useLocale();
return <Badge tone={status==="completed"?"green":status==="cancelled"?"red":status==="pending"?"amber":"indigo"}>{t(String(status))}</Badge>}
export function OrderList(){
  
return <RequirePermission permission="orders.view"><OrderListContent/></RequirePermission>}
function OrderListContent(){
  const { t, money, dateTime } = useLocale();

 const auth=useAuth(); const [q,setQ]=useListFilter("q",""),[pageText,setPageText]=useListFilter("page","1"),[status,setStatus]=useListFilter("status",""),[sort,setSort]=useListFilter("sort","created_at"); const page=Math.max(1,Number(pageText)||1),setPage=(value:number)=>setPageText(String(value));
 const params=new URLSearchParams({q,page:String(page),sort});if(status)params.set("status",status);
 const query=useQuery({queryKey:["orders",q,page,status,sort],queryFn:()=>api<Page<Order>>(`/orders?${params}`)});
 return <><PageHeading title={t("Orders")} description={t("Follow every order from creation to completion.")} action={auth.can("orders.create")&&<Button asChild><Link href="/dashboard/orders/new"><Plus className="h-4 w-4"/>{t("Create order")}</Link></Button>}/><Card><div className="mb-4 flex flex-wrap gap-3"><div className="relative min-w-48 flex-1"><Search className="absolute start-3 top-3.5 h-4 w-4 text-slate-400"/><Input className="ps-9" placeholder={t("Search order number or customer…")} value={q} onChange={e=>{setQ(e.target.value);setPage(1)}} aria-label={t("Search orders")}/></div><Select aria-label={t("Order status")} className="w-auto" value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}><option value="">{t("All statuses")}</option>{["pending","confirmed","processing","completed","cancelled"].map(s=><option key={s} value={s}>{t(s)}</option>)}</Select><Select aria-label={t("Sort orders")} className="w-auto" value={sort} onChange={e=>{setSort(e.target.value);setPage(1)}}><option value="created_at">{t("Newest first")}</option><option value="total_minor">{t("Highest total")}</option></Select></div>{query.isLoading?<Loading/>:query.isError?<ErrorState error={query.error} retry={()=>query.refetch()}/>:<><DataTable rows={query.data?.data??[]} columns={[{label:t("Order"),render:o=><Link href={`/dashboard/orders/${o.id}`} className="font-semibold text-indigo-600 dark:text-indigo-400">#<bdi dir="auto">{o.number.slice(0,8)}</bdi></Link>},{label:t("Customer"),render:o=>o.customer?.name??"—"},{label:t("Status"),render:o=><StatusBadge status={o.status}/>},{label:t("Total"),render:o=><bdi dir="auto">{money(o.total_minor)}</bdi>},{label:t("Created"),render:o=>dateTime(o.created_at)}]}/><Pagination page={page} last={query.data?.meta.last_page??1} onPage={setPage}/></>}</Card></>;
}

const orderSchema=z.object({customer_id:z.number().int().positive("Select a customer"),discount_minor:z.string().refine(value=>{try{decimalToMinor(value,1000000000000000);return true}catch{return false}},"Enter an amount with at most two decimal places."),notes:z.string().max(5000),items:z.array(z.object({product_id:z.number().int().positive("Select a product"),quantity:z.number().int().min(1).max(100000)})).min(1).max(100)}).superRefine((value,ctx)=>{if(new Set(value.items.map(i=>i.product_id)).size!==value.items.length)ctx.addIssue({code:"custom",path:["items"],message:"Each product can be added once."})});
type OrderValues=z.infer<typeof orderSchema>;
export function OrderCreate(){
  
return <RequirePermission permission="orders.create"><OrderCreateContent/></RequirePermission>}
function OrderCreateContent(){
  const { t, errorText, money } = useLocale();

 const auth=useAuth(),attempt=useRef<{body:string;fingerprint:string;key:string}|null>(null),[uncertain,setUncertain]=useState(false);
 const router=useRouter(),client=useQueryClient(),[prices,setPrices]=useState<Record<number,number>>({}),[labels,setLabels]=useState<Record<number,string>>({});
 const {control,register,handleSubmit,watch,setValue,setError,formState:{errors,isSubmitting}}=useForm<OrderValues>({resolver:zodResolver(orderSchema),defaultValues:{customer_id:0,discount_minor:"0.00",notes:"",items:[{product_id:0,quantity:1}]}});
 const {fields,append,remove}=useFieldArray({control,name:"items"});const items=watch("items"),discountText=watch("discount_minor");let discount=0;try{discount=decimalToMinor(discountText,1000000000000000)}catch{/* Inline validation explains incomplete monetary input. */}const estimate=items.reduce((sum,item)=>sum+(prices[item.product_id]??0)*(item.quantity||0),0);
 const submit=handleSubmit(async values=>{
  const storageKey=`naser-store-staff-order-${auth.user!.id}`;
  try{
   if(!uncertain||!attempt.current){
    const body=JSON.stringify({...values,discount_minor:decimalToMinor(values.discount_minor,1000000000000000)});
    const fingerprint=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(body)))).map(byte=>byte.toString(16).padStart(2,"0")).join("");
    let key=crypto.randomUUID();
    try{const saved=JSON.parse(sessionStorage.getItem(storageKey)??"null");key=savedCheckoutKey(saved,fingerprint)??key;sessionStorage.setItem(storageKey,JSON.stringify({fingerprint,key}))}catch{/* Retry protection remains in memory when storage is unavailable. */}
    attempt.current={body,fingerprint,key};
   }
   const result=await api<Resource<Order>>("/orders",{method:"POST",body:JSON.stringify({...JSON.parse(attempt.current.body),checkout_key:attempt.current.key})});
   try{sessionStorage.removeItem(storageKey)}catch{/* Browser storage is optional. */}
   await Promise.all([client.invalidateQueries({queryKey:["orders"]}),client.invalidateQueries({queryKey:["products"]}),client.invalidateQueries({queryKey:["dashboard"]}),client.invalidateQueries({queryKey:["inventory"]})]);
   toast.success(t("Order created and stock deducted"));router.push(`/dashboard/orders/${result.data.id}`);
  }catch(error){
   if(!(error instanceof ApiError)||error.status>=500)setUncertain(true);
   if(error instanceof ApiError)Object.entries(error.body.errors??{}).forEach(([key,messages])=>setError(key as Parameters<typeof setError>[0],{message:messages[0]}));
   toast.error(errorText(error instanceof Error?error.message:t("Order creation failed")));
  }
 });
 return <><Link href="/dashboard/orders" className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><ArrowLeft className="h-4 w-4"/>{t("Back to orders")}</Link><PageHeading title={t("Create order")} description={t("Choose a customer and products. Stock is deducted when the order is created.")}/>{uncertain&&<p role="status" className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">{t("We could not confirm the last response.")} <Link href="/dashboard/orders" className="font-semibold underline">{t("Check the order list")}</Link> {t("Your original order details are kept for retry. Check the order list before starting again.")}</p>}<form onSubmit={submit} className="grid items-start gap-6 xl:grid-cols-[1.7fr_1fr]"><fieldset disabled={isSubmitting||uncertain} className="grid min-w-0 gap-6"><Card><Lookup resource="customers" label={t("Customer")} value={watch("customer_id")} onChange={id=>setValue("customer_id",id,{shouldValidate:true})}/>{errors.customer_id&&<p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{errorText(errors.customer_id.message ?? "")}</p>}</Card><Card><h2 className="mb-5 font-bold">{t("Order items")}</h2><div className="grid gap-5">{fields.map((field,index)=><div key={field.id} className="grid gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:grid-cols-[1fr_90px_36px]"><div><Lookup activeOnly resource="products" label={t("Product {number}",{number:index+1})} value={items[index]?.product_id??0} selectedLabel={labels[items[index]?.product_id]} onChange={(id,row)=>{setValue(`items.${index}.product_id`,id,{shouldValidate:true});setPrices(prev=>({...prev,[id]:row.price_minor??0}));setLabels(prev=>({...prev,[id]:row.name}))}}/>{errors.items?.[index]?.product_id&&<p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errorText(errors.items[index]?.product_id?.message ?? "")}</p>}</div><Field label={t("Quantity")} error={errors.items?.[index]?.quantity?.message}><Input type="number" min={1} max={100000} {...register(`items.${index}.quantity`,{valueAsNumber:true})}/></Field><button type="button" aria-label={t("Remove product {number}",{number:index+1})} disabled={fields.length===1} onClick={()=>remove(index)} className="mt-7 h-11 w-11 rounded-xl text-rose-500 hover:bg-rose-50 disabled:opacity-30 dark:text-rose-400 dark:hover:bg-rose-500/10"><Trash2 className="mx-auto h-4 w-4"/></button></div>)}</div>{errors.items?.message&&<p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{errorText(errors.items.message ?? "")}</p>}<Button className="mt-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/15" type="button" disabled={fields.length>=100} onClick={()=>append({product_id:0,quantity:1})}><Plus className="h-4 w-4"/>{t("Add product")}</Button></Card><Card><Field label={t("Notes")} error={errors.notes?.message}><Textarea {...register("notes")}/></Field></Card></fieldset><Card><h2 className="font-bold">{t("Order summary")}</h2><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t("Estimate only. The API validates stock and calculates final prices.")}</p><div className="mt-6 grid gap-4"><div className="flex justify-between text-sm"><span>{t("Subtotal estimate")}</span><span><bdi dir="auto">{money(estimate)}</bdi></span></div><Field label={t("Discount (USD)")} error={errors.discount_minor?.message}><Input readOnly={isSubmitting||uncertain} inputMode="decimal" dir="ltr" {...register("discount_minor")}/></Field><div className="flex justify-between border-t border-slate-200 pt-4 font-bold dark:border-slate-800"><span>{t("Total estimate")}</span><span><bdi dir="auto">{money(Math.max(estimate-(discount||0),0))}</bdi></span></div><Button disabled={isSubmitting}>{isSubmitting?t("Creating…"):uncertain?t("Retry original order"):t("Create order")}</Button></div></Card></form></>;
}

export function OrderDetail({id}:{id:number}){
  
return <RequirePermission permission="orders.view"><OrderDetailContent id={id}/></RequirePermission>}
function OrderDetailContent({id}:{id:number}){
  const { t, errorText, money, dateTime } = useLocale();

 const auth=useAuth(),client=useQueryClient(),[action,setAction]=useState<OrderStatus|null>(null);
 const query=useQuery({queryKey:["orders",id],queryFn:()=>api<Resource<Order>>(`/orders/${id}`)});
 const mutation=useMutation({mutationFn:(status:OrderStatus)=>api<Resource<Order>>(`/orders/${id}/${status==="cancelled"?"cancel":"status"}`,{method:status==="cancelled"?"POST":"PATCH",body:status==="cancelled"?undefined:JSON.stringify({status})}),onSuccess:async()=>{setAction(null);await Promise.all([client.invalidateQueries({queryKey:["orders"]}),client.invalidateQueries({queryKey:["products"]}),client.invalidateQueries({queryKey:["dashboard"]}),client.invalidateQueries({queryKey:["inventory"]}),client.invalidateQueries({queryKey:["customer-orders"]})]);toast.success(t("Order updated"))},onError:async error=>{toast.error(errorText(error.message));await query.refetch()}});
 if(query.isLoading)return <Loading/>;if(query.isError)return <ErrorState error={query.error} retry={()=>query.refetch()}/>;if(!query.data)return null;const order=query.data.data;
 return <><Link href="/dashboard/orders" className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><ArrowLeft className="h-4 w-4"/>{t("Back to orders")}</Link><PageHeading title={t("Order #{number}",{number:order.number.slice(0,8)})} description={t("Created {date}",{date:dateTime(order.created_at)})} action={<StatusBadge status={order.status}/>}/><div className="grid items-start gap-6 xl:grid-cols-[1.7fr_1fr]"><Card><h2 className="mb-4 font-bold">{t("Items")}</h2><DataTable rows={order.items??[]} columns={[{label:t("Product"),render:i=><div><p className="font-semibold">{i.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400"><bdi dir="ltr">{i.sku}</bdi></p></div>},{label:t("Quantity"),render:i=>i.quantity},{label:t("Unit price"),render:i=><bdi dir="auto">{money(i.unit_price_minor)}</bdi>},{label:t("Subtotal"),render:i=><bdi dir="auto">{money(i.subtotal_minor)}</bdi>}]}/><dl className="ms-auto mt-5 grid max-w-xs gap-3 border-t border-slate-200 pt-4 text-sm dark:border-slate-800">{[[t("Subtotal"),order.subtotal_minor],[t("Discount"),-order.discount_minor],[t("Total"),order.total_minor]].map(([label,value])=><div key={label} className="flex justify-between"><dt>{t(String(label))}</dt><dd className="font-semibold"><bdi dir="auto">{money(Number(value))}</bdi></dd></div>)}</dl></Card><div className="grid gap-6"><OrderDelivery order={order}/><Card><h2 className="font-bold">{t("Customer")}</h2><p className="mt-4 text-sm font-semibold">{order.customer?.name}</p><p className="mt-2 break-words text-sm text-slate-500 dark:text-slate-400"><bdi dir="ltr">{order.customer?.email}</bdi></p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400"><bdi dir="ltr">{order.customer?.phone}</bdi></p>{order.notes&&<><h3 className="mt-6 text-sm font-semibold">{t("Notes")}</h3><p className="mt-2 whitespace-pre-wrap text-sm text-slate-500 dark:text-slate-400">{order.notes}</p></>}</Card><Card><h2 className="font-bold">{t("Manage status")}</h2><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t("Available actions follow the server's transition rules and your permissions.")}</p><div className="mt-4 grid gap-2">{order.allowed_transitions.filter(s=>s==="cancelled"?auth.can("orders.cancel"):auth.can("orders.update-status")).map(s=><Button key={s} onClick={()=>setAction(s)} className={s==="cancelled"?"bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/15":""}>{s==="cancelled"?t("Cancel order"):t("Mark {status}",{status:t(s)})}</Button>)}{!order.allowed_transitions.length&&<p className="text-sm text-slate-500 dark:text-slate-400">{t("This order is finalized.")}</p>}</div></Card></div></div><Dialog open={Boolean(action)} onOpenChange={open=>{if(!open&&!mutation.isPending)setAction(null)}} title={action==="cancelled"?t("Cancel this order?"):t("Mark order {status}?",{status:t(action??"")})}><p className="text-sm text-slate-500 dark:text-slate-400">{action==="cancelled"?t("This will restore the order quantities to stock. The server rechecks eligibility before applying the change."):t("The server will validate the current order state before saving.")}</p><div className="mt-5 flex justify-end gap-3"><Button className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" disabled={mutation.isPending} onClick={()=>setAction(null)}>{t("Keep current status")}</Button><Button disabled={mutation.isPending} onClick={()=>action&&mutation.mutate(action)}>{mutation.isPending?t("Updating…"):t("Confirm")}</Button></div></Dialog></>;
}
