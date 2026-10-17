import { AppShell } from "@/components/app-shell";
import { cookies } from "next/headers";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collapsed = (await cookies()).get("naser-sidebar")?.value === "collapsed";
  return <AppShell initialCollapsed={collapsed}>{children}</AppShell>;
}
