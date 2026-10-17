import { StorePolicies } from "@/components/store-information";
import { storeMetadata } from "@/lib/store-content";

export function generateMetadata() { return storeMetadata("Store policies"); }

export default function Page() {
  return <StorePolicies english={process.env.STORE_POLICY_TEXT_EN?.trim() || null} arabic={process.env.STORE_POLICY_TEXT_AR?.trim() || null}/>;
}
