"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/cart-provider";
import { useLocale } from "@/components/locale-provider";
import { ProductMedia } from "@/components/product-media";
import { Badge, Button, Card } from "@/components/ui";
import type { StoreProduct } from "@/lib/store-types";

export function AddToCart({ product, quantity = 1 }: { product: StoreProduct; quantity?: number }) {
  const { t } = useLocale(), cart = useCart();
  return <Button className="w-full" type="button" disabled={!cart.ready || !product.in_stock || !Number.isInteger(quantity) || quantity < 1 || quantity > product.max_order_quantity}
    onClick={() => {
      if (cart.add(product.id, quantity, product.max_order_quantity)) toast.success(t("Added to your cart"), { action: { label: t("View cart"), onClick: () => window.location.assign("/cart") } });
      else toast.error(t("The cart limit or available quantity was reached."));
    }}><Plus aria-hidden="true"/>{t(product.in_stock ? "Add to cart" : "Out of stock")}</Button>;
}

export function StoreProductCard({ product }: { product: StoreProduct }) {
  const { t, money } = useLocale();
  return <Card className="store-product-card group flex h-full flex-col overflow-hidden p-0 sm:p-0">
    <Link href={`/shop/${product.id}`} aria-label={t("View {name}", { name: product.name })} className="block overflow-hidden">
      <ProductMedia name={product.name} category={product.category?.name} src={product.image_url} fit="cover"/>
    </Link>
    <div className="flex flex-1 flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><p className="min-w-0 truncate text-sm text-slate-500 dark:text-slate-400">{product.category?.name}</p><Badge tone={product.in_stock ? "green" : "slate"}>{t(product.in_stock ? "In stock" : "Sold out")}</Badge></div>
      <Link href={`/shop/${product.id}`} className="line-clamp-2 text-base font-semibold leading-relaxed hover:text-indigo-600 dark:hover:text-indigo-300">{product.name}</Link>
      <p className="text-base font-semibold tabular-nums"><bdi>{money(product.price_minor)}</bdi></p>
      <div className="mt-auto pt-1"><AddToCart product={product}/></div>
    </div>
  </Card>;
}
