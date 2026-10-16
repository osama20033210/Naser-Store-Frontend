"use client";
import { useLocale } from "@/components/locale-provider";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Boxes, ChevronLeft, Eye, EyeOff, Inbox, X } from "lucide-react";
import {
  cloneElement,
  isValidElement,
  useId,
  useRef,
  useState,
  type ComponentProps,
} from "react";
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
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold leading-none transition [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500",
        destructive: "bg-rose-600 text-white hover:bg-rose-500",
        outline:
          "border border-slate-200 bg-transparent hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800",
        secondary:
          "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
        ghost: "hover:bg-slate-100 dark:hover:bg-slate-800",
        link: "text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-11 px-4",
        lg: "h-11 px-4",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  children,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
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
      dir={
        props.dir ??
        (["email", "tel", "number", "password"].includes(props.type ?? "")
          ? "ltr"
          : undefined)
      }
      className={cn(
        "h-11 min-w-0 w-full rounded-xl border border-slate-300 bg-white px-3 text-base sm:text-sm outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60 aria-invalid:border-rose-500 dark:border-slate-700 dark:bg-slate-950 dark:placeholder:text-slate-400",
        props.className,
      )}
    />
  );
}
/** Visibility is local UI state; the value/ref remain owned by the existing form. */
export function PasswordInput(props: ComponentProps<"input">) {
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        dir="ltr"
        className={cn("pe-12", props.className)}
      />
      <button
        type="button"
        aria-label={t(visible ? "Hide password" : "Show password")}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 end-0 grid w-11 place-items-center rounded-e-xl text-slate-500 dark:text-slate-400"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "select-control h-11 min-w-0 max-w-full w-full rounded-xl border border-slate-300 bg-white ps-3 pe-10 text-base sm:text-sm text-slate-900 shadow-sm outline-none transition-[border-color,box-shadow] hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-slate-300 aria-invalid:border-rose-500 aria-invalid:focus:ring-rose-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-500 dark:disabled:hover:border-slate-700",
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
        "min-h-28 w-full rounded-xl border border-slate-300 bg-white p-3 text-base sm:text-sm outline-none focus:border-indigo-500 aria-invalid:border-rose-500 dark:border-slate-700 dark:bg-slate-950",
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
    green:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    amber:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    red: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    indigo:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
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
  const control = isValidElement<ComponentProps<"input">>(children)
    ? children
    : null;
  const id = control?.props.id ?? generatedId;
  const describedBy = [
    control?.props["aria-describedby"],
    hint ? `${id}-hint` : null,
    error ? `${id}-error` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="grid min-w-0 gap-2 text-sm font-medium">
      <label htmlFor={id}>{t(label)}</label>
      {control
        ? cloneElement(control, {
            id,
            "aria-describedby": describedBy || undefined,
            "aria-invalid": Boolean(error),
          })
        : children}
      {hint && (
        <p
          id={`${id}-hint`}
          className="font-normal text-slate-600 dark:text-slate-400"
        >
          {t(hint)}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-sm text-rose-600 dark:text-rose-400"
        >
          {errorText(error)}
        </p>
      )}
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
        <Inbox
          aria-hidden="true"
          className="mx-auto mb-3 h-8 w-8 text-slate-400"
        />
        <p className="font-semibold">{t(title)}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t(detail)}
        </p>
      </div>
    </div>
  );
}
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800",
        className,
      )}
    />
  );
}

export function BoxesLoader({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("boxes-loader inline-grid h-12 w-12 shrink-0 place-items-center text-indigo-600 dark:text-indigo-400", className)}><Boxes className="h-full w-full" strokeWidth={1.5}/></span>;
}

export function Loading() {
  const { t } = useLocale();

  return (
    <div
      role="status"
      aria-label={t("Loading")}
      className="flex min-h-56 flex-col items-center justify-center gap-5 py-8"
    >
      <div className="grid h-20 w-20 place-items-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10"><BoxesLoader/></div>
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("Loading")}</span>
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
        <DialogPrimitive.Content
          onOpenAutoFocus={() => {
            returnFocus.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
          }}
          onCloseAutoFocus={(event) => {
            if (returnFocus.current?.isConnected) {
              event.preventDefault();
              returnFocus.current.focus();
            }
          }}
          className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[min(92vw,620px)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
        >
          <DialogPrimitive.Title className="text-lg font-bold">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {t("Review the information below before proceeding.")}{" "}
          </DialogPrimitive.Description>
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
  const { t, locale } = useLocale();
  const total = Math.max(last, 1);
  const format = new Intl.NumberFormat(locale);
  const numbers = (compact: boolean): (number | string)[] => {
    const pages = [...new Set([1, total, page, ...(compact ? [] : [page - 1, page + 1])])]
      .filter(value => value >= 1 && value <= total).sort((a, b) => a - b);
    return pages.flatMap((value, index) => index > 0 && value - pages[index - 1] > 1 ? [`gap-${value}`, value] : [value]);
  };

  return <nav aria-label={t("Pagination")} className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm dark:border-slate-800 sm:flex-row">
    <p className="shrink-0 text-slate-500 dark:text-slate-400">{t("Page")} <span className="font-semibold text-slate-900 dark:text-slate-100">{format.format(page)}</span> {t("of")} {format.format(total)}</p>
    <div className="flex items-center gap-1">
      <Button type="button" variant="outline" size="icon" aria-label={t("Previous")} title={t("Previous")} disabled={page <= 1} onClick={() => onPage(Math.min(page - 1, total))}><ChevronLeft aria-hidden="true" className="rtl:rotate-180"/></Button>
      {[true, false].map(compact => <div key={String(compact)} className={cn("items-center gap-1", compact ? "flex sm:hidden" : "hidden sm:flex")}>{numbers(compact).map(value => typeof value === "number" ? <Button key={value} type="button" size="icon" variant={value === page ? "default" : "ghost"} aria-current={value === page ? "page" : undefined} aria-label={t("Page {page}", {page:format.format(value)})} onClick={() => {if(value !== page)onPage(value)}} className="tabular-nums">{format.format(value)}</Button> : <span key={value} aria-hidden="true" className="w-4 text-center text-slate-400">…</span>)}</div>)}
      <Button type="button" variant="outline" size="icon" aria-label={t("Next")} title={t("Next")} disabled={page >= total} onClick={() => onPage(page + 1)}><ChevronLeft aria-hidden="true" className="ltr:rotate-180"/></Button>
    </div>
  </nav>;
}
