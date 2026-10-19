import { StoreBlog } from "@/components/store-content";
import { storeMetadata } from "@/lib/store-content";
export function generateMetadata() { return storeMetadata("Blog"); }
export default function Page() { return <StoreBlog/>; }
