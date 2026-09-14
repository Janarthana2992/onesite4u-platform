"use client";

import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useBlockEditing } from "@/components/blocks/context";

export { cn } from "@/lib/cn";

/* ---------------- Button ---------------- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "dark" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  full?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  full,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-[var(--r-btn)] font-semibold transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60";
  const sizes = {
    sm: "h-9 px-3 text-xs",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-[15px]",
  };
  const variants = {
    primary:
      "bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-lg shadow-brand-600/25 hover:shadow-brand-600/40 hover:brightness-110",
    secondary:
      "bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-200 dark:hover:bg-brand-500/25",
    outline:
      "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
    ghost: "text-slate-700 hover:bg-slate-100 dark:text-zinc-200 dark:hover:bg-zinc-800",
    dark: "bg-slate-900 text-white shadow-lg shadow-black/20 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300",
  };
  return (
    <button
      className={cn(base, sizes[size], variants[variant], full && "w-full", className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

export function IconBtn({
  children,
  label,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-all hover:bg-white/30 active:scale-90",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------------- Form ---------------- */

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-zinc-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500";

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputCls, "h-11", className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputCls, "py-2.5 resize-none", className)} {...rest} />;
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-brand-600" : "bg-slate-300 dark:bg-zinc-700",
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

/* ---------------- Layout ---------------- */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "os-card rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
  wide,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  wide?: boolean;
}) {
  const { editing, setProp } = useBlockEditing();

  if (editing) {
    return (
      <div className={cn("flex items-end justify-between gap-3", wide ? "mb-5" : "mb-3")}>
        <div className="min-w-0 flex-1">
          <InlineText
            value={title}
            onChange={(v) => setProp("title", v)}
            placeholder="Heading"
            className={cn("block font-bold tracking-tight", wide ? "text-2xl" : "text-lg")}
          />
          <InlineText
            value={subtitle ?? ""}
            onChange={(v) => setProp("subtitle", v)}
            placeholder="Add a subtitle"
            className={cn("block text-slate-500 dark:text-zinc-400", wide ? "text-sm" : "text-xs")}
          />
        </div>
        {action}
      </div>
    );
  }

  return (
    <div className={cn("flex items-end justify-between", wide ? "mb-5" : "mb-3")}>
      <div>
        {wide && <span className="mb-2.5 block h-1 w-9 rounded-full bg-gradient-to-r from-brand-600 to-accent-500" />}
        <h2 className={cn("font-bold tracking-tight", wide ? "text-[26px] leading-tight" : "text-lg")}>{title}</h2>
        {subtitle && (
          <p className={cn("text-slate-500 dark:text-zinc-400", wide ? "text-sm" : "text-xs")}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

/**
 * Click-to-type text. Uncontrolled on purpose: React must not re-render the
 * node while the caret is inside it.
 */
export function InlineText({
  value,
  onChange,
  className,
  placeholder,
  multiline,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.textContent !== value) {
      el.textContent = value;
    }
  }, [value]);

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      tabIndex={0}
      data-placeholder={placeholder}
      onClick={(e) => e.stopPropagation()}
      onInput={(e) => onChange(e.currentTarget.textContent ?? "")}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
      }}
      className={cn(
        "os-inline cursor-text rounded-md outline-none transition-colors hover:bg-brand-500/10 focus:bg-brand-500/10 focus:ring-2 focus:ring-brand-500/50",
        className,
      )}
    />
  );
}

/* ---------------- Sheet (bottom modal) ---------------- */

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-slide-up dark:bg-zinc-900 sm:rounded-3xl"
      >
        <div className="relative flex items-center justify-between px-5 pb-3 pt-5">
          <span className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-slate-300 dark:bg-zinc-700 sm:hidden" />
          <h2 className="text-base font-bold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-8">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- Success ---------------- */

export function SuccessState({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <div className="relative mb-5">
        <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping [animation-iteration-count:2]" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30 animate-pop">
          <Check size={40} strokeWidth={3} />
        </div>
      </div>
      <h3 className="text-xl font-bold tracking-tight">{title}</h3>
      {description && (
        <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-zinc-400">{description}</p>
      )}
      {children && <div className="mt-6 w-full space-y-2">{children}</div>}
    </div>
  );
}

/* ---------------- Misc ---------------- */

export function useLocalToggle(initial = true) {
  const [on, setOn] = useState(initial);
  return [on, setOn] as const;
}
