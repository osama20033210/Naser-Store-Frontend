"use client";
import { useLocale, LanguageSwitcher } from "@/components/locale-provider";
import { ThemeToggle } from "@/components/theme-provider";


import { zodResolver } from "@hookform/resolvers/zod";
import { Boxes, LoaderCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/components/providers";
import { Button, Field, Input } from "@/components/ui";
import { brand } from "@/lib/brand";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type Values = z.infer<typeof schema>;
export default function LoginPage() {
  const { t, errorText } = useLocale();

  const auth = useAuth(),
    router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });
  useEffect(() => {
    if (auth.user) {
      const returnTo = new URLSearchParams(window.location.search).get("returnTo");
      const customerPath = returnTo === "/checkout" ? "/checkout" : "/account/orders";
      router.replace(auth.user.account_type === "customer" ? customerPath : "/dashboard");
    }
  }, [auth.user, router]);
  const submit = handleSubmit(async (values) => {
    try {
      await auth.login(values.email, values.password);
    } catch (error) {
      toast.error(errorText(error instanceof Error ? error.message : t("Sign in failed")));
    }
  });
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_.9fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_25%_20%,#4f46e5,transparent_35%),radial-gradient(circle_at_80%_75%,#0891b2,transparent_30%)]" />
        <div className="relative flex items-center gap-3 text-xl font-bold">
          <span className="rounded-xl bg-white/10 p-2">
            <Boxes />
          </span>
          {brand.name}
        </div>
        <div className="relative max-w-lg">
          <p className="text-5xl font-black leading-tight">
            {t("Every order.")} <br />
            {t("Every movement.")} <br />
            <span className="text-indigo-300">{t("Under control.")}</span>
          </p>
          <p className="mt-6 text-lg text-slate-300">
            {t("A secure operations workspace for teams that care about inventory accuracy.")} </p>
        </div>
        <p className="relative flex items-center gap-2 text-sm text-slate-400">
          <ShieldCheck className="h-4 w-4" /> {t("Secure cookie authentication · role based access")} </p>
      </section>
      <section className="grid place-items-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm">
          <div className="mb-6 flex justify-end gap-2"><LanguageSwitcher/><ThemeToggle/></div>
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2 text-xl font-bold">
              <Boxes className="text-indigo-600 dark:text-indigo-400" /> {brand.name}
            </div>
          </div>
          <p className="text-sm font-semibold uppercase tracking-[.2em] text-indigo-600 dark:text-indigo-400">
            {t("Operations portal")} </p>
          <h1 className="mt-2 text-3xl font-black">{t("Welcome back")}</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t("Sign in to manage your orders or access your team workspace.")} </p>
          <div className="mt-8 grid gap-5">
            <Field label={t("Email")} error={errors.email?.message}>
              <Input
                type="email"
                autoComplete="username"
                {...register("email")}
              />
            </Field>
            <Field label={t("Password")} error={errors.password?.message}>
              <Input
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
            </Field>
            <Button disabled={isSubmitting}>
              {isSubmitting && (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              )}
              {t("Sign in")} </Button>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">{t("New customer?")} <Link href="/register" className="font-semibold text-indigo-600 dark:text-indigo-400">{t("Create an account")}</Link></p>
            <Link href="/shop" className="text-center text-sm text-indigo-600 dark:text-indigo-400">{t("Continue browsing the store")}</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
