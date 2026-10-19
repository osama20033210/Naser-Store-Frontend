"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { ErrorState, PageHeading } from "@/components/data";
import { ProductMedia } from "@/components/product-media";
import { Button, Card, Empty, Loading, Pagination } from "@/components/ui";
import { useListFilter } from "@/components/use-list-filters";
import { api } from "@/lib/api";
import { brand } from "@/lib/brand";
import type { StorefrontSettings, StorePost } from "@/lib/storefront-content";
import type { Page, Resource } from "@/lib/types";

export function useStorefrontSettings() {
  return useQuery({ queryKey: ["store", "settings"], queryFn: ({ signal }) => api<Resource<StorefrontSettings>>("/store/settings", { signal }), staleTime: 60000 });
}

export function StoreBlog() {
  const { t, locale, dateTime } = useLocale();
  const [pageText, setPage] = useListFilter("page", "1");
  const page = Math.max(1, Number(pageText) || 1);
  const query = useQuery({ queryKey: ["store", "posts", page], queryFn: ({ signal }) => api<Page<StorePost>>(`/store/posts?page=${page}`, { signal }) });
  return <><PageHeading title={t("Blog")} description={t("News and articles published by the store.")}/>{query.isLoading ? <Loading/> : query.isError ? <ErrorState error={query.error} retry={() => query.refetch()}/> : query.data?.data.length ? <><div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">{query.data.data.map(post => {
    const title = locale === "ar" ? post.title_ar || post.title_en : post.title_en;
    const excerpt = locale === "ar" ? post.excerpt_ar : post.excerpt_en;
    return <Card key={post.id} className="overflow-hidden p-0 sm:p-0"><Link href={`/blog/${post.slug}`} className="block">{post.image_url ? <ProductMedia name={title} src={post.image_url} fit="cover"/> : <div className="flex aspect-[16/9] items-center justify-center bg-orange-50 text-indigo-600 dark:bg-slate-950 dark:text-indigo-400"><BookOpen aria-hidden="true" className="size-8"/></div>}<div className="p-5">{post.published_at && <p className="mb-3 text-xs text-slate-500 dark:text-slate-400"><time dateTime={post.published_at}><bdi dir="ltr">{dateTime(post.published_at)}</bdi></time></p>}<h2 className="text-lg font-semibold leading-7">{title}</h2>{excerpt && <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{excerpt}</p>}<span className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-indigo-700 dark:text-indigo-300">{t("Read article")}</span></div></Link></Card>;
  })}</div>{query.data.meta.last_page > 1 && <div className="mt-6"><Pagination page={page} last={query.data.meta.last_page} onPage={value => setPage(String(value))}/></div>}</> : <Card><Empty title={t("No articles published yet")} detail={t("Published store updates will appear here.")}/></Card>}</>;
}

export function StoreArticle({ slug }: { slug: string }) {
  const { t, locale, setLocale, dateTime } = useLocale();
  const query = useQuery({ queryKey: ["store", "post", slug], queryFn: ({ signal }) => api<Resource<StorePost>>(`/store/posts/${encodeURIComponent(slug)}`, { signal }) });
  const post = query.data?.data;
  const title = locale === "ar" ? post?.title_ar || post?.title_en : post?.title_en;
  useEffect(() => { if (title) document.title = `${title} — ${brand.name}`; }, [title]);
  if (query.isLoading) return <Loading/>;
  if (query.isError) return <ErrorState error={query.error} retry={() => query.refetch()}/>;
  if (!post) return null;
  const body = locale === "ar" ? post.body_ar : post.body_en;
  return <article className="mx-auto max-w-3xl"><Link href="/blog" className="mb-6 inline-flex min-h-11 items-center text-sm font-medium text-indigo-700 dark:text-indigo-300">{t("Back to blog")}</Link><h1 className="text-2xl font-semibold leading-relaxed sm:text-3xl">{title}</h1>{post.published_at && <p className="mt-4 text-sm text-slate-500 dark:text-slate-400"><time dateTime={post.published_at}><bdi dir="ltr">{dateTime(post.published_at)}</bdi></time></p>}{post.image_url && <div className="my-7 overflow-hidden rounded-2xl"><ProductMedia name={title ?? ""} src={post.image_url}/></div>}{body ? <div className="mt-8 whitespace-pre-wrap break-words text-base leading-8">{body}</div> : <Card className="mt-7"><p className="text-sm leading-7">{t("This article is not available in this language yet.")}</p>{locale === "ar" && <Button type="button" variant="outline" className="mt-4" onClick={() => setLocale("en")}>{t("Read in English")}</Button>}</Card>}</article>;
}
