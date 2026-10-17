import { notFound } from "next/navigation";
import { StorePostEditor } from "@/components/storefront-admin";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) < 1) notFound();
  return <StorePostEditor id={Number(id)}/>;
}
