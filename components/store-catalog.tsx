"use client";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Plus,
  Search,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useLocale } from "@/components/locale-provider";
import { useCart } from "@/components/cart-provider";
import { useListFilter } from "@/components/use-list-filters";
import { ProductMedia } from "@/components/product-media";
import { ErrorState } from "@/components/data";
import {
  Badge,
  Button,
  Card,
  Empty,
  Field,
  Input,
  Loading,
  Pagination,
  Select,
} from "@/components/ui";
import { api } from "@/lib/api";
import type { StoreProduct } from "@/lib/store-types";
import type { Category, Page, Resource } from "@/lib/types";

function AddToCart({
  product,
  quantity = 1,
}: {
  product: StoreProduct;
  quantity?: number;
}) {
  const { t } = useLocale(),
    cart = useCart();
  return (
    <Button
      className="w-full"
      type="button"
      disabled={
        !cart.ready ||
        !product.in_stock ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > product.max_order_quantity
      }
      onClick={() => {
        if (cart.add(product.id, quantity, product.max_order_quantity))
          toast.success(t("Added to your cart"), {
            action: {
              label: t("View cart"),
              onClick: () => {
                window.location.assign("/cart");
              },
            },
          });
        else
          toast.error(t("The cart limit or available quantity was reached."));
      }}
    >
      <Plus className="h-4 w-4" />
      {t(product.in_stock ? "Add to cart" : "Out of stock")}
    </Button>
  );
}

export function StoreCatalog() {
  const { t, money } = useLocale();
  const [q, setQ] = useListFilter("q", ""),
    [category, setCategory] = useListFilter("category_id", ""),
    [sort, setSort] = useListFilter("sort", "name"),
    [pageText, setPageText] = useListFilter("page", "1");
  const page = Math.max(1, Number(pageText) || 1),
    setPage = (value: number) => setPageText(String(value));
  const [field, direction] = sort.split(":");
  const parameters = new URLSearchParams({
    q,
    page: String(page),
    sort: field,
    direction: direction ?? "asc",
  });
  if (category) parameters.set("category_id", category);
  const products = useQuery({
    queryKey: ["store", "products", q, category, sort, page],
    queryFn: ({ signal }) =>
      api<Page<StoreProduct>>(`/store/products?${parameters}`, { signal }),
  });
  const categories = useQuery({
    queryKey: ["store", "categories"],
    queryFn: ({ signal }) =>
      api<Page<Category>>("/store/categories?per_page=100", { signal }),
  });
  const filtered = Boolean(q || category || sort !== "name" || page > 1);
  const clear = () => {
    setQ("");
    setCategory("");
    setSort("name");
    setPage(1);
  };
  return (
    <section id="products" className="scroll-mt-36">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{t("Products")}</h2>
        <p role="status" className="text-sm text-slate-600 dark:text-slate-400">
          {products.data
            ? t("{count} products available to browse", {
                count: products.data.meta.total,
              })
            : t("Products from our current catalog")}
        </p>
      </div>
      <div className="mb-6 grid grid-cols-2 items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-[minmax(200px,1fr)_200px_200px_auto]">
        <div className="col-span-2 hidden sm:block lg:col-span-1">
          <Field label={t("Search products")}>
            <Input
              aria-label={t("Search store products")}
              placeholder={t("Search products…")}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </Field>
        </div>
        <Field label={t("Category")}>
          <Select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t("All categories")}</option>
            {categories.data?.data.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("Sort products")}>
          <Select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="name">{t("Name A–Z")}</option>
            <option value="price_minor:asc">{t("Price: low to high")}</option>
            <option value="price_minor:desc">{t("Price: high to low")}</option>
            <option value="created_at:desc">{t("Newest")}</option>
          </Select>
        </Field>
        <Button
          type="button"
          variant="ghost"
          className="col-span-2 lg:col-span-1"
          disabled={!filtered}
          onClick={clear}
        >
          {t("Clear filters")}
        </Button>
      </div>
      {categories.isError && (
        <p
          role="status"
          className="mb-4 text-sm text-amber-700 dark:text-amber-300"
        >
          {t("Category filters could not be loaded.")}{" "}
          <button onClick={() => categories.refetch()} className="underline">
            {t("Try again")}
          </button>
        </p>
      )}
      {products.isLoading ? (
        <Loading />
      ) : products.isError ? (
        <ErrorState error={products.error} retry={() => products.refetch()} />
      ) : products.data?.data.length ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.data.data.map((product) => (
              <Card
                key={product.id}
                className="flex flex-col overflow-hidden p-0 sm:p-0"
              >
                <Link
                  href={`/shop/${product.id}`}
                  aria-label={t("View {name}", { name: product.name })}
                >
                  <ProductMedia
                    name={product.name}
                    category={product.category?.name}
                    src={product.image_url}
                    fit="cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="truncate text-sm text-slate-600 dark:text-slate-400">
                      {product.category?.name}
                    </span>
                    <Badge tone={product.in_stock ? "green" : "slate"}>
                      {t(product.in_stock ? "In stock" : "Sold out")}
                    </Badge>
                  </div>
                  <Link
                    href={`/shop/${product.id}`}
                    className="line-clamp-2 text-lg font-semibold leading-snug hover:text-indigo-600 dark:hover:text-indigo-300"
                  >
                    {product.name}
                  </Link>
                  {product.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                      {product.description}
                    </p>
                  )}
                  <p className="mb-4 mt-3 text-base font-semibold tabular-nums">
                    <bdi>{money(product.price_minor)}</bdi>
                  </p>
                  <div className="mt-auto">
                    <AddToCart product={product} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-6">
            <Pagination
              page={page}
              last={products.data.meta.last_page}
              onPage={setPage}
            />
          </div>
        </>
      ) : (
        <Card>
          <Empty
            title={t("No products found")}
            detail={t("Try another search or category.")}
          />
          <div className="flex justify-center">
            <Button variant="secondary" onClick={clear}>
              {t("Clear filters")}
            </Button>
          </div>
        </Card>
      )}
    </section>
  );
}

export function StoreProductDetail({ id }: { id: number }) {
  const { t, money } = useLocale(),
    [quantity, setQuantity] = useState(1);
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
        <ProductMedia
          large
          name={product.name}
          category={product.category?.name}
          src={product.image_url}
        />
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
    </>
  );
}
