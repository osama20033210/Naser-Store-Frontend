"use client";


import { notFound, useParams } from "next/navigation";
import { OrderDetail } from "@/components/orders";
export default function Page(){
  
const {id}=useParams<{id:string}>();if(!/^\d+$/.test(id))notFound();return <OrderDetail id={Number(id)}/>}
