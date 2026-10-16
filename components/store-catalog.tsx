"use client";
import { useLocale } from "@/components/locale-provider";


import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight, Banknote, Package, PackageCheck, Plus, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/cart-provider";
import { ErrorState } from "@/components/data";
import { Badge, Button, Card, Empty, Input, Loading, Pagination, Select } from "@/components/ui";
import { api } from "@/lib/api";
import type { StoreProduct } from "@/lib/store-types";
import type { Category, Page, Resource } from "@/lib/types";

function AddToCart({product,quantity=1}:{product:StoreProduct;quantity?:number}){
  const { t, errorText } = useLocale();

 const cart=useCart();
 return <Button type="button" disabled={!cart.ready||!product.in_stock} onClick={()=>cart.add(product.id,quantity,product.max_order_quantity)?toast.success(t("Added to your cart")):toast.error(errorText(t("The cart limit or available quantity was reached.")))}><Plus className="h-4 w-4"/>{product.in_stock?t("Add to cart"):t("Out of stock")}</Button>;
}

export function StoreCatalog(){
  const { t, money } = useLocale();

 const [q,setQ]=useState(""),[category,setCategory]=useState(""),[sort,setSort]=useState("name"),[page,setPage]=useState(1);
 const [field,direction]=sort.split(":");
 const parameters=new URLSearchParams({q,page:String(page),sort:field,direction:direction??"asc"});if(category)parameters.set("category_id",category);
 const products=useQuery({queryKey:["store","products",q,category,sort,page],queryFn:({signal})=>api<Page<StoreProduct>>(`/store/products?${parameters}`,{signal})});
 const categories=useQuery({queryKey:["store","categories"],queryFn:({signal})=>api<Page<Category>>("/store/categories?per_page=100",{signal})});
 return <><section className="relative mb-9 overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-white sm:px-10 sm:py-16"><div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-indigo-600/25 blur-3xl"/><div className="relative max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.25em] text-indigo-300">{t("Welcome to the store")}</p><h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">{t("Good finds.")}<br/><span className="text-indigo-300">{t("Simply ordered.")}</span></h1><p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">{t("Explore the catalog, choose what you need, and place your order. Pay when it arrives and follow its progress from your account.")}</p><div className="mt-7 flex flex-wrap gap-5 text-xs text-slate-300"><span className="flex items-center gap-2"><Banknote className="h-4 w-4 text-indigo-300"/>{t("Cash on delivery")}</span><span className="flex items-center gap-2"><PackageCheck className="h-4 w-4 text-indigo-300"/>{t("Order tracking")}</span></div></div></section><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-black">{t("Explore the catalog")}</h2><p className="mt-1 text-sm text-slate-500">{products.data?t("{count} products available to browse", {count:products.data.meta.total}):t("Products from our current catalog")}</p></div><Link href="/cart" className="flex items-center gap-1 text-sm font-semibold text-indigo-600">{t("View your cart")}<ArrowUpRight className="h-4 w-4"/></Link></div><div className="mb-6 flex flex-wrap gap-3"><div className="relative min-w-48 flex-1"><Search className="absolute start-3 top-3.5 h-4 w-4 text-slate-400"/><Input aria-label={t("Search store products")} placeholder={t("Search products…")} className="ps-9" value={q} onChange={e=>{setQ(e.target.value);setPage(1)}}/></div><Select aria-label={t("Product category")} className="w-full sm:w-auto sm:max-w-64" value={category} onChange={e=>{setCategory(e.target.value);setPage(1)}}><option value="">{t("All categories")}</option>{categories.data?.data.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</Select><Select aria-label={t("Product sort order")} className="w-full sm:w-auto" value={sort} onChange={e=>{setSort(e.target.value);setPage(1)}}><option value="name">{t("Name A–Z")}</option><option value="price_minor:asc">{t("Price: low to high")}</option><option value="price_minor:desc">{t("Price: high to low")}</option><option value="created_at:desc">{t("Newest")}</option></Select></div>{products.isLoading?<Loading/>:products.isError?<ErrorState error={products.error} retry={()=>products.refetch()}/>:products.data?.data.length?<><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.data.data.map(product=><Card key={product.id} className="flex flex-col overflow-hidden p-0"><Link href={`/shop/${product.id}`} className="grid h-40 place-items-center bg-gradient-to-br from-indigo-50 to-slate-100" aria-label={t("View {name}",{name:product.name})}><Package className="h-16 w-16 text-indigo-300" strokeWidth={1}/></Link><div className="flex flex-1 flex-col p-5"><div className="mb-3 flex items-center justify-between gap-2"><span className="truncate text-xs text-slate-500">{product.category?.name}</span><Badge tone={product.in_stock?"green":"slate"}>{product.in_stock?t("In stock"):t("Sold out")}</Badge></div><Link href={`/shop/${product.id}`} className="font-bold hover:text-indigo-600">{product.name}</Link><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{product.description||product.sku}</p><p className="mb-4 mt-4 text-xl font-black">{money(product.price_minor)}</p><div className="mt-auto"><AddToCart product={product}/></div></div></Card>)}</div><div className="mt-7"><Pagination page={page} last={products.data.meta.last_page} onPage={setPage}/></div></>:<Card><Empty title={t("No products found")} detail={t("Try another search or category. Products appear here when the team activates them.")}/></Card>}</>;
}

export function StoreProductDetail({id}:{id:number}){
  const { t, money } = useLocale();

 const [quantity,setQuantity]=useState(1);
 const query=useQuery({queryKey:["store","product",id],queryFn:({signal})=>api<Resource<StoreProduct>>(`/store/products/${id}`,{signal})});
 if(query.isLoading)return <Loading/>;if(query.isError)return <ErrorState error={query.error} retry={()=>query.refetch()}/>;if(!query.data)return null;const product=query.data.data;
 return <><Link href="/shop" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft className="h-4 w-4"/>{t("Back to the shop")}</Link><div className="grid gap-8 lg:grid-cols-2"><div className="grid min-h-72 place-items-center rounded-3xl bg-gradient-to-br from-indigo-100 to-slate-100 sm:min-h-96"><Package className="h-36 w-36 text-indigo-300" strokeWidth={.75}/></div><Card className="self-start p-7"><p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">{product.category?.name}</p><h1 className="mt-3 text-3xl font-black">{product.name}</h1><p className="mt-2 text-xs text-slate-400">{t("SKU")} {product.sku}</p><p className="mt-6 text-3xl font-black">{money(product.price_minor)}</p><div className="mt-4"><Badge tone={product.in_stock?"green":"slate"}>{product.in_stock?t("In stock"):t("Out of stock")}</Badge></div><p className="my-6 whitespace-pre-wrap text-sm leading-7 text-slate-500">{product.description||t("Contact the store if you need more information about this product.")}</p><div className="flex flex-wrap gap-3"><Input aria-label={t("Quantity")} type="number" className="w-24" min={1} max={product.max_order_quantity||1} value={quantity} onChange={e=>{const next=Number(e.target.value);if(Number.isInteger(next)&&next>0&&next<=product.max_order_quantity)setQuantity(next)}}/><AddToCart product={product} quantity={quantity}/><Button asChild variant="outline"><Link href="/cart"><ShoppingBag className="h-4 w-4"/>{t("View cart")}</Link></Button></div><p className="mt-5 flex items-center gap-2 text-xs text-slate-500"><Banknote className="h-4 w-4"/>{t("Cash on delivery. Final availability is checked when you order.")}</p></Card></div></>;
}
