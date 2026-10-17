import { StoreBlog } from "@/components/store-content";
import { storeMetadata } from "@/lib/store-content";
export function generateMetadata() { return storeMetadata("Journal"); }
export default function Page() { return <StoreBlog/>; }
