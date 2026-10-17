"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useLocale } from "@/components/locale-provider";
import { DataTable, ErrorState, Lookup, PageHeading, RequirePermission } from "@/components/data";
import { Badge, Button, Card, Dialog, Field, Input, Loading, Pagination, Select, Textarea } from "@/components/ui";
import { useListFilter } from "@/components/use-list-filters";
import { api, ApiError } from "@/lib/api";
import { decimalToMinor, minorToDecimal } from "@/lib/money";
import { scheduleDisplay, parseSchedule, type StorefrontSettings, type StorePost } from "@/lib/storefront-content";
import type { Page, Product, Resource } from "@/lib/types";

export function StorefrontAdmin() {
  const { t } = useLocale();
  const [tab, setTab] = useListFilter("tab", "settings");
  return <RequirePermission permission="storefront.manage"><PageHeading title={t("Storefront content")} description={t("Manage real store content, scheduled offers and published articles.")}/>
    <div className="segmented-control mb-6 flex-wrap">{["settings", "offers", "articles"].map(value => <Button key={value} type="button" variant="ghost" aria-pressed={tab === value} onClick={() => setTab(value)}>{t(value === "settings" ? "Store settings" : value === "offers" ? "Scheduled offers" : "Articles")}</Button>)}</div>
    {tab === "offers" ? <PromotionEditor/> : tab === "articles" ? <PostList/> : <SettingsEditor/>}
  </RequirePermission>;
}

function SettingsEditor() {
  const { t, errorText } = useLocale(), client = useQueryClient();
  const query = useQuery({ queryKey: ["storefront", "settings"], queryFn: ({ signal }) => api<Resource<StorefrontSettings>>("/storefront/settings", { signal }), refetchOnWindowFocus: false });
  const fields: [keyof StorefrontSettings, string, string?][] = [["contact_email", "Email", "email"], ["contact_phone", "Phone", "tel"], ["contact_address", "Address", "textarea"], ["contact_hours", "Opening hours"], ["hero_title_en", "Hero heading (English)"], ["hero_title_ar", "Hero heading (Arabic)"], ["hero_description_en", "Hero description (English)", "textarea"], ["hero_description_ar", "Hero description (Arabic)", "textarea"], ["policy_text_en", "Policies (English)", "textarea"], ["policy_text_ar", "Policies (Arabic)", "textarea"]];
  const values = Object.fromEntries(fields.map(([key]) => [key, query.data?.data[key] == null ? "" : String(query.data.data[key])]));
  values.featured_product_id = String(query.data?.data.featured_product_id ?? "");
  const form = useForm<Record<string, string>>({ values });
  if (query.isLoading) return <Loading/>;
  if (query.isError) return <ErrorState error={query.error} retry={() => query.refetch()}/>;
  return <form className="grid max-w-5xl gap-5" onSubmit={form.handleSubmit(async values => {
    const body = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, key === "featured_product_id" ? Number(value) || null : value.trim() || null]));
    try { await api("/storefront/settings", { method: "PUT", body: JSON.stringify(body) }); await client.invalidateQueries({ queryKey: ["storefront", "settings"] }); await client.invalidateQueries({ queryKey: ["store", "settings"] }); toast.success(t("Store settings saved")); }
    catch (error) { if (error instanceof ApiError) Object.entries(error.body.errors ?? {}).forEach(([key, messages]) => form.setError(key, { message: messages[0] })); toast.error(errorText((error as Error).message)); }
  })}>
    <Card><h2 className="mb-5 text-lg font-semibold">{t("Contact & opening hours")}</h2><div className="grid items-start gap-5 sm:grid-cols-2">{fields.slice(0,4).map(([key,label,type]) => <Field key={key} label={t(label)} error={form.formState.errors[key]?.message}>{type === "textarea" ? <Textarea {...form.register(key)}/> : <Input type={type ?? "text"} {...form.register(key)}/>}</Field>)}</div></Card>
    <Card><h2 className="mb-5 text-lg font-semibold">{t("Homepage content")}</h2><div className="grid items-start gap-5 sm:grid-cols-2">{fields.slice(4,8).map(([key,label,type]) => <Field key={key} label={t(label)} error={form.formState.errors[key]?.message}>{type === "textarea" ? <Textarea dir={key.endsWith("_ar") ? "rtl" : "ltr"} {...form.register(key)}/> : <Input dir={key.endsWith("_ar") ? "rtl" : "ltr"} {...form.register(key)}/>}</Field>)}</div><div className="mt-5"><Lookup activeOnly resource="products" value={Number(form.watch("featured_product_id")) || 0} label={t("Featured product (optional)")} onChange={id => form.setValue("featured_product_id", String(id))}/><Button type="button" variant="ghost" onClick={() => form.setValue("featured_product_id", "")}>{t("Use latest available product")}</Button></div></Card>
    <Card><h2 className="mb-3 text-lg font-semibold">{t("Store policies")}</h2><p className="mb-5 text-sm leading-7 text-slate-500 dark:text-slate-400">{t("Publish your approved privacy, returns and delivery terms. Plain text only.")}</p><div className="grid items-start gap-5 sm:grid-cols-2">{fields.slice(8).map(([key,label]) => <Field key={key} label={t(label)} error={form.formState.errors[key]?.message}><Textarea className="min-h-64" dir={key.endsWith("_ar") ? "rtl" : "ltr"} {...form.register(key)}/></Field>)}</div></Card>
    <Button disabled={form.formState.isSubmitting} className="justify-self-start">{t(form.formState.isSubmitting ? "Saving…" : "Save changes")}</Button>
  </form>;
}

