import type { ReactNode } from "react";

/** Titled card wrapper used by every settings panel. */
export function SettingsCard({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h3 className="font-[var(--font-display)] font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

/** Labelled input row (label beside field) used inside settings panels. */
export function SettingField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="grid gap-1.5 sm:grid-cols-[200px_1fr] sm:items-center sm:gap-4">
      <span className="text-sm font-medium">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-border bg-input-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
    </label>
  );
}
