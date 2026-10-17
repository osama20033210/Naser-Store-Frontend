import { StoreContact } from "@/components/store-information";
import { storeContact, storeMetadata } from "@/lib/store-content";

export function generateMetadata() { return storeMetadata("Contact"); }

export default function Page() {
  return <StoreContact contact={storeContact()}/>;
}