function PromotionEditor() {
  const { t } = useLocale();
  const [id, setId] = useState(0);
  const query = useQuery({ queryKey: ["products", id], queryFn: ({ signal }) => api<Resource<Product>>(`/products/${id}`, { signal }), enabled: id > 0 });
  return <div className="grid max-w-3xl gap-5"><Card><Lookup activeOnly resource="products" value={id} onChange={setId} label={t("Choose a product")}/></Card>{query.isLoading ? <Loading/> : query.isError ? <ErrorState error={query.error} retry={() => query.refetch()}/> : query.data ? <PromotionForm key={id} product={query.data.data}/> : <p className="text-sm text-slate-500 dark:text-slate-400">{t("Select a product to schedule or remove its offer.")}</p>}</div>;
}

function PromotionForm({ product }: { product: Product }) {
  const { t, money, errorText, dateTime } = useLocale(), client = useQueryClient();
  const [remove, setRemove] = useState(false), [removing, setRemoving] = useState(false);
  const form = useForm({ values: { price: product.sale_price_minor == null ? "" : minorToDecimal(product.sale_price_minor), starts: scheduleDisplay(product.sale_starts_at), ends: scheduleDisplay(product.sale_ends_at) } });
  const save = async (body: object) => { await api(`/storefront/products/${product.id}/promotion`, { method: "PUT", body: JSON.stringify(body) }); await client.invalidateQueries({ queryKey: ["products", product.id] }); await client.invalidateQueries({ queryKey: ["store"] }); toast.success(t("Offer saved")); };
  return <Card><h2 className="text-lg font-semibold">{product.name}</h2><p className="mb-5 mt-2 text-sm text-slate-500 dark:text-slate-400">{t("Regular price")}: <bdi>{money(product.price_minor)}</bdi></p><form className="grid gap-5" onSubmit={form.handleSubmit(async values => {
    let price: number;
    try { price = decimalToMinor(values.price, 100000000); } catch (error) { form.setError("price", { message: errorText((error as Error).message) }); return; }
    if (price >= product.price_minor) { form.setError("price", { message: t("Sale price must be below the regular price.") }); return; }
    const starts = parseSchedule(values.starts), ends = parseSchedule(values.ends);
    if (!starts) { form.setError("starts", { message: t("Enter date and time as dd/mm/yyyy HH:mm.") }); return; }
    if (!ends) { form.setError("ends", { message: t("Enter date and time as dd/mm/yyyy HH:mm.") }); return; }
    if (ends <= starts) { form.setError("ends", { message: t("Offer end must be after its start.") }); return; }
    try { await save({ sale_price_minor: price, sale_starts_at: starts, sale_ends_at: ends }); } catch (error) { if (error instanceof ApiError) { const fields = { sale_price_minor: "price", sale_starts_at: "starts", sale_ends_at: "ends" } as const; Object.entries(error.body.errors ?? {}).forEach(([key, messages]) => { const field = fields[key as keyof typeof fields]; if (field) form.setError(field, { message: messages[0] }); }); } toast.error(errorText((error as Error).message)); }
  })}>
    <Field label={t("Sale price (USD)")} error={form.formState.errors.price?.message}><Input inputMode="decimal" dir="ltr" {...form.register("price", { required: true })}/></Field>
    <div className="grid items-start gap-4 sm:grid-cols-2"><Field label={t("Starts (Damascus)")} error={form.formState.errors.starts?.message}><Input dir="ltr" placeholder="dd/mm/yyyy HH:mm" maxLength={16} required {...form.register("starts")}/></Field><Field label={t("Ends (Damascus)")} error={form.formState.errors.ends?.message}><Input dir="ltr" placeholder="dd/mm/yyyy HH:mm" maxLength={16} required {...form.register("ends")}/></Field></div>
    <p className="text-sm leading-7 text-slate-500 dark:text-slate-400">{t("The offer applies automatically to new orders during this period. Existing orders keep their saved prices.")}</p>
    {product.sale_ends_at && <p className="text-sm text-slate-500">{t("Offer ends")}: <bdi dir="ltr">{dateTime(product.sale_ends_at)}</bdi></p>}
    <div className="flex flex-wrap gap-2"><Button disabled={form.formState.isSubmitting || removing}>{t("Save offer")}</Button>{product.sale_price_minor != null && <Button type="button" variant="outline" disabled={form.formState.isSubmitting || removing} onClick={() => setRemove(true)}>{t("Remove offer")}</Button>}</div>
  </form><Dialog open={remove} onOpenChange={open => { if (!removing) setRemove(open); }} title={t("Remove offer?")}><p className="text-sm text-slate-500">{t("New orders will use the regular product price.")}</p><div className="mt-5 flex justify-end gap-2"><Button type="button" variant="outline" disabled={removing} onClick={() => setRemove(false)}>{t("Cancel")}</Button><Button type="button" variant="destructive" disabled={removing} onClick={async () => { setRemoving(true); try { await save({ sale_price_minor: null, sale_starts_at: null, sale_ends_at: null }); setRemove(false); } catch (error) { toast.error(errorText((error as Error).message)); } finally { setRemoving(false); } }}>{t("Remove offer")}</Button></div></Dialog></Card>;
}

