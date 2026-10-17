import type { Category, OrderItem, OrderStatus } from "@/lib/types";

export type StoreProduct = {
  image_is_illustrative?: boolean;
  image_credit?: { author: string; source_url: string; license_url: string } | null;
  images?: { id: number; url: string }[];
  regular_price_minor?: number;
  promotion_ends_at?: string | null;
  price_changes_at?: string | null;
  image_url?: string | null;
  id:number; name:string; sku:string; description:string|null; price_minor:number;
  in_stock:boolean; max_order_quantity:number; category?:Category;
};
export type CartItem = {product_id:number; quantity:number};
export type CartQuote = {items:{product_id:number;quantity:number;available:boolean;product:StoreProduct|null;subtotal_minor:number|null}[];total_minor:number;can_checkout:boolean;currency:"USD"};
export type StoreProfile = {name:string;email:string;phone:string|null;address:string|null};
export type StoreOrder = {
  id:number;number:string;status:OrderStatus;created_at:string;subtotal_minor:number;discount_minor:number;total_minor:number;
  payment_method:"cash_on_delivery"|null;payment_status:"unpaid"|"paid"|null;
  shipping:{name:string;phone:string;address:string}|null;items?:OrderItem[];can_cancel:boolean;paid_at:string|null;
};
