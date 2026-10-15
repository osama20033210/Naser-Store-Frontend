"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle, X } from "lucide-react";
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
      secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
      ghost: "hover:bg-slate-100 dark:hover:bg-slate-800",
      link: "text-indigo-600 underline-offset-4 hover:underline",
    },
    size: { default: "h-10 px-4", sm: "h-9 px-3", lg: "h-11 px-6", icon: "h-10 w-10" },
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
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900",
        props.className,
      )}
    />
  );
}
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900",
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
        "min-h-24 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900",
        props.className,
      )}
    />
  );
}
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900",
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
  const tones = {
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-rose-100 text-rose-700",
    indigo: "bg-indigo-100 text-indigo-700",
  };
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      <span>{label}</span>
      {children}
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </label>
  );
}
export function Empty({
  title = "Nothing here yet",
  detail = "Try changing the filters or add the first record.",
}: {
  title?: string;
  detail?: string;
}) {
  return (
    <div className="grid min-h-48 place-items-center text-center">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{detail}</p>
      </div>
    </div>
  );
}
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800", className)} />;
}

export function Loading() {
  return (
    <div role="status" aria-label="Loading" className="grid min-h-56 gap-5 py-6">
      <LoaderCircle
        className="h-7 w-7 animate-spin text-indigo-600"
        aria-label="Loading"
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
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(92vw,620px)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
          <DialogPrimitive.Title className="text-lg font-bold">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Review the information below before proceeding.
          </DialogPrimitive.Description>
          <DialogPrimitive.Close
            className="absolute right-4 top-4 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
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
  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
      <span>
        Page {page} of {Math.max(last, 1)}
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          className="h-9 bg-slate-100 text-slate-700 hover:bg-slate-200"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          className="h-9"
          disabled={page >= last}
          onClick={() => onPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
