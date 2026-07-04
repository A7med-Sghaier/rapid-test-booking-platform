import { ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import type { AppointmentStatus, TestResult } from "./data";

// ---------------------------------------------------------------------------
// Modal — one accessible dialog for the whole app (ESC, scroll lock, focus,
// backdrop click, aria). Replaces the ~6 hand-rolled overlays.
// ---------------------------------------------------------------------------
export function Modal({
  title,
  onClose,
  children,
  footer,
  size = "md",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    const selector =
      'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && node) {
        const items = Array.from(node.querySelectorAll<HTMLElement>(selector)).filter(
          (el) => el.offsetParent !== null,
        );
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus the first field, falling back to the dialog container.
    const firstField = node?.querySelector<HTMLElement>(selector);
    (firstField ?? node)?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-border bg-card p-6 shadow-xl outline-none sm:rounded-3xl ${
          size === "lg" ? "max-w-2xl" : "max-w-md"
        }`}
      >
        <div className="mb-5 flex items-start justify-between">
          <h3 className="font-[var(--font-display)] text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Field — single labelled input used across every form.
// ---------------------------------------------------------------------------
let fieldSeq = 0;
export function Field({
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  required,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string | null;
}) {
  const id = useRef(`f${++fieldSeq}`).current;
  const invalid = !!error;
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {label} {required && <span className="text-[color:var(--danger)]">*</span>}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-err` : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`w-full rounded-xl border bg-input-background px-3 py-2.5 text-sm outline-none transition-shadow [color-scheme:light] focus:ring-2 ${
          invalid ? "border-[color:var(--danger)] focus:ring-[color:var(--danger)]/30" : "border-border focus:ring-primary/40"
        }`}
      />
      {invalid && (
        <span id={`${id}-err`} className="mt-1 block text-xs font-medium text-[color:var(--danger)]">
          {error}
        </span>
      )}
    </label>
  );
}

// Primary/secondary buttons for consistent modal footers.
export function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary">
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Brand mark
// ---------------------------------------------------------------------------
export function Logo({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <ShieldCheck className="h-5 w-5" strokeWidth={2.4} />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-white" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <div
            className={`font-[var(--font-display)] font-bold ${dark ? "text-white" : "text-foreground"}`}
            style={{ fontSize: "0.95rem" }}
          >
            Rapid Test
          </div>
          <div className={`text-[11px] ${dark ? "text-slate-400" : "text-muted-foreground"}`}>Test-center OS</div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status + result badges
// ---------------------------------------------------------------------------
const statusMap: Record<AppointmentStatus, { label: string; cls: string; dot: string }> = {
  waiting: { label: "Waiting", cls: "bg-info-soft text-info", dot: "bg-info" },
  "checked-in": { label: "Checked in", cls: "bg-violet-soft text-violet", dot: "bg-violet" },
  completed: { label: "Completed", cls: "bg-success-soft text-[color:var(--success)]", dot: "bg-success" },
  canceled: { label: "Canceled", cls: "bg-danger-soft text-[color:var(--danger)]", dot: "bg-[color:var(--danger)]" },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const s = statusMap[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

const resultMap: Record<TestResult, { label: string; cls: string }> = {
  negative: { label: "Negative", cls: "bg-success-soft text-[color:var(--success)] ring-1 ring-[color:var(--success)]/20" },
  positive: { label: "Positive", cls: "bg-danger-soft text-[color:var(--danger)] ring-1 ring-[color:var(--danger)]/25" },
  invalid: { label: "Invalid", cls: "bg-warning-soft text-[color:var(--warning-foreground)] ring-1 ring-[color:var(--warning)]/30" },
};

export function ResultBadge({ result }: { result: TestResult }) {
  const r = resultMap[result];
  return <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${r.cls}`}>{r.label}</span>;
}

// ---------------------------------------------------------------------------
// KPI card
// ---------------------------------------------------------------------------
export function KpiCard({
  label,
  value,
  delta,
  icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  icon?: ReactNode;
  tone?: "default" | "success" | "danger" | "violet" | "info";
}) {
  const toneCls: Record<string, string> = {
    default: "bg-secondary text-primary",
    success: "bg-success-soft text-[color:var(--success)]",
    danger: "bg-danger-soft text-[color:var(--danger)]",
    violet: "bg-violet-soft text-violet",
    info: "bg-info-soft text-info",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(16,24,40,0.06)]">
      <div className="flex items-start justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon && <span className={`grid h-9 w-9 place-items-center rounded-xl ${toneCls[tone]}`}>{icon}</span>}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="font-[var(--font-display)] text-3xl font-bold tracking-tight">{value}</span>
        {delta && <span className="mb-1 text-xs font-semibold text-[color:var(--success)]">{delta}</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trust badge (public)
// ---------------------------------------------------------------------------
export function TrustBadge({ icon, title, sub }: { icon: ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-[color:var(--accent-foreground)]">
        {icon}
      </span>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary">{icon}</span>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live indicator
// ---------------------------------------------------------------------------
export function LiveDot({ label = "Live" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-[color:var(--success)]">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
      </span>
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Segmented control
// ---------------------------------------------------------------------------
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-border bg-secondary/60 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o.label}
            {o.count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                  active ? "bg-primary text-primary-foreground" : "bg-border/60 text-muted-foreground"
                }`}
              >
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
