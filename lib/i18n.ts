import { arabic } from "@/lib/translations";

export type Locale = "ar" | "en";
export type TranslationValues = Record<string, string | number>;
export const LOCALE_COOKIE = "naser-store-language";

/** Reads only the UI language; authentication cookies remain inaccessible. */
export function currentLocale(): Locale {
  return typeof document !== "undefined" && document.documentElement.lang === "ar" ? "ar" : "en";
}

export function translate(locale: Locale, key: string, values: TranslationValues = {}): string {
  const text = locale === "ar" && Object.hasOwn(arabic, key) ? arabic[key] : key;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => String(values[name] ?? match));
}

/** Translates validation copy without changing backend field names or API contracts. */
export function translateError(locale: Locale, message: string): string {
  if (locale === "en" || Object.hasOwn(arabic, message)) return translate(locale, message);
  const fieldNames: Record<string, string> = {
    name: "الاسم", email: "البريد الإلكتروني", password: "كلمة المرور", password_confirmation: "تأكيد كلمة المرور",
    phone: "الهاتف", address: "العنوان", shipping_name: "اسم المستلم", shipping_phone: "هاتف المستلم", shipping_address: "عنوان التوصيل",
    notes: "الملاحظات", items: "المنتجات", quantity: "الكمية", quantity_change: "تغيير الكمية", reason: "السبب", sku: "رمز المنتج",
    price_minor: "السعر", category_id: "التصنيف", customer_id: "الزبون", low_stock_threshold: "حد انخفاض المخزون",
  };
  const match = message.match(/^The (.+?) field (.+)\.$/);
  if (match) {
    const normalizedField = match[1].replaceAll(" ", "_");
    const field = fieldNames[normalizedField] ?? fieldNames[normalizedField.split(".").at(-1) ?? ""] ?? "القيمة";
    const rule = match[2];
    if (rule === "is required") return `${field} مطلوب.`;
    if (rule === "must be a valid email address") return "عنوان البريد الإلكتروني غير صالح.";
    if (rule === "has already been taken") return `${field} مستخدم مسبقاً.`;
    if (rule === "confirmation does not match") return "تأكيد كلمة المرور غير مطابق.";
    if (rule === "must be an integer") return `${field} يجب أن يكون عدداً صحيحاً.`;
    if (rule === "is prohibited") return `${field} غير مسموح به.`;
    const min = rule.match(/^must be at least (\d+) characters$/);
    if (min) return `${field} يجب ألا يقل عن ${min[1]} محرفاً.`;
    const max = rule.match(/^must not be greater than (\d+) characters$/);
    if (max) return `${field} يجب ألا يزيد على ${max[1]} محرفاً.`;
    if (rule === "must contain at least one letter") return `${field} يجب أن يتضمن حرفاً واحداً على الأقل.`;
    if (rule === "must contain at least one number") return `${field} يجب أن يتضمن رقماً واحداً على الأقل.`;
    const numericMin = rule.match(/^must be at least (-?\d+)$/);
    if (numericMin) return `${field} يجب ألا يقل عن ${numericMin[1]}.`;
    const numericMax = rule.match(/^must not be greater than (-?\d+)$/);
    if (numericMax) return `${field} يجب ألا يزيد على ${numericMax[1]}.`;
    if (rule === "must be a string") return `${field} يجب أن يكون نصاً.`;
    if (rule === "has a duplicate value") return `${field} يتضمن قيمة مكررة.`;
    const minItems = rule.match(/^must have at least (\d+) items$/);
    if (minItems) return `${field} يجب أن يتضمن ${minItems[1]} عنصراً على الأقل.`;
    const maxItems = rule.match(/^must not have more than (\d+) items$/);
    if (maxItems) return `${field} يجب ألا يتجاوز ${maxItems[1]} عنصراً.`;
  }
  if (/^The selected .+ is invalid\.$/.test(message)) return "القيمة المحددة غير صالحة. أعد اختيارها.";
  const stock = message.match(/^Invalid stock change for (.+)\.$/);
  if (stock) return translate(locale, "Invalid stock change for {sku}.", { sku: stock[1] });
  const zodNumber = message.match(/^Too (small|big): expected number to (?:be|have) ([<>]=?)(-?\d+)$/);
  if (zodNumber) return `يجب أن تكون القيمة ${zodNumber[1] === "small" ? "على الأقل" : "بحد أقصى"} ${zodNumber[3]}.`;
  if (/^Invalid input: expected (?:number|int)/.test(message)) return "أدخل عدداً صالحاً.";
  const summary = message.match(/^(.+) \(and \d+ more errors?\)$/);
  if (summary) return `${translateError(locale, summary[1])} ${translate(locale, "Please check the highlighted fields.")}`;
  return message;
}
