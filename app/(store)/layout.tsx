import { StoreShell } from "@/components/store-shell";
import { brand } from "@/lib/brand";
export const metadata={title:`${brand.name} — Shop`,description:"Browse products, order online, pay on delivery and track your orders."};
export default function Layout({children}:{children:React.ReactNode}){return <StoreShell>{children}</StoreShell>}
