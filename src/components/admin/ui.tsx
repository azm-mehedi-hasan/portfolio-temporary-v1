"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import { twMerge } from "tailwind-merge";

/** Shared admin primitives. Deliberately small — Tailwind does the rest. */

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md";
  }
>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={twMerge(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900",
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-4 py-2 text-sm",
        variant === "primary" && "bg-neutral-900 text-white hover:bg-neutral-700",
        variant === "secondary" &&
          "bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        variant === "ghost" && "text-neutral-600 hover:bg-neutral-100",
        className
      )}
      {...props}
    />
  );
});

export function SubmitButton({
  children = "Save",
  pendingText = "Saving...",
  ...props
}: React.ComponentProps<typeof Button> & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending && (
        <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
      )}
      {pending ? pendingText : children}
    </Button>
  );
}

const fieldStyles =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent disabled:bg-neutral-50";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={twMerge(fieldStyles, className)} {...props} />;
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={twMerge(fieldStyles, "font-mono text-[13px] leading-relaxed", className)}
      {...props}
    />
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, ...props }, ref) {
  return <select ref={ref} className={twMerge(fieldStyles, className)} {...props} />;
});

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={twMerge("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      {children}
      {hint && !error && <span className="text-xs text-neutral-500">{hint}</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}

/**
 * Like Field, but renders a heading instead of a <label>.
 *
 * Use this whenever the content is not a single form control: a <label> takes
 * its accessible name from *all* descendant text, so wrapping a rich editor
 * would name its textarea after every toolbar button inside it.
 */
export function FieldGroup({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={twMerge("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      {children}
      {hint && <span className="text-xs text-neutral-500">{hint}</span>}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        "rounded-lg border border-neutral-200 bg-white shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatusPill({ status }: { status: "DRAFT" | "PUBLISHED" }) {
  return (
    <span
      className={twMerge(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        status === "PUBLISHED"
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
      )}
    >
      {status === "PUBLISHED" ? "Published" : "Draft"}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
      <p className="font-medium text-neutral-800">{title}</p>
      <p className="max-w-sm text-sm text-neutral-500">{description}</p>
      {action}
    </div>
  );
}
