import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  Clock,
  Download,
  Gauge,
  Send,
  Timer,
  TrendingUp,
} from "lucide-react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Center, TestResult } from "../../components/data";
import { localDay } from "../../components/data";
import { Alert, KpiCard, LiveDot } from "../../shared";
import { useFlux } from "../../store/flux-store";

const DASHBOARD_RANGES = ["Today", "Last 7 days", "Last 30 days", "This month"];
const RANGE_DAYS: Record<string, number> = {
  Today: 1,
  "Last 7 days": 7,
  "Last 30 days": 30,
  "This month": new Date().getDate(),
};

const RESULT_COLORS: Record<TestResult, string> = {
  negative: "var(--success)",
  positive: "var(--danger)",
  invalid: "var(--warning)",
};
const TYPE_COLORS = ["var(--primary)", "var(--info)", "var(--violet)"];

function capacityForRange(center: Center, days: number) {
  const maxPerSlot = Number(center.maxPerSlot ?? 0);
  if (!maxPerSlot) return 0;
  let slots = 0;
  for (let i = 0; i < days; i += 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const opening = openingForCapacityDate(center, date);
    if (!opening?.isOpen || !opening.from || !opening.to) continue;
    const start = minutesOfDay(opening.from);
    const end = minutesOfDay(opening.to);
    if (end < start) continue;
    slots += Math.floor((end - start) / 10) + 1;
  }
  return slots * maxPerSlot;
}

function openingForCapacityDate(center: Center, date: Date) {
  const openingTimes = center.openingTimes ?? {};
  const shortKeys = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const longKey = date.toLocaleDateString("en", { weekday: "long" }).toLowerCase();
  return openingTimes[shortKeys[date.getDay()]] ?? openingTimes[longKey];
}

function minutesOfDay(value: string) {
  const [hours, minutes] = value.split(":").map((part) => Number(part));
  return (hours || 0) * 60 + (minutes || 0);
}

