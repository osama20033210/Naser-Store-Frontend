"use client";
import { useLocale } from "@/components/locale-provider";


import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useListFilter } from "@/components/use-list-filters";
import { decimalToMinor, minorToDecimal } from "@/lib/money";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";
import { DataTable, ErrorState, Lookup, PageHeading, RequirePermission } from "@/components/data";
import { Badge, Button, Card, Dialog, Field, Input, Loading, Pagination, Select, Textarea } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { ProductImageField } from "@/components/product-image-field";
import { ProductMedia } from "@/components/product-media";
import type { Category, Customer, Order, Page, Product, Resource } from "@/lib/types";

export type Module="products"|"categories"|"customers";
type Entity=Partial<Product & Customer & Category> & {id:number;name:string};
const names={products:{title:"Products",singular:"product",description:"Manage your catalog, prices, and availability."},categories:{title:"Categories",singular:"category",description:"Organize your catalog into meaningful collections."},customers:{title:"Customers",singular:"customer",description:"Keep customer details and order history in one place."}};
export function validModule(value:string): value is Module{return ["products","categories","customers"].includes(value)}

export function CatalogList({module}:{module:Module}){
  
return <RequirePermission permission={`${module}.view`}><CatalogListContent module={module}/></RequirePermission>}
function CatalogListContent({module}:{module:Module}){
  const { t, money } = useLocale();

 const auth=useAuth(), config=names[module];const [q,setQ]=useListFilter("q",""),[pageText,setPageText]=useListFilter("page","1"),[sort,setSort]=useListFilter("sort","created_at"),[filter,setFilter]=useListFilter("filter",""); const page=Math.max(1,Number(pageText)||1),setPage=(value:number)=>setPageText(String(value));
 const params=new URLSearchParams({q,page:String(page),sort,direction:sort==="name"?"asc":"desc"});if(filter==="low")params.set("low_stock","1");if(filter==="active"||filter==="inactive")params.set("active",filter==="active"?"1":"0");
 const query=useQuery({queryKey:[module,q,page,sort,filter],queryFn:()=>api<Page<Entity>>(`/${module}?${params}`)});
 const columns=[{label:t("Name"),render:(row:Entity)=><Link href={`/dashboard/${module}/${row.id}`} className="font-semibold text-indigo-600 dark:text-indigo-400">{row.name}</Link>},...(module==="products"?[{label:t("SKU"),render:(r:Entity)=><bdi dir="ltr">{r.sku}</bdi>},{label:t("Category"),render:(r:Entity)=>r.category?.name},{label:t("Price"),render:(r:Entity)=><bdi dir="auto">{money(r.price_minor??0)}</bdi>},{label:t("Stock"),render:(r:Entity)=><Badge tone={r.low_stock?"amber":"green"}>{r.stock}</Badge>},{label:t("Status"),render:(r:Entity)=><Badge tone={r.active?"green":"slate"}>{r.active?t("Active"):t("Inactive")}</Badge>}]:module==="customers"?[{label:t("Email"),render:(r:Entity)=><bdi dir="ltr">{r.email}</bdi>},{label:t("Phone"),render:(r:Entity)=><bdi dir="ltr">{r.phone??"—"}</bdi>},{label:t("Orders"),render:(r:Entity)=>r.orders_count??0}]:[{label:t("Description"),render:(r:Entity)=><span className="inline-block max-w-72 truncate align-middle text-slate-500 dark:text-slate-400">{r.description??"—"}</span>},{label:t("Products"),render:(r:Entity)=>r.products_count??0}]),{label:"",render:(r:Entity)=>auth.can(`${module}.update`)?<Link aria-label={t("Edit {name}",{name:r.name})} href={`/dashboard/${module}/${r.id}/edit`} className="inline-flex h-11 w-11 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"><Pencil className="h-4 w-4"/></Link>:null}];
 return <><PageHeading title={t(config.title)} description={t(config.description)} action={auth.can(`${module}.create`)&&<Button asChild><Link href={`/dashboard/${module}/new`}><Plus className="h-4 w-4"/>{t("Add {name}",{name:t(config.singular)})}</Link></Button>}/><Card><div className="mb-4 flex flex-wrap gap-3"><div className="relative min-w-52 flex-1"><Search className="absolute start-3 top-3.5 h-4 w-4 text-slate-400"/><Input placeholder={t("Search {name}…", {name:t(module)})} aria-label={t("Search {name}",{name:t(module)})} className="ps-9" value={q} onChange={e=>{setQ(e.target.value);setPage(1)}}/></div>{module==="products"&&<><Select aria-label={t("Availability filter")} className="w-auto" value={filter} onChange={e=>{setFilter(e.target.value);setPage(1)}}><option value="">{t("All products")}</option><option value="active">{t("Active")}</option><option value="inactive">{t("Inactive")}</option><option value="low">{t("Low stock")}</option></Select><Select aria-label={t("Sort products")} className="w-auto" value={sort} onChange={e=>{setSort(e.target.value);setPage(1)}}><option value="created_at">{t("Newest first")}</option><option value="name">{t("Name A–Z")}</option><option value="price_minor">{t("Highest price")}</option><option value="stock">{t("Highest stock")}</option></Select></>}</div>{query.isLoading?<Loading/>:query.isError?<ErrorState error={query.error} retry={()=>query.refetch()}/>:<><DataTable rows={query.data?.data??[]} columns={columns}/><div className="mt-4"><Pagination page={page} last={query.data?.meta.last_page??1} onPage={setPage}/></div></>}</Card></>;
}

