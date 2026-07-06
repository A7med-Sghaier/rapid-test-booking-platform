import { useMemo, useState } from "react";
import { Archive, Download, FileText, Printer, Search, ShieldCheck } from "lucide-react";
import type { TestResult } from "../../components/data";
import { localDay, testTypeById } from "../../components/data";
import { EmptyState, KpiCard, ResultBadge } from "../../shared";
import { useFlux } from "../../store/flux-store";
import { FilterSelect } from "./filter-select";
import { downloadCsv, printCertificate, toCertRow } from "./lib/certificate";

/** Completed, historical certificate records with CSV export and reprint. */
export function ArchiveView() {
  const { state } = useFlux();
  const [q, setQ] = useState("");
  const [resultFilter, setResultFilter] = useState<TestResult | "all">("all");

  const todayStr = localDay(new Date());
  const allRows = useMemo(
    () =>
      state.appointments
        .filter((a) => a.status === "completed" && a.date < todayStr)
        .map(toCertRow)
        .sort((a, b) => (b.date + b.ref).localeCompare(a.date + a.ref)),
    [state.appointments, todayStr],
  );

  const rows = useMemo(
    () =>
      allRows.filter(
        (r) =>
          (r.name + r.ref + r.certificateId).toLowerCase().includes(q.toLowerCase()) &&
          (resultFilter === "all" || r.result === resultFilter),
      ),
    [allRows, q, resultFilter],
  );

  const transmitted = allRows.filter((r) => r.transmitted).length;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Archived records" value={allRows.length} icon={<Archive className="h-4.5 w-4.5" />} tone="info" />
        <KpiCard label="Certificates issued" value={allRows.length} icon={<FileText className="h-4.5 w-4.5" />} tone="violet" />
        <KpiCard label="Transmitted to health office" value={transmitted} icon={<ShieldCheck className="h-4.5 w-4.5" />} tone="success" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-input-background px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, ref or certificate…" className="w-64 bg-transparent text-sm outline-none" />
        </div>
        <FilterSelect
          label="Result"
          value={resultFilter}
          onChange={(v) => setResultFilter(v as TestResult | "all")}
          options={[
            { value: "all", label: "All results" },
            { value: "negative", label: "Negative" },
            { value: "positive", label: "Positive" },
            { value: "invalid", label: "Invalid" },
          ]}
        />
        <button
          onClick={() => downloadCsv(rows, state.testTypes)}
          disabled={rows.length === 0}
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="font-[var(--font-display)] font-semibold">
            Archived records · <span className="text-muted-foreground">{rows.length}</span>
          </h3>
        </div>
        {rows.length === 0 ? (
          <div className="p-6"><EmptyState icon={<Archive className="h-6 w-6" />} title="No records" description="Try another search or filter." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Person</th>
                  <th className="px-5 py-3 font-medium">Test type</th>
                  <th className="px-5 py-3 font-medium">Result</th>
                  <th className="px-5 py-3 font-medium">Certificate</th>
                  <th className="px-5 py-3 font-medium">Health office</th>
                  <th className="px-5 py-3 font-medium">Agent</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const tt = testTypeById(r.testTypeId, state.testTypes);
                  return (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                      <td className="px-5 py-3 text-muted-foreground">{new Date(r.date + "T00:00").toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</td>
                      <td className="px-5 py-3">
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.ref}</div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{tt?.label}</td>
                      <td className="px-5 py-3"><ResultBadge result={r.result} /></td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{r.certificateId}</td>
                      <td className="px-5 py-3">
                        {r.transmitted ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[color:var(--success)]">
                            <ShieldCheck className="h-3.5 w-3.5" /> Sent
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{r.agent}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => printCertificate(r, state.testTypes, state.center)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-secondary">
                          <Printer className="h-3.5 w-3.5" /> PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
