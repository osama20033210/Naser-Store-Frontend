"use client";
import { useLocale } from "@/components/locale-provider";


import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";
import { PageHeading } from "@/components/data";
import { Badge, Button, Card, Field, Input } from "@/components/ui";
import { api } from "@/lib/api";

export default function Settings(){
  const { t, errorText } = useLocale();
const auth=useAuth();const {register,handleSubmit,formState:{isSubmitting,errors}}=useForm<{name:string}>({values:{name:auth.user?.name??""}});return <><PageHeading title={t("Account settings")} description={t("Your profile and assigned access.")}/><div className="grid items-start gap-6 lg:grid-cols-2"><Card><h2 className="mb-5 font-bold">{t("Profile")}</h2><form className="grid gap-5" onSubmit={handleSubmit(async values=>{try{await api("/auth/profile",{method:"PATCH",body:JSON.stringify(values)});await auth.refreshUser();toast.success(t("Profile updated"))}catch(error){toast.error(errorText(error instanceof Error?error.message:t("Profile update failed")))}})}><Field label={t("Name")} error={errors.name?.message}><Input {...register("name",{required:"Name is required",maxLength:{value:255,message:"Maximum 255 characters"}})}/></Field><Field label={t("Email")}><Input type="email" value={auth.user?.email??""} readOnly/></Field><Button disabled={isSubmitting}>{isSubmitting?t("Saving…"):t("Save profile")}</Button></form></Card><Card><h2 className="font-bold">{t("Access")}</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t("Roles and permissions are assigned on the server.")}</p><h3 className="mt-5 mb-2 text-sm font-semibold">{t("Assigned roles")}</h3><div className="flex flex-wrap gap-2">{auth.user?.roles.map(role=><Badge key={role} tone="indigo">{t(String(role))}</Badge>)}</div><h3 className="mt-6 text-sm font-semibold">{t("Assigned permissions")}</h3><ul className="mt-3 grid gap-3 text-sm text-slate-500 sm:grid-cols-2 dark:text-slate-400">{auth.user?.permissions.map(permission=><li key={permission}>{t(String(permission))}</li>)}</ul></Card></div></>}
