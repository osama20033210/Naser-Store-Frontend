"use client";


import { notFound, useParams } from "next/navigation";
import { CatalogForm, validModule } from "@/components/catalog";
export default function Page(){
  
const {module}=useParams<{module:string}>();if(!validModule(module))notFound();return <CatalogForm module={module}/>}
