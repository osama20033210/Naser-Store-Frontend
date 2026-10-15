"use client";
import { Button } from "@/components/ui";
export default function Error({reset}:{reset:()=>void}){return <div className="p-8"><h2 className="text-xl font-bold">Unable to display this page</h2><p className="my-4 text-sm text-slate-500">Please try again. If the problem continues, contact your administrator.</p><Button onClick={reset}>Try again</Button></div>}
