"use client";
import { useLocale } from "@/components/locale-provider";


import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff, Inbox, LoaderCircle, X } from "lucide-react";
import { cloneElement, isValidElement, useId, useRef, useState, type ComponentProps } from "react";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

// Source-owned shadcn/ui Radix pattern, styled for this application's palette.
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 disabled:pointer-events-none disabled:opacity-50",
  { variants: {
    variant: {
      default: "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500",
      destructive: "bg-rose-600 text-white hover:bg-rose-500",
      outline: "border border-slate-200 bg-transparent hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800",
      secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
      ghost: "hover:bg-slate-100 dark:hover:bg-slate-800",
      link: "text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400",
    },
    size: { default: "h-11 px-4", sm: "h-9 px-3", lg: "h-12 px-6", icon: "h-11 w-11" },
  }, defaultVariants: { variant: "default", size: "default" } },
);

export function Button({
  className,
  children,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  

  const Component = asChild ? Slot : "button";
  return (
    <Component
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </Component>
  );
}
export function Input(props: ComponentProps<"input">) {
  

  return (
    <input
      {...props}
      dir={props.dir ?? (["email", "tel", "number", "password"].includes(props.type ?? "") ? "ltr" : undefined)}
      className={cn(
        "h-11 min-w-0 w-full rounded-xl border border-slate-300 bg-white px-3 text-base outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60 aria-invalid:border-rose-500 dark:border-slate-700 dark:bg-slate-950 dark:placeholder:text-slate-400",
        props.className,
      )}
    />
  );
}
/** Visibility is local UI state; the value/ref remain owned by the existing form. */
export function PasswordInput(props: ComponentProps<"input">) {
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);
  return <div className="relative"><Input {...props} type={visible ? "text" : "password"} dir="ltr" className={cn("pe-12", props.className)}/><button type="button" aria-label={t(visible ? "Hide password" : "Show password")} aria-pressed={visible} onClick={() => setVisible(v => !v)} className="absolute inset-y-0 end-0 grid w-11 place-items-center rounded-e-xl text-slate-500 dark:text-slate-400">{visible ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}</button></div>;
}
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  

  return (
    <select
      {...props}
      className={cn(
        "h-11 min-w-0 max-w-full w-full rounded-xl border border-slate-300 bg-white px-3 text-base outline-none focus:border-indigo-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950",
        props.className,
      )}
    />
  );
}
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  

  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 w-full rounded-xl border border-slate-300 bg-white p-3 text-base outline-none focus:border-indigo-500 aria-invalid:border-rose-500 dark:border-slate-700 dark:bg-slate-950",
        props.className,
      )}
    />
  );
}
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  

  return (
    <div
      className={cn(
        "min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6",
        className,
      )}
      {...props}
    />
  );
}
export function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "green" | "amber" | "red" | "indigo";
}) {
  const { t } = useLocale();

  const tones = {
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    red: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  };
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center self-start rounded-full px-2.5 py-1 text-xs font-semibold leading-normal",
        tones[tone],
      )}
    >
      {typeof children === "string" ? t(children) : children}
    </span>
  );
}
export function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  hint?: string;
}) {
  const { t, errorText } = useLocale();
  const generatedId = useId();
  const control = isValidElement<ComponentProps<"input">>(children) ? children : null;
  const id = control?.props.id ?? generatedId;
  const describedBy = [control?.props["aria-describedby"], hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ");

  return (
    <div className="grid min-w-0 gap-2 text-sm font-medium">
      <label htmlFor={id}>{t(label)}</label>
      {control ? cloneElement(control, { id, "aria-describedby": describedBy || undefined, "aria-invalid": Boolean(error) }) : children}
      {hint && <p id={`${id}-hint`} className="font-normal text-slate-600 dark:text-slate-400">{t(hint)}</p>}
      {error && <p id={`${id}-error`} role="alert" className="text-sm text-rose-600 dark:text-rose-400">{errorText(error)}</p>}
    </div>
  );
}
export function Empty({
  title = "Nothing here yet",
  detail = "Try changing the filters or add the first record.",
}: {
  title?: string;
  detail?: string;
}) {
  const { t } = useLocale();

  return (
    <div className="grid min-h-44 place-items-center px-3 py-6 text-center">
      <div>
        <Inbox aria-hidden="true" className="mx-auto mb-3 h-8 w-8 text-slate-400"/>
        <p className="font-semibold">{t(title)}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t(detail)}</p>
      </div>
    </div>
  );
}
export function Skeleton({ className }: { className?: string }) {
  

  return <div aria-hidden="true" className={cn("animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800", className)} />;
}

export function Loading() {
  const { t } = useLocale();

  return (
    <div role="status" aria-label={t("Loading")} className="grid min-h-56 gap-5 py-6">
      <LoaderCircle
        className="h-7 w-7 animate-spin text-indigo-600 dark:text-indigo-400"
        aria-label={t("Loading")}
      />
      <div className="grid gap-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
export function Dialog({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}) {
  const { t } = useLocale();
  const returnFocus = useRef<HTMLElement | null>(null);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm" />
        <DialogPrimitive.Content onOpenAutoFocus={() => { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }} onCloseAutoFocus={event => { if (returnFocus.current?.isConnected) { event.preventDefault(); returnFocus.current.focus(); } }} className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[min(92vw,620px)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
          <DialogPrimitive.Title className="text-lg font-bold">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {t("Review the information below before proceeding.")} </DialogPrimitive.Description>
          <DialogPrimitive.Close
            className="absolute end-3 top-3 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={t("Close")}
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
          <div className="mt-5">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
export function Pagination({
  page,
  last,
  onPage,
}: {
  page: number;
  last: number;
  onPage: (page: number) => void;
}) {
  const { t } = useLocale();

  return (
    <nav aria-label={t("Pagination")} className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
      <span>
        {t("Page")} {page} {t("of")} {Math.max(last, 1)}
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          className="h-9 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          {t("Previous")} </Button>
        <Button
          type="button"
          variant="secondary" className="h-9"
          disabled={page >= last}
          onClick={() => onPage(page + 1)}
        >
          {t("Next")} </Button>
      </div>
    </nav>
  );
}
