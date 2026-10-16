import type { CartItem } from "@/lib/store-types";

/** Persist only bounded product identifiers and quantities; never prices or account data. */
export function parseCart(saved: unknown): CartItem[] {
  if (!Array.isArray(saved)) return [];
  const seen = new Set<number>();
  return saved.filter((item): item is CartItem => {
    if (!item || typeof item !== "object" || !Number.isSafeInteger(item.product_id) || item.product_id < 1 || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100000 || seen.has(item.product_id)) return false;
    seen.add(item.product_id); return true;
  }).slice(0, 100).map(({ product_id, quantity }) => ({ product_id, quantity }));
}

export function addCartItem(items: CartItem[], id: number, quantity: number, limit: number): { items: CartItem[]; added: boolean } {
  const found = items.find(item => item.product_id === id);
  if (!Number.isSafeInteger(id) || id < 1 || !Number.isInteger(quantity) || quantity < 1 || !Number.isInteger(limit) || quantity + (found?.quantity ?? 0) > Math.min(limit, 100000) || (!found && items.length >= 100)) return { items, added: false };
  return { items: found ? items.map(item => item.product_id === id ? { ...item, quantity: item.quantity + quantity } : item) : [...items, { product_id: id, quantity }], added: true };
}
