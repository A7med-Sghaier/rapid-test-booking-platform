import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Activity, AlertTriangle, BadgeCheck, Download, FileText, Gauge, ShieldCheck, TrendingUp } from "lucide-react";
import { localDay } from "../../components/data";
import { EmptyState, KpiCard, Segmented } from "../../shared";
import { useFlux } from "../../store/flux-store";

/** Reporting & audit view: compliance metrics, daily breakdown and event log. */
export function Reports() {
  const { state } = useFlux();
  const [days, setDays] = useState(30);

  const { completed, positives, positivity, avgTurnaround, transmitted, pending, daily, audit } = useMemo(() => {
    const todayStr = localDay(new Date());
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    const startStr = localDay(start);
    const inRange = state.appointments.filter((a) => a.date >= startStr && a.date <= todayStr);
    const completed = inRange.filter((a) => a.status === "completed");
    const positives = completed.filter((a) => a.result === "positive");
    const positivity = completed.length ? (positives.length / completed.length) * 100 : 0;
    const turn = completed.map((a) => a.turnaroundMin).filter((n): n is number => typeof n === "number");
    const avgTurnaround = turn.length ? Math.round(turn.reduce((s, n) => s + n, 0) / turn.length) : 0;
    const transmitted = positives.filter((a) => a.transmitted).length;
    const pending = positives.length - transmitted;

    // Daily aggregation (most recent first)
    const map = new Map<string, { date: string; total: number; completed: number; positive: number }>();
    inRange.forEach((a) => {
      const e = map.get(a.date) ?? { date: a.date, total: 0, completed: 0, positive: 0 };
      e.total += 1;
      if (a.status === "completed") e.completed += 1;
      if (a.result === "positive") e.positive += 1;
      map.set(a.date, e);
    });
    const daily = Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));

    // Derived audit trail (system events reconstructed from records + tasks)
    const audit = [
      ...completed
        .filter((a) => a.completedAt)
        .map((a) => ({
          id: `res-${a.id}`,
          when: `${a.date} ${a.completedAt}`,
          actor: a.agent ?? "System",
          event: `Result recorded (${a.result}) for ${a.person.firstName} ${a.person.lastName}`,
          ref: a.ref,
        })),
      ...state.tasks.map((t) => ({
        id: `task-${t.id}`,
        when: t.createdAt,
        actor: "System",
        event: `${t.done ? "Reported to health office" : "Health-office report opened"} — ${t.patientName}`,
        ref: t.ref,
      })),
    ]
      .sort((a, b) => b.when.localeCompare(a.when))
      .slice(0, 12);

    return { completed, positives, positivity, avgTurnaround, transmitted, pending, daily, audit };
  }, [state.appointments, state.tasks, days]);

  function exportDaily() {
    const rows = [
      ["Date", "Total", "Completed", "Positive"],
      ...daily.map((d) => [d.date, d.total, d.completed, d.positive]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v)}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${localDay(new Date())}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={String(days)}
          onChange={(v) => setDays(Number(v))}
          options={[
            { value: "7", label: "7 days" },
            { value: "30", label: "30 days" },
            { value: "90", label: "90 days" },
          ]}
        />
        <button onClick={exportDaily} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-secondary">
          <Download className="h-4 w-4" /> Export report
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Tests completed" value={completed.length} icon={<BadgeCheck className="h-4.5 w-4.5" />} tone="success" />
        <KpiCard label="Positive results" value={positives.length} icon={<AlertTriangle className="h-4.5 w-4.5" />} tone="danger" />
        <KpiCard label="Positivity rate" value={`${positivity.toFixed(1)}%`} icon={<TrendingUp className="h-4.5 w-4.5" />} tone="violet" />
        <KpiCard label="Avg turnaround" value={`${avgTurnaround} min`} icon={<Gauge className="h-4.5 w-4.5" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Health-office compliance */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 font-[var(--font-display)] font-bold">Health-office reporting</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Reportable (positive)</span>
              <span className="font-semibold">{positives.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[color:var(--success)]"><ShieldCheck className="h-4 w-4" /> Transmitted</span>
              <span className="font-semibold">{transmitted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[color:var(--danger)]"><AlertTriangle className="h-4 w-4" /> Pending</span>
              <span className="font-semibold">{pending}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-success"
                style={{ width: `${positives.length ? (transmitted / positives.length) * 100 : 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {positives.length === 0 ? "No reportable results in range." : `${Math.round((transmitted / positives.length) * 100)}% of positive results transmitted.`}
            </p>
          </div>
        </div>

        {/* Daily breakdown */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="mb-3 font-[var(--font-display)] font-bold">Daily breakdown</h3>
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2 font-medium">Date</th>
                  <th className="py-2 font-medium">Total</th>
                  <th className="py-2 font-medium">Completed</th>
                  <th className="py-2 font-medium">Positive</th>
                </tr>
              </thead>
              <tbody>
                {daily.length === 0 ? (
                  <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">No data in range.</td></tr>
                ) : (
                  daily.map((d) => (
                    <tr key={d.date} className="border-t border-border">
                      <td className="py-2 text-muted-foreground">{new Date(d.date + "T00:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}</td>
                      <td className="py-2 font-medium">{d.total}</td>
                      <td className="py-2">{d.completed}</td>
                      <td className="py-2">{d.positive > 0 ? <span className="font-semibold text-[color:var(--danger)]">{d.positive}</span> : "0"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Audit trail */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 font-[var(--font-display)] font-bold">Audit trail</h3>
        {audit.length === 0 ? (
          <EmptyState icon={<FileText className="h-6 w-6" />} title="No activity yet" description="System events will appear here." />
        ) : (
          <ol className="space-y-1">
            {audit.map((e) => (
              <li key={e.id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-secondary/50">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
                  <Activity className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1 truncate">{e.event}</span>
                <span className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:block">{e.ref}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{e.actor}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
