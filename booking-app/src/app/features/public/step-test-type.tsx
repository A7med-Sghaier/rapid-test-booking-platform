import { Check, Clock } from "lucide-react";
import type { TestType } from "../../components/data";
import { priceLabel } from "../../components/data";

/** Step 1 — pick a test type from the configured, active catalogue. */
export function StepTestType({
  testTypes,
  selected,
  onSelect,
}: {
  testTypes: TestType[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  if (testTypes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <div className="font-semibold">No test types configured</div>
        <p className="mt-1 text-sm text-muted-foreground">Add active test types in admin settings before accepting bookings.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {testTypes.map((t) => {
          const active = selected === t.id;
          return (
            <button
              key={t.id}
              disabled={!t.active}
              onClick={() => onSelect(t.id)}
              className={`relative rounded-2xl border p-5 text-left transition-all ${
                !t.active
                  ? "cursor-not-allowed border-border bg-secondary/40 opacity-60"
                  : active
                    ? "border-primary bg-card ring-2 ring-primary/30"
                    : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="font-semibold">{t.label}</span>
                {active && (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{t.description}</p>
              <div className="mt-4 flex items-center gap-3 text-sm">
                <span className="font-[var(--font-display)] font-bold text-primary">{priceLabel(t.price)}</span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> {t.durationMin < 60 ? `${t.durationMin} min` : `${t.durationMin / 60} h`}
                </span>
                {t.badge && (
                  <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-[color:var(--accent-foreground)]">
                    {t.badge}
                  </span>
                )}
                {!t.active && (
                  <span className="ml-auto rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-semibold text-[color:var(--danger)]">
                    Unavailable
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
