export type User = {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  account_type: "staff" | "customer";
};
export type Category = {
  id: number;
  name: string;
  description?: string | null;
  products_count?: number;
};
export type Product = {
  id: number;
  category_id: number;
  sku: string;
  name: string;
  description?: string | null;
  price_minor: number;
  stock: number;
  low_stock_threshold: number;
  active: boolean;
  low_stock: boolean;
  category?: Category;
};
export type Customer = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  orders_count?: number;
};
export type OrderItem = {
  id: number;
  product_id: number;
  sku: string;
  name: string;
  quantity: number;
  unit_price_minor: number;
  subtotal_minor: number;
};
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "completed"
  | "cancelled";
export type Order = {
  id: number;
  number: string;
  customer_id: number;
  status: OrderStatus;
  subtotal_minor: number;
  discount_minor: number;
  total_minor: number;
  notes?: string | null;
  created_at: string;
  customer?: Customer;
  items?: OrderItem[];
  allowed_transitions: OrderStatus[];
  channel?: "staff" | "storefront";
  payment_method?: "cash_on_delivery" | null;
  payment_status?: "unpaid" | "paid" | null;
  paid_at?: string | null;
  shipping?: { name: string; phone: string; address: string } | null;
};
export type Movement = {
  id: number;
  product_id: number;
  order_id?: number | null;
  quantity_change: number;
  stock_after: number;
  reason: string;
  created_at: string;
  product?: Product;
  actor?: { id: number; name: string };
};
export type Page<T> = {
  data: T[];
  links: unknown;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};
export type Resource<T> = { data: T };
export type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
};
