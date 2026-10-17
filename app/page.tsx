import { StoreShell } from "@/components/store-shell";
import { StoreHome } from "@/components/store-home";
import { storeMetadata } from "@/lib/store-content";
export function generateMetadata() { return storeMetadata("Home"); }
export default function Home() {
  return <StoreShell><StoreHome/></StoreShell>;
}
