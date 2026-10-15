"use client";
import Link from "next/link";
import { CustomerGate } from "@/components/store-shell";
export default function Layout({children}:{children:React.ReactNode}){return <CustomerGate><nav aria-label="Customer account" className="mb-7 flex gap-5 border-b border-slate-200 pb-4 text-sm font-semibold text-indigo-600"><Link href="/account/orders">My orders</Link><Link href="/account">Profile & delivery details</Link></nav>{children}</CustomerGate>}
