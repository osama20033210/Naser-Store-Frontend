import type { CartQuote } from "@/lib/store-types";

/** A refreshed quote must be reviewed again when payable values or requested availability change. */
export function quoteChanged(previous: CartQuote, next: CartQuote): boolean {
  const signature = (quote: CartQuote) => JSON.stringify({ total: quote.total_minor, lines: [...quote.items].sort((a, b) => a.product_id - b.product_id).map(line => [line.product_id, line.quantity, line.available, line.product?.price_minor, line.subtotal_minor]) });
  return signature(previous) !== signature(next);
}

/** Reuse only the same intent; browser storage is untrusted and contains no delivery data. */
export function savedCheckoutKey(saved: unknown, fingerprint: string): string | null {
  if (!saved || typeof saved !== "object") return null;
  const value = saved as Record<string, unknown>;
  return value.fingerprint === fingerprint && typeof value.key === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.key) ? value.key : null;
}
