import { BadgeCheck, ShieldCheck, ShieldX } from "lucide-react";
import { testTypeById } from "./data";
import { ResultBadge } from "./primitives";
import { useFlux } from "../store/flux-store";

export function VerifyPage({ id, onHome }: { id: string; onHome: () => void }) {
  const { state } = useFlux();
  const record = state.appointments.find(
    (a) => a.certificateId?.toLowerCase() === id.toLowerCase() || a.ref.toLowerCase() === id.toLowerCase(),
  );
  const found = !!record;
  const hasResult = !!record && record.status === "completed" && !!record.result;
  const valid = found; // certificate/booking exists in our system
  const tt = record ? testTypeById(record.testTypeId, state.testTypes) : null;
  const center = state.center;

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" strokeWidth={2.4} />
          </div>
          <div className="font-[var(--font-display)] font-bold">{center.name || "Rapid Test"} · Verify</div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-7 text-center shadow-sm">
          <div className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${valid ? "bg-success-soft" : "bg-danger-soft"}`}>
            {valid ? (
              <BadgeCheck className="h-8 w-8 text-[color:var(--success)]" strokeWidth={2.4} />
            ) : (
              <ShieldX className="h-8 w-8 text-[color:var(--danger)]" strokeWidth={2.4} />
            )}
          </div>
          <h1 className="mt-4 font-[var(--font-display)] text-2xl font-bold">
            {valid ? (hasResult ? "Certificate verified" : "Booking verified") : "Not found"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {valid
              ? hasResult
                ? "This certificate is authentic and was issued by our test center."
                : "This booking is registered. The result certificate will be available once testing is complete."
              : "We couldn't verify this ID. It may be invalid or expired."}
          </p>

          {valid && record && (
            <dl className="mt-6 space-y-3 text-left text-sm">
              <Row label="Reference" value={record.certificateId ?? record.ref} mono />
              <Row label="Name" value={`${record.person.firstName} ${record.person.lastName}`} />
              <Row label="Test type" value={tt?.label ?? "—"} />
              <Row label="Date" value={new Date(record.date + "T00:00").toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" })} />
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">{hasResult ? "Result" : "Status"}</dt>
                <dd>{hasResult ? <ResultBadge result={record.result!} /> : <span className="font-medium capitalize">{record.status}</span>}</dd>
              </div>
              <Row label="Issued by" value={center.name || "—"} />
            </dl>
          )}

          <button onClick={onHome} className="mt-7 text-sm font-medium text-primary hover:underline">
            ← Back to home
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Verified against {[center.name, center.city].filter(Boolean).join(", ") || "the configured test center"}.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`text-right font-medium ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