/** Operational overview: KPIs, appointment/result charts, capacity and throughput. */
export function Dashboard() {
  const { state, todayAppts } = useFlux();
  const [range, setRange] = useState("Last 7 days");
  const days = RANGE_DAYS[range] ?? 7;

  const {
    counts, chartData, resultsDist, testsByType, capacityPct, capacityBooked, capacityTotal,
    positivityRate, avgTurnaround, avgWait, throughput,
  } = useMemo(() => {
    const todayStr = localDay(new Date());
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    const startStr = localDay(start);
    const inRange = state.appointments.filter((a) => a.date >= startStr && a.date <= todayStr);

    const completed = inRange.filter((a) => a.status === "completed");
    const positive = completed.filter((a) => a.result === "positive").length;
    const counts = {
      total: inRange.length,
      waiting: todayAppts.filter((a) => a.status === "waiting").length,
      checkedIn: todayAppts.filter((a) => a.status === "checked-in").length,
      completed: completed.length,
      positive,
      canceled: inRange.filter((a) => a.status === "canceled").length,
    };

    // Appointments-by-day chart from real records.
    const byDay = new Map<string, { appts: number; results: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      byDay.set(localDay(d), { appts: 0, results: 0 });
    }
    inRange.forEach((a) => {
      const e = byDay.get(a.date);
      if (!e) return;
      e.appts += 1;
      if (a.status === "completed") e.results += 1;
    });
    const chartData = Array.from(byDay.entries()).map(([date, v]) => ({
      date: days <= 7 ? new Date(date + "T00:00").toLocaleDateString("en", { weekday: "short" }) : new Date(date + "T00:00").toLocaleDateString("en", { day: "numeric" }),
      ...v,
    }));

    const resultsDist = (["negative", "positive", "invalid"] as TestResult[]).map((r) => ({
      name: r[0].toUpperCase() + r.slice(1),
      value: completed.filter((a) => a.result === r).length,
      color: RESULT_COLORS[r],
    }));

    const testsByType = state.testTypes.slice(0, 3).map((t, i) => ({
      name: t.label,
      value: inRange.filter((a) => a.testTypeId === t.id).length,
      color: TYPE_COLORS[i % TYPE_COLORS.length],
    }));

    // Analytics
    const positivityRate = completed.length ? (positive / completed.length) * 100 : 0;
    const turnarounds = completed.map((a) => a.turnaroundMin).filter((n): n is number => typeof n === "number");
    const waits = completed.map((a) => a.waitMin).filter((n): n is number => typeof n === "number");
    const avgTurnaround = turnarounds.length ? Math.round(turnarounds.reduce((s, n) => s + n, 0) / turnarounds.length) : 0;
    const avgWait = waits.length ? Math.round(waits.reduce((s, n) => s + n, 0) / waits.length) : 0;

    const throughput = state.agents
      .map((ag) => ({
        name: `${ag.firstName} ${ag.lastName}`,
        value: completed.filter((a) => a.agent === `${ag.firstName[0]}. ${ag.lastName}`).length,
      }))
      .sort((a, b) => b.value - a.value);

    const capacityTotal = capacityForRange(state.center, days);
    const capacityBooked = inRange.reduce((sum, appointment) => sum + appointment.persons, 0);
    const capacityPct = capacityTotal > 0 ? Math.min(100, Math.round((capacityBooked / capacityTotal) * 100)) : 0;

    return { counts, chartData, resultsDist, testsByType, capacityPct, capacityBooked, capacityTotal, positivityRate, avgTurnaround, avgWait, throughput };
  }, [days, state.appointments, state.agents, state.center, state.testTypes, todayAppts]);

  const openTasks = state.tasks.filter((t) => !t.done);

  function exportSummary() {
    const rows = [
      ["Metric", "Value"],
      ["Range", range],
      ["Total appointments", counts.total],
      ["Completed", counts.completed],
      ["Positive", counts.positive],
      ["Positivity rate %", positivityRate.toFixed(1)],
      ["Avg turnaround (min)", avgTurnaround],
      ["Avg wait (min)", avgWait],
      ["Canceled", counts.canceled],
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v)}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-${localDay(new Date())}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Dashboard summary exported");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">Operational overview</p>
          <LiveDot />
        </div>
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-secondary">
            <CalendarDays className="h-4 w-4" /> {range}
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Date range"
            >
              {DASHBOARD_RANGES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <button onClick={exportSummary} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-secondary">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label={range === "Today" ? "Today's appointments" : "Appointments"} value={counts.total} icon={<CalendarDays className="h-4.5 w-4.5" />} />
        <KpiCard label="Results completed" value={counts.completed} icon={<BadgeCheck className="h-4.5 w-4.5" />} tone="success" />
        <KpiCard label="Positivity rate" value={`${positivityRate.toFixed(1)}%`} icon={<TrendingUp className="h-4.5 w-4.5" />} tone="danger" />
        <KpiCard label="Avg turnaround" value={`${avgTurnaround} min`} icon={<Gauge className="h-4.5 w-4.5" />} tone="violet" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Waiting now" value={counts.waiting} icon={<Clock className="h-4.5 w-4.5" />} tone="info" />
        <KpiCard label="Checked in now" value={counts.checkedIn} icon={<Timer className="h-4.5 w-4.5" />} tone="violet" />
        <KpiCard label="Avg wait time" value={`${avgWait} min`} icon={<Timer className="h-4.5 w-4.5" />} />
        <KpiCard label="Health-office tasks" value={openTasks.length} icon={<Send className="h-4.5 w-4.5" />} tone={openTasks.length ? "danger" : "success"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-[var(--font-display)] font-bold">Appointments by day</h3>
            <span className="text-xs text-muted-foreground">appointments vs. results</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barGap={4}>
              <XAxis key="x" dataKey="date" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis key="y" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" width={30} />
              <Tooltip
                key="tooltip"
                cursor={{ fill: "var(--secondary)" }}
                contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }}
              />
              <Bar key="appts" dataKey="appts" fill="var(--primary)" radius={[6, 6, 0, 0]} name="Appointments" />
              <Bar key="results" dataKey="results" fill="var(--success)" radius={[6, 6, 0, 0]} name="Results" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-2 font-[var(--font-display)] font-bold">Results distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={resultsDist} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={2}>
                {resultsDist.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {resultsDist.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} /> {d.name}
                </span>
                <span className="font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Health-office reporting tasks (clinical loop) */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 font-[var(--font-display)] font-bold">Health-office reporting</h3>
          <div className="space-y-2.5">
            {openTasks.length === 0 ? (
              <Alert icon={<BadgeCheck className="h-4 w-4" />} tone="info" title="All caught up" sub="No positive results pending report." />
            ) : (
              openTasks.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-xl border border-[color:var(--danger)]/20 bg-danger-soft/40 p-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-danger-soft text-[color:var(--danger)]">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{t.patientName}</div>
                    <div className="text-xs text-muted-foreground">Positive · {t.ref}</div>
                  </div>
                  <span className="rounded-lg bg-danger-soft px-2.5 py-1.5 text-xs font-semibold text-[color:var(--danger)]">Pending</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tests by type */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 font-[var(--font-display)] font-bold">Tests by type</h3>
          <div className="space-y-3">
            {testsByType.map((t) => {
              const max = Math.max(...testsByType.map((x) => x.value));
              return (
                <div key={t.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{t.name}</span>
                    <span className="font-semibold">{t.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div className="h-2 rounded-full" style={{ width: `${(t.value / max) * 100}%`, background: t.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Capacity */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 font-[var(--font-display)] font-bold">Capacity utilization</h3>
          <div className="flex items-center gap-4">
            <div className="relative grid h-24 w-24 place-items-center">
              <svg className="h-24 w-24 -rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" stroke="var(--secondary)" strokeWidth="10" />
                <circle cx="48" cy="48" r="40" fill="none" stroke="var(--primary)" strokeWidth="10" strokeDasharray={`${(capacityPct / 100) * 251} 251`} strokeLinecap="round" />
              </svg>
              <span className="absolute font-[var(--font-display)] text-xl font-bold">{capacityPct}%</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>{capacityBooked} / {capacityTotal} configured capacity{range === "Today" ? " today" : ""}.</p>
              <p className="mt-1 font-medium text-foreground">{Math.max(0, capacityTotal - capacityBooked)} places remaining.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent throughput leaderboard */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 font-[var(--font-display)] font-bold">Agent throughput</h3>
        {throughput.every((t) => t.value === 0) ? (
          <p className="text-sm text-muted-foreground">No results recorded in this range yet.</p>
        ) : (
          <div className="space-y-3">
            {throughput.map((t) => {
              const max = Math.max(...throughput.map((x) => x.value), 1);
              return (
                <div key={t.name} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 truncate text-sm">{t.name}</span>
                  <div className="h-2 flex-1 rounded-full bg-secondary">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${(t.value / max) * 100}%` }} />
                  </div>
                  <span className="w-10 shrink-0 text-right text-sm font-semibold">{t.value}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
