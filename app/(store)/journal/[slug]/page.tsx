import { notFound } from "next/navigation";
import { StoreArticle } from "@/components/store-content";
import { storeMetadata } from "@/lib/store-content";
export function generateMetadata() { return storeMetadata("Journal"); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 160) notFound();
  return <StoreArticle slug={slug}/>;
}
