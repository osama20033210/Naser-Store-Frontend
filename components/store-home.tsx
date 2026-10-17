"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Banknote, Package, ShoppingBag } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { ErrorState } from "@/components/data";
import { ProductMedia } from "@/components/product-media";
import { StoreProductCard } from "@/components/store-product-card";
import { useStorefrontSettings } from "@/components/store-content";
import { StoreProductPrice } from "@/components/store-product-price";
import { Button, Card, Skeleton } from "@/components/ui";
import { api } from "@/lib/api";
import type { StoreProduct } from "@/lib/store-types";
import type { Category, Page, Resource } from "@/lib/types";

function StoreCategoryTile({ category, product }: { category: Category; product?: StoreProduct }) {
  return <Link href={`/shop?category_id=${category.id}`} className="store-category flex min-h-28 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900">
    {category.image_url || product ? <ProductMedia name={category.name} src={category.image_url || product?.image_url} fit="cover"/> : <span aria-hidden="true" className="m-4 mb-0 grid size-9 place-items-center rounded-xl bg-white text-indigo-600 dark:bg-slate-800 dark:text-indigo-300"><Package className="size-4"/></span>}
    <span className="mt-auto break-words p-4 text-sm font-semibold">{category.name}</span>
  </Link>;
}

export function StoreHome() {
  const { t, money, locale } = useLocale();
  const settings = useStorefrontSettings();
  const content = settings.data?.data;
  const chosen = useQuery({ queryKey: ["store", "featured", content?.featured_product_id], queryFn: ({ signal }) => api<Resource<StoreProduct>>(`/store/products/${content!.featured_product_id}`, { signal }), enabled: Boolean(content?.featured_product_id), staleTime: 60000 });
  const offers = useQuery({ queryKey: ["store", "offers"], queryFn: ({ signal }) => api<Page<StoreProduct>>("/store/products?on_sale=1&in_stock=1&per_page=4", { signal }), staleTime: 30000 });
  const products = useQuery({ queryKey: ["store", "home", "latest"], queryFn: ({ signal }) => api<Page<StoreProduct>>("/store/products?sort=created_at&direction=desc&per_page=8", { signal }), staleTime: 60000 });
  const categories = useQuery({ queryKey: ["store", "categories"], queryFn: ({ signal }) => api<Page<Category>>("/store/categories?per_page=100", { signal }), staleTime: 60000 });
  const featured = chosen.data?.data ?? products.data?.data.find(product => product.image_url && product.in_stock) ?? products.data?.data.find(product => product.in_stock) ?? products.data?.data[0];
  return <div className="space-y-12 sm:space-y-16">
    <section className="store-hero grid overflow-hidden rounded-3xl border border-orange-100 bg-orange-50/60 dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-2">
      <div className="flex flex-col items-start justify-center p-6 sm:p-10 lg:p-12">
        <p className="mb-4 text-sm font-semibold text-indigo-700 dark:text-indigo-300">{t("Discover Naser Store")}</p>
        <h1 className="max-w-lg text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{content?.[`hero_title_${locale}`] || t("Good finds. A simpler way to shop.")}</h1>
        <p className="mt-5 max-w-md text-base leading-7 text-slate-600 dark:text-slate-400">{content?.[`hero_description_${locale}`] || t("Explore the latest products, choose what suits you, and pay when your order arrives.")}</p>
        <Button asChild className="mt-7"><Link href="/shop">{t("Explore products")}<ArrowUpRight aria-hidden="true" className="rtl:-scale-x-100"/></Link></Button>
      </div>
      <div className="min-w-0 p-4 sm:p-6">
        {products.isLoading ? <Skeleton className="aspect-[4/3] w-full rounded-2xl"/> : featured ? <Link href={`/shop/${featured.id}`} className="block overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
          {featured.image_url ? <ProductMedia name={featured.name} category={featured.category?.name} src={featured.image_url} priority/> : <div className="flex min-h-48 flex-col items-center justify-center gap-3 bg-slate-50 p-6 text-slate-500 dark:bg-slate-950 dark:text-slate-400"><ShoppingBag aria-hidden="true" className="size-8"/><p className="text-sm">{t("No image provided")}</p></div>}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4"><div className="min-w-0"><p className="text-xs text-slate-500 dark:text-slate-400">{t("From our catalog")}</p><h2 className="mt-1 truncate text-base font-semibold">{featured.name}</h2></div><StoreProductPrice product={featured}/></div>
        </Link> : <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-2xl bg-white text-slate-500 dark:bg-slate-950 dark:text-slate-400"><ShoppingBag aria-hidden="true" className="size-10"/><p>{t(products.isError ? "Catalog is temporarily unavailable" : "New products will appear here")}</p></div>}
      </div>
    </section>
    {settings.isError && <ErrorState error={settings.error} retry={() => settings.refetch()}/>}
    {chosen.isError && <ErrorState error={chosen.error} retry={() => chosen.refetch()}/>}
    {offers.isError ? <ErrorState error={offers.error} retry={() => offers.refetch()}/> : Boolean(offers.data?.data.length) && <section aria-labelledby="active-offers"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="mb-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">{t("Limited-time prices")}</p><h2 id="active-offers" className="text-2xl font-semibold">{t("Current offers")}</h2></div><Button asChild variant="outline"><Link href="/shop?on_sale=1">{t("View offers")}</Link></Button></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{offers.data?.data.map(product => <StoreProductCard key={product.id} product={product}/>)}</div></section>}
    <div className="grid gap-5 border-y border-slate-200 py-6 dark:border-slate-800 sm:grid-cols-3">
      {[{ icon: ShoppingBag, title: "Browse at your pace", copy: "Search, filter and compare product details." }, { icon: Banknote, title: "Pay on delivery", copy: "No card details required at checkout." }, { icon: Package, title: "Your orders, in one place", copy: "View order details and current status in your account." }].map(({ icon: Icon, title, copy }) => <div key={title} className="flex items-start gap-3"><Icon aria-hidden="true" className="mt-1 size-5 shrink-0 text-indigo-600 dark:text-indigo-400"/><div><h2 className="text-sm font-semibold">{t(title)}</h2><p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{t(copy)}</p></div></div>)}
    </div>
    <section aria-labelledby="home-categories"><div className="mb-5 flex items-center justify-between gap-4"><h2 id="home-categories" className="text-xl font-semibold sm:text-2xl">{t("Shop by category")}</h2><Link href="/shop" className="inline-flex min-h-11 items-center text-sm font-medium text-indigo-700 dark:text-indigo-300">{t("View all products")}</Link></div>
      {categories.isLoading ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{[0,1,2].map(i => <Skeleton key={i} className="h-28 w-full"/>)}</div> : categories.isError ? <ErrorState error={categories.error} retry={() => categories.refetch()}/> : categories.data?.data.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{categories.data.data.slice(0,6).map(category => <StoreCategoryTile key={category.id} category={category} product={products.data?.data.find(product => product.category?.id === category.id && product.image_url)}/>)}</div> : <p className="text-sm text-slate-500">{t("Categories will appear when products are available.")}</p>}
    </section>
    <section aria-labelledby="home-latest"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="mb-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">{t("Explore the catalog")}</p><h2 id="home-latest" className="text-xl font-semibold sm:text-2xl">{t("Latest products")}</h2></div><Button asChild variant="outline"><Link href="/shop?sort=created_at:desc">{t("View all products")}</Link></Button></div>
      {products.isLoading ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0,1,2,3].map(i => <Skeleton key={i} className="aspect-[3/4] w-full"/>)}</div> : products.isError ? <ErrorState error={products.error} retry={() => products.refetch()}/> : products.data?.data.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{products.data.data.map(product => <StoreProductCard key={product.id} product={product}/>)}</div> : <Card><p>{t("New products will appear here")}</p></Card>}
    </section>
    <section className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-slate-950 p-6 text-white sm:p-10"><div className="max-w-xl"><p className="text-sm font-medium text-orange-300">{t("Make room for something new")}</p><h2 className="mt-3 text-2xl font-semibold">{t("Find your next favorite in our catalog.")}</h2><p className="mt-3 text-sm leading-6 text-slate-300">{t("Browse by category or set a budget to narrow your search.")}</p></div><Button asChild><Link href="/shop">{t("Shop products")}<ArrowUpRight aria-hidden="true" className="rtl:-scale-x-100"/></Link></Button></section>
  </div>;
}
