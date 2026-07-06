import type { ReactNode } from "react";

/** Inline alert row (icon + title + subtitle) with danger/warning/info tones. */
export function Alert({
  icon,
  tone,
  title,
  sub,
}: {
  icon: ReactNode;
  tone: "danger" | "warning" | "info";
  title: string;
  sub: string;
}) {
  const map = {
    danger: "bg-danger-soft text-[color:var(--danger)]",
    warning: "bg-warning-soft text-[color:var(--warning-foreground)]",
    info: "bg-info-soft text-info",
  };
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border p-3">
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${map[tone]}`}>{icon}</span>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}
