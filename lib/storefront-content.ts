export type StorefrontSettings = {
  contact_email?: string | null; contact_phone?: string | null; contact_address?: string | null; contact_hours?: string | null;
  featured_product_id?: number | null;
  hero_title_en?: string | null; hero_title_ar?: string | null; hero_description_en?: string | null; hero_description_ar?: string | null;
  policy_text_en?: string | null; policy_text_ar?: string | null;
};
export type StorePost = {
  id: number; slug: string; title_en: string; title_ar: string | null;
  excerpt_en: string | null; excerpt_ar: string | null; body_en?: string; body_ar?: string | null;
  product_id: number | null; published: boolean; published_at: string | null; image_url?: string | null;
};

/** Scheduling fields represent Damascus wall time; the backend converts them to UTC. */
export function damascusLocal(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Damascus", numberingSystem: "latn", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function scheduleDisplay(value: string | null | undefined): string {
  const local = damascusLocal(value);
  if (!local) return "";
  const [date, time] = local.split("T");
  return `${date.split("-").reverse().join("/")} ${time}`;
}

export function parseSchedule(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4}) ([01]\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  if (!match || Number(match[3]) < 1) return null;
  const date = `${match[3]}-${match[2]}-${match[1]}`;
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return null;
  return `${date}T${match[4]}:${match[5]}`;
}
