import { CalendarCheck, Check, ChevronRight, Plus, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { Center, TestType } from "../../components/data";
import { useI18n } from "../../lib/i18n";
import type { SelectedSlot } from "./types";
import { Row } from "./summary-row";

/** Confirmation screen: QR ticket, booking summary and follow-up actions. */
export function DoneScreen({
  tt,
  slot,
  persons,
  bookingRef,
  bookingQr,
  center,
  onHome,
  onAnother,
}: {
  tt: TestType | null;
  slot: SelectedSlot | null;
  persons: number;
  bookingRef: string;
  bookingQr: string | null;
  center: Center;
  onHome: () => void;
  onAnother: () => void;
}) {
  const { t } = useI18n();
  const ref = bookingRef || "Booking confirmed";
  const verifyUrl = `${window.location.origin}/verify/${ref}`;
  const centerLabel = [center.address, center.city].filter(Boolean).join(", ") || "—";
  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <div className="rounded-3xl border border-border bg-card p-7 text-center shadow-sm">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-soft">
          <Check className="h-8 w-8 text-[color:var(--success)]" strokeWidth={2.5} />
        </div>
        <h1 className="mt-4 font-[var(--font-display)] text-2xl font-bold">{t("done.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("done.sub")}</p>

        <div className="mt-6 grid place-items-center rounded-2xl border border-border bg-secondary/40 p-6">
          <div className="grid place-items-center rounded-xl bg-white p-3 shadow-sm">
            {bookingQr ? <img src={bookingQr} alt="Booking QR code" className="h-[148px] w-[148px]" /> : <QRCodeSVG value={verifyUrl} size={148} level="M" />}
          </div>
          <div className="mt-3 font-[var(--font-display)] text-sm font-bold tracking-widest">{ref}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">{t("done.scan")}</div>
        </div>

        <dl className="mt-6 space-y-3 text-left text-sm">
          <Row label={t("summary.testType")} value={tt?.label ?? "—"} />
          <Row label={t("summary.appointment")} value={slot ? `${slot.date} · ${slot.time}` : "—"} />
          <Row label={t("summary.persons")} value={String(persons)} />
          <Row label={t("summary.center")} value={centerLabel} />
        </dl>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <QrCode className="h-4 w-4" /> {t("done.downloadQr")}
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-secondary">
            <CalendarCheck className="h-4 w-4" /> {t("done.addCal")}
          </button>
        </div>
        <div className="mt-2 flex items-center justify-center gap-4 text-sm">
          <button onClick={onAnother} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
            <Plus className="h-4 w-4" /> {t("done.another")}
          </button>
          <button onClick={onHome} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            {t("done.home")} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
