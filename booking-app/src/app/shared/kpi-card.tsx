import type { ReactNode } from "react";

/** Metric card used across the admin dashboard, reports and directory views. */
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
