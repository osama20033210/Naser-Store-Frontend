"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";
import { PageHeading } from "@/components/data";
import { Badge, Button, Card, Field, Input } from "@/components/ui";
import { api } from "@/lib/api";

export default function Settings(){const auth=useAuth();const {register,handleSubmit,formState:{isSubmitting,errors}}=useForm<{name:string}>({values:{name:auth.user?.name??""}});return <><PageHeading title="Account settings" description="Your profile and assigned access."/><div className="grid items-start gap-6 lg:grid-cols-2"><Card><h2 className="mb-5 font-bold">Profile</h2><form className="grid gap-5" onSubmit={handleSubmit(async values=>{try{await api("/auth/profile",{method:"PATCH",body:JSON.stringify(values)});await auth.refreshUser();toast.success("Profile updated")}catch(error){toast.error(error instanceof Error?error.message:"Profile update failed")}})}><Field label="Name" error={errors.name?.message}><Input {...register("name",{required:"Name is required",maxLength:{value:255,message:"Maximum 255 characters"}})}/></Field><Field label="Email"><Input value={auth.user?.email??""} readOnly/></Field><Button disabled={isSubmitting}>{isSubmitting?"Saving…":"Save profile"}</Button></form></Card><Card><h2 className="font-bold">Access</h2><p className="mt-2 text-sm text-slate-500">Roles and permissions are assigned on the server.</p><div className="mt-5 flex flex-wrap gap-2">{auth.user?.roles.map(role=><Badge key={role} tone="indigo">{role}</Badge>)}</div><ul className="mt-5 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">{auth.user?.permissions.map(permission=><li key={permission}>{permission}</li>)}</ul></Card></div></>}
