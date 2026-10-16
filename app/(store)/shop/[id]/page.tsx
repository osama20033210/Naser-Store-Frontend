"use client";


import { notFound, useParams } from "next/navigation";
import { StoreProductDetail } from "@/components/store-catalog";
export default function Page(){
  
const {id}=useParams<{id:string}>();if(!/^\d+$/.test(id))notFound();return <StoreProductDetail id={Number(id)}/>}