export function CatalogForm({module,id}:{module:Module;id?:number}){
  
return <RequirePermission permission={`${module}.${id?"update":"create"}`}><CatalogFormContent module={module} id={id}/></RequirePermission>}
function CatalogFormContent({module,id}:{module:Module;id?:number}){
  const { t, errorText } = useLocale();

 const config=names[module],router=useRouter(),client=useQueryClient();
 const [imageFile,setImageFile]=useState<File|null>(null),[removeImage,setRemoveImage]=useState(false);
 const query=useQuery({queryKey:[module,id],queryFn:()=>api<Resource<Entity>>(`/${module}/${id}`),enabled:Boolean(id)});
 const entity=query.data?.data;
 const fields=module==="products"?["name","sku","price_minor","low_stock_threshold","description"]:module==="customers"?["name","email","phone","address"]:["name","description"];
 const defaults:Record<string,string>={name:"",sku:"",price_minor:"0",low_stock_threshold:"5",description:"",email:"",phone:"",address:"",active:"true",category_id:""};
 const values={...defaults,...Object.fromEntries(Object.entries(entity??{}).map(([k,v])=>[k,v===null?"":String(v)])),price_minor:minorToDecimal(entity?.price_minor??0)};
 const {register,handleSubmit,watch,setValue,setError,clearErrors,formState:{errors,isSubmitting}}=useForm<Record<string,string>>({values});
 const submit=handleSubmit(async form=>{
  if(errors.image)return;
  const body:Record<string,unknown>=Object.fromEntries(fields.map(k=>[k,form[k]||null]));
  if(module==="products"){body.category_id=Number(form.category_id);body.active=form.active==="true";try{body.price_minor=decimalToMinor(form.price_minor,100000000)}catch(error){setError("price_minor",{message:error instanceof Error?error.message:"Invalid amount"});return}body.low_stock_threshold=Number(form.low_stock_threshold)}
  if(module==="products"&&removeImage)body.remove_image=true;
  let requestBody:string|FormData=JSON.stringify(body),method=id?"PUT":"POST";
  if(module==="products"&&imageFile){const multipart=new FormData();Object.entries(body).forEach(([key,value])=>multipart.append(key,typeof value==="boolean"?(value?"1":"0"):String(value??"")));multipart.append("image",imageFile);if(id)multipart.append("_method","PUT");requestBody=multipart;method="POST"}
  try{const result=await api<Resource<Entity>>(`/${module}${id?`/${id}`:""}`,{method,body:requestBody});await client.invalidateQueries({queryKey:[module]});await client.invalidateQueries({queryKey:["lookup",module]});toast.success(t("{name} saved",{name:t(config.singular)}));router.push(`/dashboard/${module}/${result.data.id}`)}catch(error){if(error instanceof ApiError)Object.entries(error.body.errors??{}).forEach(([key,messages])=>setError(key,{message:messages[0]}));toast.error(errorText(error instanceof Error?error.message:t("Save failed")))}
 });
 if(id&&query.isLoading)return <Loading/>;if(query.isError)return <ErrorState error={query.error}/>;
 const renderFields=(keys:string[])=>keys.map(key=><div key={key} className={["description","address"].includes(key)?"sm:col-span-2":""}><Field label={{price_minor:t("Price (USD)"),low_stock_threshold:t("Low stock threshold"),sku:t("SKU"),email:t("Email"),phone:t("Phone"),address:t("Address"),name:t("Name"),description:t("Description")}[key]??key} error={errors[key]?.message}>{["description","address"].includes(key)?<Textarea {...register(key)}/>:<Input type={key==="email"?"email":key==="low_stock_threshold"?"number":"text"} min={["price_minor","low_stock_threshold"].includes(key)?0:undefined} step={key==="low_stock_threshold"?1:undefined} inputMode={key==="price_minor"?"decimal":undefined} dir={key==="price_minor"||key==="sku"?"ltr":undefined} {...register(key,{required:["name","sku","email","price_minor","low_stock_threshold"].includes(key)?"This field is required":false,validate:key==="price_minor"?(value=>{try{decimalToMinor(value,100000000);return true}catch(error){return error instanceof Error?error.message:"Invalid amount"}}):undefined})}/>}</Field></div>);
 if(module==="products")return <div className="mx-auto max-w-6xl">
  <Link className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300" href="/dashboard/products"><ArrowLeft className="h-4 w-4"/>{t("Back to {name}",{name:t(module)})}</Link>
  <form onSubmit={submit}>
    <PageHeading title={t(id?"Edit product":"New product")} description={t("Update product details, image and availability.")} action={<div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link href="/dashboard/products">{t("Cancel")}</Link></Button><Button type="submit" disabled={isSubmitting||Boolean(errors.image)}>{isSubmitting?t("Saving\u2026"):t("Save changes")}</Button></div>}/>
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid min-w-0 gap-5">
        <Card><div className="mb-5 border-b border-slate-200 pb-4 dark:border-slate-800"><h2 className="text-lg font-semibold">{t("Product information")}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("The details customers see in your store.")}</p></div><div className="grid gap-5 sm:grid-cols-2">{renderFields(["name","sku","description"])}</div></Card>
        <Card><div className="mb-5"><h2 className="text-lg font-semibold">{t("Pricing and inventory")}</h2></div><div className="grid gap-5 sm:grid-cols-2">{renderFields(["price_minor","low_stock_threshold"])}</div><p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:bg-slate-950/50 dark:text-slate-400">{t("Stock quantities are managed in Inventory.")}</p></Card>
      </div>
      <div className="grid min-w-0 gap-5">
        <Card><ProductImageField name={watch("name")} currentUrl={entity?.image_url} file={imageFile} remove={removeImage} disabled={isSubmitting} error={errors.image?.message} onFile={file=>{setImageFile(file);setRemoveImage(false);clearErrors("image")}} onRemove={remove=>{setImageFile(null);setRemoveImage(remove);clearErrors("image")}} onError={message=>setError("image",{message})}/></Card>
        <Card><h2 className="mb-5 text-lg font-semibold">{t("Organization and visibility")}</h2><div className="grid gap-5"><div><Lookup resource="categories" value={Number(watch("category_id"))} onChange={value=>setValue("category_id",String(value))} label={t("Category")} selectedLabel={entity?.category?.name}/>{errors.category_id&&<p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{errorText(errors.category_id.message??"")}</p>}</div><Field label={t("Status")} hint={t("Only active products appear in the store.")}><Select {...register("active")}><option value="true">{t("Active")}</option><option value="false">{t("Inactive")}</option></Select></Field></div></Card>
      </div>
    </div>
  </form>
 </div>;
 return <><Link className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400" href={`/dashboard/${module}`}><ArrowLeft className="h-4 w-4"/>{t("Back to {name}",{name:t(module)})}</Link><PageHeading title={t(id ? "Edit {name}" : "New {name}", {name:t(config.singular)})} description={t("Keep details accurate so your team can work confidently.")}/><Card className="max-w-3xl"><form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">{renderFields(fields)}<div className="flex gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:col-span-2"><Button disabled={isSubmitting||Boolean(errors.image)}>{isSubmitting?t("Saving…"):t("Save changes")}</Button><Button asChild type="button" className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"><Link href={`/dashboard/${module}`}>{t("Cancel")}</Link></Button></div></form></Card></>;
}

