import { ShieldCheck } from "lucide-react";
import type { Center, TestType } from "../../components/data";
import { useI18n } from "../../lib/i18n";
import type { SelectedSlot } from "./types";
import { Row } from "./summary-row";

/** Sticky desktop summary of the current booking selection and price. */
export function SummaryPanel({
  center,
  tt,
  slot,
  persons,
  className = "",
}: {
  center: Center;
  tt: TestType | null;
  slot: SelectedSlot | null;
  persons: number;
  className?: string;
}) {
  const { t } = useI18n();
  const total = tt ? tt.price * persons : 0;
  const centerLabel = [center.address, center.city].filter(Boolean).join(", ") || "—";
  return (
    <aside className={`h-fit rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24 ${className}`}>
      <h3 className="font-[var(--font-display)] font-bold">{t("summary.title")}</h3>
      <dl className="mt-4 space-y-3 text-sm">
        <Row label={t("summary.testType")} value={tt ? tt.label : "—"} />
        <Row label={t("summary.appointment")} value={slot ? `${slot.date} · ${slot.time}` : "—"} />
        <Row label={t("summary.persons")} value={String(persons)} />
        <Row label={t("summary.center")} value={centerLabel} />
      </dl>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">{t("summary.total")}</span>
        <span className="font-[var(--font-display)] text-xl font-bold">{total === 0 ? t("summary.free") : `€${total}`}</span>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" /> {t("summary.secure")}
      </p>
    </aside>
  );
}
