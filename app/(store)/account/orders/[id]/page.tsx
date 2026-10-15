"use client";
import { notFound, useParams } from "next/navigation";
import { StoreOrderDetail } from "@/components/store-account";
export default function Page(){const {id}=useParams<{id:string}>();if(!/^\d+$/.test(id))notFound();return <StoreOrderDetail id={Number(id)}/>}