export function CatalogDetail({module,id}:{module:Module;id:number}){
  
return <RequirePermission permission={`${module}.view`}><CatalogDetailContent module={module} id={id}/></RequirePermission>}
function CatalogDetailContent({module,id}:{module:Module;id:number}){
  const { t, errorText, money } = useLocale();

 const auth=useAuth(),router=useRouter(),client=useQueryClient(),[confirm,setConfirm]=useState(false),[page,setPage]=useState(1);
 const query=useQuery({queryKey:[module,id],queryFn:()=>api<Resource<Entity>>(`/${module}/${id}`)});
 const history=useQuery({queryKey:["customer-orders",id,page],queryFn:()=>api<Page<Order>>(`/customers/${id}/orders?page=${page}`),enabled:module==="customers"&&auth.can("orders.view")});
 const remove=useMutation({mutationFn:()=>api(`/${module}/${id}`,{method:"DELETE"}),onSuccess:async()=>{await client.invalidateQueries({queryKey:[module]});toast.success(t("Record deleted"));router.push(`/dashboard/${module}`)},onError:(error)=>toast.error(errorText(error.message))});
 if(query.isLoading)return <Loading/>;if(query.isError)return <ErrorState error={query.error}/>;if(!query.data)return null;const r=query.data.data;
 const details=module==="products"?[[t("SKU"),r.sku],[t("Category"),r.category?.name],[t("Price"),money(r.price_minor??0)],[t("Available stock"),r.stock],[t("Low stock threshold"),r.low_stock_threshold],[t("Status"),r.active?t("Active"):t("Inactive")],[t("Description"),r.description]]:module==="customers"?[[t("Email"),r.email],[t("Phone"),r.phone],[t("Address"),r.address],[t("Orders"),r.orders_count]]:[[t("Description"),r.description],[t("Products"),r.products_count]];
 return <><Link className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400" href={`/dashboard/${module}`}><ArrowLeft className="h-4 w-4"/>{t("Back to {name}",{name:t(module)})}</Link><PageHeading title={r.name} description={t("{name} details",{name:t(names[module].singular)})} action={<div className="flex gap-2">{auth.can(`${module}.update`)&&<Button asChild><Link href={`/dashboard/${module}/${id}/edit`}><Pencil className="h-4 w-4"/>{t("Edit")}</Link></Button>}{auth.can(`${module}.delete`)&&<Button className="bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/15" onClick={()=>setConfirm(true)}><Trash2 className="h-4 w-4"/>{t("Delete")}</Button>}</div>}/><Card>{module==="products"&&<div className="mb-6 max-w-xs"><ProductMedia name={r.name} src={r.image_url}/></div>}<dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{details.map(([label,value])=><div key={String(label)}><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t(String(label))}</dt><dd className="mt-2 whitespace-pre-wrap break-words text-sm">{value??"—"}</dd></div>)}</dl></Card>{module==="customers"&&auth.can("orders.view")&&<Card className="mt-6"><h2 className="mb-4 font-bold">{t("Order history")}</h2>{history.isLoading?<Loading/>:history.isError?<ErrorState error={history.error}/>:<><DataTable rows={history.data?.data??[]} columns={[{label:t("Order"),render:o=><Link href={`/dashboard/orders/${o.id}`} className="font-semibold text-indigo-600 dark:text-indigo-400">#<bdi dir="auto">{o.number.slice(0,8)}</bdi></Link>},{label:t("Status"),render:o=><Badge>{o.status}</Badge>},{label:t("Total"),render:o=><bdi dir="auto">{money(o.total_minor)}</bdi>}]}/><Pagination page={page} last={history.data?.meta.last_page??1} onPage={setPage}/></>}</Card>}<Dialog title={t("Delete this record?")} open={confirm} onOpenChange={setConfirm}><p className="text-sm text-slate-500 dark:text-slate-400">{t("Deletion is permanent. Records with protected history cannot be deleted.")}</p><div className="mt-5 flex justify-end gap-2"><Button className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" onClick={()=>setConfirm(false)}>{t("Keep record")}</Button><Button className="bg-rose-600 hover:bg-rose-500" disabled={remove.isPending} onClick={()=>remove.mutate()}>{t("Delete")}</Button></div></Dialog></>;
}