function PostList() {
  const { t, locale, dateTime } = useLocale();
  const [pageText, setPage] = useListFilter("post_page", "1"), [q, setQ] = useListFilter("post_q", "");
  const page = Math.max(1, Number(pageText) || 1);
  const query = useQuery({ queryKey: ["storefront", "posts", q, page], queryFn: ({ signal }) => api<Page<StorePost>>(`/storefront/posts?q=${encodeURIComponent(q)}&page=${page}`, { signal }) });
  return <Card><div className="mb-5 flex flex-wrap gap-3"><Input className="max-w-sm" type="search" maxLength={100} aria-label={t("Search articles")} placeholder={t("Search articles")} value={q} onChange={event => { setQ(event.target.value); setPage("1"); }}/><Button asChild className="ms-auto"><Link href="/dashboard/storefront/posts/new">{t("New article")}</Link></Button></div>{query.isLoading ? <Loading/> : query.isError ? <ErrorState error={query.error} retry={() => query.refetch()}/> : <><DataTable rows={query.data?.data ?? []} columns={[{ label: t("Title"), render: post => <Link className="font-medium text-indigo-600 dark:text-indigo-400" href={`/dashboard/storefront/posts/${post.id}`}>{locale === "ar" ? post.title_ar || post.title_en : post.title_en}</Link> }, { label: t("Status"), render: post => <Badge tone={post.published ? "green" : "slate"}>{t(post.published ? "Published / scheduled" : "Draft")}</Badge> }, { label: t("Publish date"), render: post => post.published_at ? <bdi dir="ltr">{dateTime(post.published_at)}</bdi> : "—" }]}/><Pagination page={page} last={query.data?.meta.last_page ?? 1} onPage={value => setPage(String(value))}/></>}</Card>;
}

