"use client";


import { notFound, useParams } from "next/navigation";
import { CatalogForm, validModule } from "@/components/catalog";
export default function Page(){
  
const {module,id}=useParams<{module:string;id:string}>();if(!validModule(module)||!/^\d+$/.test(id))notFound();return <CatalogForm module={module} id={Number(id)}/>}
