import { ShieldCheck } from "lucide-react";

/** Brand mark. `dark` inverts text for the sidebar; `compact` hides the wordmark. */
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
