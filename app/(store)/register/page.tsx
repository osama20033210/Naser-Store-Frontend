"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/components/providers";
import { Button, Card, Field, Input } from "@/components/ui";
import { ApiError } from "@/lib/api";

const schema=z.object({name:z.string().trim().min(1,"Name is required").max(255),email:z.string().email(),password:z.string().min(12).max(128).regex(/[A-Za-z]/,"Include letters").regex(/[0-9]/,"Include a number"),password_confirmation:z.string()}).refine(values=>values.password===values.password_confirmation,{path:["password_confirmation"],message:"Passwords must match"});
type Values=z.infer<typeof schema>;
export default function Register(){
 const auth=useAuth(),router=useRouter();
 const {register,handleSubmit,setError,formState:{errors,isSubmitting}}=useForm<Values>({resolver:zodResolver(schema)});
 useEffect(()=>{if(auth.user){const returnTo=new URLSearchParams(window.location.search).get("returnTo");router.replace(auth.user.account_type==="customer"?(returnTo==="/checkout"?"/checkout":"/account/orders"):"/dashboard")}},[auth.user,router]);
 return <Card className="mx-auto max-w-lg"><p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Customer account</p><h1 className="mt-2 text-3xl font-black">Make yourself at home</h1><p className="mb-6 mt-3 text-sm text-slate-500">Create an account to order and track deliveries.</p><form className="grid gap-4" onSubmit={handleSubmit(async values=>{try{await auth.register(values)}catch(error){if(error instanceof ApiError)Object.entries(error.body.errors??{}).forEach(([key,messages])=>setError(key as keyof Values,{message:messages[0]}));toast.error(error instanceof Error?error.message:"Registration failed")}})}><Field label="Full name" error={errors.name?.message}><Input autoComplete="name" {...register("name")}/></Field><Field label="Email" error={errors.email?.message}><Input type="email" autoComplete="email" {...register("email")}/></Field><Field label="Password" error={errors.password?.message}><Input type="password" autoComplete="new-password" {...register("password")}/></Field><p className="-mt-2 text-xs text-slate-500">At least 12 characters, including letters and numbers.</p><Field label="Confirm password" error={errors.password_confirmation?.message}><Input type="password" autoComplete="new-password" {...register("password_confirmation")}/></Field><Button disabled={isSubmitting}>{isSubmitting?"Creating account…":"Create account"}</Button><p className="text-center text-sm text-slate-500">Already registered? <Link href="/login?returnTo=/checkout" className="font-semibold text-indigo-600">Sign in</Link></p></form></Card>;
}
