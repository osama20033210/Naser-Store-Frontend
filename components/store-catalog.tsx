"use client";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AddToCart, StoreProductCard } from "@/components/store-product-card";
import { decimalToMinor, minorToDecimal } from "@/lib/money";
import { useLocale } from "@/components/locale-provider";
import { setListFilters, useListFilter } from "@/components/use-list-filters";
import { ProductMedia } from "@/components/product-media";
import { ErrorState } from "@/components/data";
import {
  Badge,
  Button,
  Card,
  Dialog,
  Empty,
  Field,
  Input,
  Loading,
  Pagination,
  Select,
  Skeleton,
} from "@/components/ui";
import { api } from "@/lib/api";
import type { StoreProduct } from "@/lib/store-types";
import type { Category, Page, Resource } from "@/lib/types";

export function StoreCatalog() {
  const { t } = useLocale();
  const [q] = useListFilter("q", ""), [category] = useListFilter("category_id", ""),
    [sort] = useListFilter("sort", "name"), [pageText] = useListFilter("page", "1"),
    [minimum] = useListFilter("min_price_minor", ""), [maximum] = useListFilter("max_price_minor", ""),
    [availability] = useListFilter("in_stock", "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const page = Math.max(1, Number(pageText) || 1);
  const [field, direction] = sort.split(":");
  const parameters = new URLSearchParams({ q, page: String(page), sort: field, direction: direction ?? "asc" });
  if (category) parameters.set("category_id", category);
  if (minimum) parameters.set("min_price_minor", minimum);
  if (maximum) parameters.set("max_price_minor", maximum);
  if (availability) parameters.set("in_stock", availability);
  const products = useQuery({
    queryKey: ["store", "products", q, category, sort, page, minimum, maximum, availability],
    queryFn: ({ signal }) => api<Page<StoreProduct>>(`/store/products?${parameters}`, { signal }),
  });
  const categories = useQuery({
    queryKey: ["store", "categories"],
    queryFn: ({ signal }) => api<Page<Category>>("/store/categories?per_page=100", { signal }),
    staleTime: 60000,
  });
  const filtered = Boolean(q || category || minimum || maximum || availability || sort !== "name" || page > 1);
  const clear = () => setListFilters({ q: null, category_id: null, min_price_minor: null, max_price_minor: null, in_stock: null, sort: null, page: null });
  const filterProps = { categories: categories.data?.data ?? [], q, category, minimum, maximum, availability, onApplied: () => setFiltersOpen(false), clear };
  return <section id="products" className="scroll-mt-44">
    <div className="mb-7 border-b border-slate-200 pb-6 dark:border-slate-800">
      <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><Link href="/">{t("Home")}</Link><span aria-hidden="true" className="mx-2">/</span>{t("Shop")}</p>
      <h1 className="text-2xl font-semibold sm:text-3xl">{t("Explore the catalog")}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{t("Find what you need by category, price and availability.")}</p>
    </div>
    <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="panel hidden min-w-0 p-4 lg:block"><h2 className="mb-5 font-semibold">{t("Filter products")}</h2><CatalogFilters {...filterProps}/></aside>
      <div className="min-w-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p role="status" className="text-sm text-slate-500 dark:text-slate-400">{products.data ? t("{count} products available to browse", { count: products.data.meta.total }) : t("Products from our current catalog")}</p>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Button type="button" variant="outline" className="lg:hidden" onClick={() => setFiltersOpen(true)}><SlidersHorizontal aria-hidden="true"/>{t("Filters")}</Button>
            <Select aria-label={t("Sort products")} className="w-auto max-w-full" value={sort} onChange={event => setListFilters({ sort: event.target.value, page: null })}>
              <option value="name">{t("Name A–Z")}</option><option value="price_minor:asc">{t("Price: low to high")}</option><option value="price_minor:desc">{t("Price: high to low")}</option><option value="created_at:desc">{t("Newest")}</option>
            </Select>
          </div>
        </div>
        {categories.isError && <p role="status" className="mb-4 text-sm text-amber-700 dark:text-amber-300">{t("Category filters could not be loaded.")} <button onClick={() => categories.refetch()} className="min-h-11 underline">{t("Try again")}</button></p>}
        {products.isLoading ? <ProductGridLoading/> : products.isError ? <ErrorState error={products.error} retry={() => products.refetch()}/> : products.data?.data.length ? <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{products.data.data.map(product => <StoreProductCard key={product.id} product={product}/>)}</div>
          {products.data.meta.last_page > 1 && <div className="mt-6"><Pagination page={page} last={products.data.meta.last_page} onPage={value => setListFilters({ page: String(value) })}/></div>}
        </> : <Card><Empty title={t("No products found")} detail={t("Try another search or category.")}/>{filtered && <div className="flex justify-center"><Button variant="secondary" onClick={clear}>{t("Clear filters")}</Button></div>}</Card>}
      </div>
    </div>
    <Dialog open={filtersOpen} onOpenChange={setFiltersOpen} title={t("Filter products")} className="storefront" drawer><CatalogFilters {...filterProps}/></Dialog>
  </section>;
}

type CatalogFilterProps = {
  categories: Category[]; q: string; category: string; minimum: string; maximum: string; availability: string;
  onApplied: () => void; clear: () => void;
};
function CatalogFilters({ categories, q, category, minimum, maximum, availability, onApplied, clear }: CatalogFilterProps) {
  const { t, errorText } = useLocale();
  const amount = (value: string) => value && Number.isSafeInteger(Number(value)) && Number(value) >= 0 ? minorToDecimal(Number(value)) : "";
  const form = useForm({ values: { q, category, minimum: amount(minimum), maximum: amount(maximum), availability } });
  return <form className="grid gap-4" onSubmit={form.handleSubmit(values => {
    let min: number | null = null, max: number | null = null;
    try { if (values.minimum.trim()) min = decimalToMinor(values.minimum); } catch (error) { form.setError("minimum", { message: errorText((error as Error).message) }); return; }
    try { if (values.maximum.trim()) max = decimalToMinor(values.maximum); } catch (error) { form.setError("maximum", { message: errorText((error as Error).message) }); return; }
    if (min !== null && max !== null && max < min) { form.setError("maximum", { message: t("Maximum price must be at least the minimum price.") }); return; }
    setListFilters({ q: values.q.trim() || null, category_id: values.category || null, min_price_minor: min === null ? null : String(min), max_price_minor: max === null ? null : String(max), in_stock: values.availability || null, page: null });
    onApplied();
  })}>
    <Field label={t("Search products")}><Input type="search" maxLength={100} placeholder={t("Search products…")} {...form.register("q")}/></Field>
    <Field label={t("Category")}><Select {...form.register("category")}><option value="">{t("All categories")}</option>{categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field>
    <Field label={t("Minimum price (USD)")} error={form.formState.errors.minimum?.message}><Input dir="ltr" inputMode="decimal" placeholder="0.00" {...form.register("minimum")}/></Field>
    <Field label={t("Maximum price (USD)")} error={form.formState.errors.maximum?.message}><Input dir="ltr" inputMode="decimal" placeholder={t("No limit")} {...form.register("maximum")}/></Field>
    <Field label={t("Availability")}><Select {...form.register("availability")}><option value="">{t("All products")}</option><option value="1">{t("In stock")}</option><option value="0">{t("Out of stock")}</option></Select></Field>
    <Button type="submit">{t("Apply filters")}</Button>
    <Button type="button" variant="ghost" onClick={() => { form.reset({ q: "", category: "", minimum: "", maximum: "", availability: "" }); clear(); onApplied(); }}>{t("Clear filters")}</Button>
  </form>;
}

function ProductGridLoading() {
  const { t } = useLocale();
  return <div role="status" aria-label={t("Loading")} aria-busy="true" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({length:8},(_,index)=><Card key={index} className="overflow-hidden p-0 sm:p-0"><Skeleton className="aspect-[4/3] w-full rounded-none"/><div className="grid gap-3 p-4 sm:p-5"><div className="flex justify-between gap-4"><Skeleton className="h-5 w-24"/><Skeleton className="h-5 w-12"/></div><Skeleton className="h-7 w-3/4"/><Skeleton className="h-10 w-full"/><Skeleton className="my-1 h-6 w-24"/><Skeleton className="h-11 w-full"/></div></Card>)}<span className="sr-only">{t("Loading")}</span></div>;
}

export function StoreProductDetail({ id }: { id: number }) {
  const { t, money } = useLocale(),
    [quantity, setQuantity] = useState(1);
  const [zoomOpen, setZoomOpen] = useState(false);
  const query = useQuery({
    queryKey: ["store", "product", id],
    queryFn: ({ signal }) =>
      api<Resource<StoreProduct>>(`/store/products/${id}`, { signal }),
  });
  if (query.isLoading) return <Loading />;
  if (query.isError)
    return <ErrorState error={query.error} retry={() => query.refetch()} />;
  if (!query.data) return null;
  const product = query.data.data,
    validQuantity =
      Number.isInteger(quantity) &&
      quantity >= 1 &&
      quantity <= product.max_order_quantity;
  return (
    <>
      <Link
        href="/shop"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("Back to the shop")}
      </Link>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="min-w-0"><ProductMedia
          large
          name={product.name}
          category={product.category?.name}
          src={product.image_url}
        />{product.image_url && <Button type="button" variant="outline" className="mt-3" onClick={() => setZoomOpen(true)}>{t("View larger image")}</Button>}</div>
        <Card>
          <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
            {product.category?.name}
          </p>
          <h1 className="mt-2 break-words text-3xl font-bold">
            {product.name}
          </h1>
          <div className="my-4 flex flex-wrap items-center gap-4">
            <p className="text-xl font-semibold tabular-nums">
              <bdi>{money(product.price_minor)}</bdi>
            </p>
            <Badge tone={product.in_stock ? "green" : "slate"}>
              {t(product.in_stock ? "In stock" : "Out of stock")}
            </Badge>
          </div>
          {product.description && (
            <p className="border-y border-slate-200 py-5 text-base leading-7 whitespace-pre-wrap dark:border-slate-800">
              {product.description}
            </p>
          )}
          <div className="mt-5 grid items-end gap-3 sm:grid-cols-[110px_1fr]">
            <Field
              label={t("Quantity")}
              error={
                product.in_stock && !validQuantity
                  ? t("Choose a quantity between 1 and {count}.", {
                      count: product.max_order_quantity,
                    })
                  : undefined
              }
            >
              <Input
                type="number"
                min={1}
                max={product.max_order_quantity || 1}
                disabled={!product.in_stock}
                value={Number.isNaN(quantity) ? "" : quantity}
                onChange={(e) =>
                  setQuantity(
                    e.target.value === "" ? NaN : Number(e.target.value),
                  )
                }
              />
            </Field>
            <AddToCart product={product} quantity={quantity} />
          </div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            {t(
              "Cash on delivery. Final availability is checked when you order.",
            )}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <p className="text-sm text-slate-500">
              {t("SKU")}: <bdi dir="ltr">{product.sku}</bdi>
            </p>
            <Button asChild variant="secondary">
              <Link href="/cart">
                <ShoppingBag className="h-4 w-4" />
                {t("View cart")}
              </Link>
            </Button>
          </div>
        </Card>
      </div>
      <RelatedProducts product={product}/>
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen} title={product.name} className="storefront"><ProductMedia large name={product.name} src={product.image_url}/></Dialog>
    </>
  );
}

function RelatedProducts({ product }: { product: StoreProduct }) {
  const { t } = useLocale();
  const query = useQuery({
    queryKey: ["store", "related", product.category?.id],
    queryFn: ({ signal }) => api<Page<StoreProduct>>(`/store/products?category_id=${product.category!.id}&per_page=8`, { signal }),
    enabled: Boolean(product.category?.id),
    staleTime: 60000,
  });
  if (!product.category?.id) return null;
  const products = query.data?.data.filter(item => item.id !== product.id).slice(0, 4) ?? [];
  return <section className="mt-12" aria-labelledby="related-products"><h2 id="related-products" className="mb-5 text-xl font-semibold">{t("More in this category")}</h2>{query.isLoading ? <ProductGridLoading/> : query.isError ? <ErrorState error={query.error} retry={() => query.refetch()}/> : products.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{products.map(item => <StoreProductCard key={item.id} product={item}/>)}</div> : <p className="text-sm text-slate-500 dark:text-slate-400">{t("No other products in this category yet.")}</p>}</section>;
}
