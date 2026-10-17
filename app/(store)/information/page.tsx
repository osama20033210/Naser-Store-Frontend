import { StoreInformation } from "@/components/store-information";
import { storeMetadata } from "@/lib/store-content";

export function generateMetadata() { return storeMetadata("Ordering & payment"); }

export default function Page() { return <StoreInformation/>; }