export function StorePostEditor({ id }: { id?: number }) { return <RequirePermission permission="storefront.manage"><PostEditor id={id}/></RequirePermission>; }
function PostEditor({ id }: { id?: number }) {
  const { t, errorText } = useLocale(), router = useRouter(), client = useQueryClient();
  const [confirm, setConfirm] = useState(false), [deleting, setDeleting] = useState(false);
  const query = useQuery({ queryKey: ["storefront", "post", id], queryFn: ({ signal }) => api<Resource<StorePost>>(`/storefront/posts/${id}`, { signal }), enabled: Boolean(id), refetchOnWindowFocus: false });
  const post = query.data?.data;
  const form = useForm({ values: { slug: post?.slug ?? "", title_en: post?.title_en ?? "", title_ar: post?.title_ar ?? "", excerpt_en: post?.excerpt_en ?? "", excerpt_ar: post?.excerpt_ar ?? "", body_en: post?.body_en ?? "", body_ar: post?.body_ar ?? "", product_id: String(post?.product_id ?? ""), published: post?.published ? "true" : "false", published_at: scheduleDisplay(post?.published_at) } });
  if (id && query.isLoading) return <Loading/>;
  if (query.isError) return <ErrorState error={query.error} retry={() => query.refetch()}/>;
  return <><PageHeading title={t(id ? "Edit article" : "New article")} description={t("Write approved content in each language. Articles use plain text, not HTML.")}/><form className="grid max-w-5xl gap-5" onSubmit={form.handleSubmit(async values => {
    const publication = values.published_at ? parseSchedule(values.published_at) : null;
    if (values.published_at && !publication) { form.setError("published_at", { message: t("Enter date and time as dd/mm/yyyy HH:mm.") }); return; }
    const body = { ...values, product_id: Number(values.product_id) || null, published: values.published === "true", published_at: publication, title_ar: values.title_ar || null, excerpt_ar: values.excerpt_ar || null, body_ar: values.body_ar || null };
    try { await api(`/storefront/posts${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", body: JSON.stringify(body) }); await client.invalidateQueries({ queryKey: ["storefront", "posts"] }); await client.invalidateQueries({ queryKey: ["store", "posts"] }); toast.success(t("Article saved")); router.push("/dashboard/storefront?tab=articles"); }
    catch (error) { if (error instanceof ApiError) Object.entries(error.body.errors ?? {}).forEach(([key,messages]) => form.setError(key as keyof typeof values, { message: messages[0] })); toast.error(errorText((error as Error).message)); }
  })}>
    <Card><div className="grid items-start gap-5 sm:grid-cols-2"><Field label={t("Article URL slug")} error={form.formState.errors.slug?.message}><Input dir="ltr" maxLength={160} pattern="[a-z0-9]+(-[a-z0-9]+)*" required {...form.register("slug")}/></Field><Field label={t("Status")}><Select {...form.register("published")}><option value="false">{t("Draft")}</option><option value="true">{t("Published / scheduled")}</option></Select></Field><Field label={t("Publish date (Damascus)")} error={form.formState.errors.published_at?.message}><Input dir="ltr" placeholder="dd/mm/yyyy HH:mm" maxLength={16} required={form.watch("published") === "true"} {...form.register("published_at")}/></Field><div><Lookup resource="products" activeOnly value={Number(form.watch("product_id")) || 0} label={t("Illustration from product (optional)")} onChange={value => form.setValue("product_id", String(value))}/><Button type="button" variant="ghost" onClick={() => form.setValue("product_id", "")}>{t("Without illustration")}</Button></div></div></Card>
    {(["en", "ar"] as const).map(language => <Card key={language}><h2 className="mb-5 text-lg font-semibold">{t(language === "ar" ? "Arabic content" : "English content")}</h2><div className="grid gap-5"><Field label={t("Title")} error={form.formState.errors[`title_${language}`]?.message}><Input dir={language === "ar" ? "rtl" : "ltr"} required={language === "en"} maxLength={255} {...form.register(`title_${language}`)}/></Field><Field label={t("Excerpt")} error={form.formState.errors[`excerpt_${language}`]?.message}><Textarea dir={language === "ar" ? "rtl" : "ltr"} maxLength={500} {...form.register(`excerpt_${language}`)}/></Field><Field label={t("Article text")} error={form.formState.errors[`body_${language}`]?.message}><Textarea className="min-h-80" dir={language === "ar" ? "rtl" : "ltr"} required={language === "en"} maxLength={50000} {...form.register(`body_${language}`)}/></Field></div></Card>)}
    <div className="flex flex-wrap gap-3"><Button disabled={form.formState.isSubmitting || deleting}>{t("Save article")}</Button><Button asChild variant="outline"><Link href="/dashboard/storefront?tab=articles">{t("Cancel")}</Link></Button>{id && <Button type="button" variant="destructive" disabled={deleting || form.formState.isSubmitting} onClick={() => setConfirm(true)}>{t("Delete article")}</Button>}</div>
  </form><Dialog open={confirm} onOpenChange={open => { if (!deleting) setConfirm(open); }} title={t("Delete article?")}><p className="text-sm text-slate-500">{t("Deletion is permanent.")}</p><div className="mt-5 flex justify-end gap-2"><Button variant="outline" disabled={deleting} onClick={() => setConfirm(false)}>{t("Cancel")}</Button><Button variant="destructive" disabled={deleting} onClick={async () => { setDeleting(true); try { await api(`/storefront/posts/${id}`, { method: "DELETE" }); await client.invalidateQueries({ queryKey: ["storefront", "posts"] }); await client.invalidateQueries({ queryKey: ["store", "posts"] }); router.push("/dashboard/storefront?tab=articles"); } catch (error) { toast.error(errorText((error as Error).message)); } finally { setDeleting(false); } }}>{t("Delete")}</Button></div></Dialog></>;
}
