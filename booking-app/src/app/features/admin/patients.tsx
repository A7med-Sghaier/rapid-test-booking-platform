import { useMemo, useState } from "react";
import { Activity, AlertTriangle, Search, Users } from "lucide-react";
import type { PatientRecord } from "../../components/data";
import { testTypeById } from "../../components/data";
import { EmptyState, GhostButton, KpiCard, Modal, ResultBadge } from "../../shared";
import { useFlux } from "../../store/flux-store";
import { DetailRow } from "./detail-row";

function ageFromDob(dob: string) {
  const d = new Date(dob);
  if (!dob || Number.isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  return String(Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)));
}

/** Registered test persons directory with search and per-person detail. */
export function TestPersons() {
  const { state } = useFlux();
  const people = state.patients;
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<PatientRecord | null>(null);

  const rows = useMemo(
    () =>
      people.filter((p) =>
        (p.firstName + p.lastName + p.email + p.city).toLowerCase().includes(q.toLowerCase()),
      ),
    [people, q],
  );

  const totalVisits = people.reduce((s, p) => s + p.visits, 0);
  const positives = people.filter((p) => p.lastResult === "positive").length;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Registered persons" value={people.length} icon={<Users className="h-4.5 w-4.5" />} tone="info" />
        <KpiCard label="Total visits" value={totalVisits} icon={<Activity className="h-4.5 w-4.5" />} tone="violet" />
        <KpiCard label="Positive (last result)" value={positives} icon={<AlertTriangle className="h-4.5 w-4.5" />} tone="danger" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-input-background px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or city…" className="w-64 bg-transparent text-sm outline-none" />
        </div>
        <span className="ml-auto text-sm text-muted-foreground">Loaded from booked appointment persons</span>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="font-[var(--font-display)] font-semibold">
            Directory · <span className="text-muted-foreground">{rows.length} persons</span>
          </h3>
        </div>
        {rows.length === 0 ? (
          <div className="p-6"><EmptyState icon={<Users className="h-6 w-6" />} title="No matches" description="Try another search term." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Person</th>
                  <th className="px-5 py-3 font-medium">City</th>
                  <th className="px-5 py-3 font-medium">Age</th>
                  <th className="px-5 py-3 font-medium">Visits</th>
                  <th className="px-5 py-3 font-medium">Last visit</th>
                  <th className="px-5 py-3 font-medium">Last result</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-xs font-bold text-primary">
                          {p.firstName[0]}{p.lastName[0]}
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium">{p.firstName} {p.lastName}</div>
                          <div className="truncate text-xs text-muted-foreground">{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{p.city}</td>
                    <td className="px-5 py-3 text-muted-foreground">{ageFromDob(p.dob)}</td>
                    <td className="px-5 py-3 font-semibold">{p.visits}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.lastVisit}</td>
                    <td className="px-5 py-3"><ResultBadge result={p.lastResult} /></td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => setDetail(p)} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-secondary">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && <PatientDetail p={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function PatientDetail({ p, onClose }: { p: PatientRecord; onClose: () => void }) {
  const { state } = useFlux();
  const tt = testTypeById(p.lastTestTypeId, state.testTypes);
  return (
    <Modal
      title={`${p.firstName} ${p.lastName}`}
      onClose={onClose}
      footer={<GhostButton onClick={onClose}>Close</GhostButton>}
    >
      <div className="mb-4 text-xs text-muted-foreground">
        {ageFromDob(p.dob)} yrs · {p.gender === "F" ? "Female" : p.gender === "M" ? "Male" : "Diverse"}
      </div>
      <dl className="space-y-3 text-sm">
        <DetailRow label="Email" value={p.email} />
        <DetailRow label="Phone" value={p.phone} />
        <DetailRow label="City" value={p.city} />
        <DetailRow label="Date of birth" value={p.dob ? new Date(p.dob + "T00:00").toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" }) : "—"} />
        <DetailRow label="Total visits" value={String(p.visits)} />
        <DetailRow label="Last visit" value={p.lastVisit} />
        <DetailRow label="Last test" value={tt?.label ?? "—"} />
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Last result</dt>
          <dd><ResultBadge result={p.lastResult} /></dd>
        </div>
        <DetailRow label="Vaccinated" value={p.vaccinated ? "Yes" : "No"} />
        <DetailRow label="Corona-Warn-App" value={p.coronaWarnApp ? "Linked" : "Not linked"} />
      </dl>
    </Modal>
  );
}
