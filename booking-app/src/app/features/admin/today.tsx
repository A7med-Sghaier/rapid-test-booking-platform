import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, Columns3, LayoutGrid, List, Printer, Search, Stethoscope, Timer } from "lucide-react";
import type { Appointment, TestResult } from "../../components/data";
import { priceLabel, testTypeById } from "../../components/data";
import { EmptyState, LiveDot, ResultBadge, Segmented, StatusBadge } from "../../shared";
import { useFlux } from "../../store/flux-store";
import { cancelAppointment, checkInAppointment, emitAppointmentResult, loadRealAppState } from "../../lib/api";
import { printApptCertificate } from "./lib/certificate";

type TodayView = "kanban" | "grid" | "list";
type TodayTab = "waiting" | "checked-in" | "completed";

const TODAY_COLUMNS: { key: TodayTab; label: string }[] = [
  { key: "waiting", label: "Waiting" },
  { key: "checked-in", label: "Checked in" },
  { key: "completed", label: "Completed" },
];

/** Live queue for today's appointments across kanban, grid and list views. */
export function TodayOps() {
  const { todayAppts, state, hydrate } = useFlux();
  const [view, setView] = useState<TodayView>("kanban");
  const [tab, setTab] = useState<TodayTab>("waiting");
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();
  const appts = todayAppts.filter(
    (a) => !query || (a.person.firstName + a.person.lastName + a.ref + a.person.email).toLowerCase().includes(query),
  );
  const filtered = appts.filter((a) => a.status === tab);
  const count = (s: string) => appts.filter((a) => a.status === s).length;

  async function move(id: string, status: Appointment["status"], result?: TestResult) {
    setBusy(id);
    const prev = todayAppts.find((a) => a.id === id);
    if (!prev) {
      setBusy(null);
      return;
    }
    const agentId = state.agents[0]?.id ?? "user";
    const activeKit = state.kits.find((kit) => kit.id === state.activeKitId)?.name ?? state.activeKitId;
    try {
      if (status === "checked-in") await checkInAppointment(prev, agentId);
      if (status === "canceled") await cancelAppointment(prev, agentId);
      if (status === "completed" && result) await emitAppointmentResult(prev, result, agentId, activeKit);
      hydrate(await loadRealAppState());
      setBusy(null);
      const name = prev ? `${prev.person.firstName} ${prev.person.lastName}` : "Patient";
      if (status === "checked-in") toast.success(`${name} checked in`);
      else if (status === "canceled") {
        toast(`${name} canceled`);
      } else if (status === "completed") {
        if (result === "positive") toast.error(`Positive result — ${name} flagged for health-office report`);
        else toast.success(`Result recorded: ${result} · ${name}`);
      }
    } catch (error) {
      setBusy(null);
      toast.error(error instanceof Error ? error.message : "Backend update failed");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {view === "kanban" ? (
          <div className="text-sm font-medium text-muted-foreground" aria-live="polite">
            {count("waiting")} waiting · {count("checked-in")} in progress · {count("completed")} completed
          </div>
        ) : (
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: "waiting", label: "Waiting", count: count("waiting") },
              { value: "checked-in", label: "Checked in", count: count("checked-in") },
              { value: "completed", label: "Completed", count: count("completed") },
            ]}
          />
        )}
        <div className="flex items-center gap-2">
          <LiveDot label="Live queue" />
          <div className="flex items-center gap-2 rounded-xl border border-border bg-input-background px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" className="w-40 bg-transparent text-sm outline-none" />
          </div>
          <ViewSwitcher value={view} onChange={setView} />
        </div>
      </div>

      {view === "kanban" ? (
        <div className="grid gap-4 md:grid-cols-3">
          {TODAY_COLUMNS.map((col) => {
            const items = appts.filter((a) => a.status === col.key);
            return (
              <div key={col.key} className="flex flex-col rounded-2xl border border-border bg-secondary/30 p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold">{col.label}</h3>
                  <span className="rounded-full bg-card px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                      Empty
                    </div>
                  ) : (
                    items.map((a) => (
                      <TodayCard key={a.id} a={a} tab={col.key} busy={busy === a.id} onMove={move} compact />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Stethoscope className="h-6 w-6" />} title="Nothing here yet" description="No appointments in this queue right now." />
      ) : (
        <div className={view === "grid" ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-3" : "grid gap-3"}>
          {filtered.map((a) => (
            <TodayCard key={a.id} a={a} tab={tab} busy={busy === a.id} onMove={move} compact={view === "grid"} />
          ))}
        </div>
      )}
    </div>
  );
}

function ViewSwitcher({ value, onChange }: { value: TodayView; onChange: (v: TodayView) => void }) {
  const opts: { value: TodayView; label: string; icon: typeof List }[] = [
    { value: "kanban", label: "Kanban", icon: Columns3 },
    { value: "grid", label: "Grid", icon: LayoutGrid },
    { value: "list", label: "List", icon: List },
  ];
  return (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
      {opts.map((o) => {
        const Icon = o.icon;
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-label={o.label}
            title={o.label}
            className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}

// Live countdown to test result readiness, animated per checked-in patient.
const readyTargets = new Map<string, number>();
const READY_MS = 8 * 60 * 1000;

function ReadyTimer({ id }: { id: string }) {
  if (!readyTargets.has(id)) readyTargets.set(id, Date.now() + READY_MS);
  const target = readyTargets.get(id)!;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining = Math.max(0, target - now);
  const done = remaining === 0;
  const pct = Math.min(100, Math.max(0, ((READY_MS - remaining) / READY_MS) * 100));
  const mm = Math.floor(remaining / 60000);
  const ss = Math.floor((remaining % 60000) / 1000);

  return (
    <span
      className={`relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-2.5 py-1 text-xs font-semibold ${
        done ? "bg-success-soft text-[color:var(--success)]" : "bg-violet-soft text-violet"
      }`}
    >
      {!done && (
        <span
          className="absolute inset-y-0 left-0 bg-violet/15 transition-[width] duration-1000 ease-linear"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      )}
      <span className="relative flex items-center gap-1.5">
        {done ? (
          <>
            <BadgeCheck className="h-3.5 w-3.5" /> Ready for result
          </>
        ) : (
          <>
            <Timer className="h-3.5 w-3.5 animate-pulse" /> Ready in {mm}:{String(ss).padStart(2, "0")}
          </>
        )}
      </span>
    </span>
  );
}

function TodayCard({
  a,
  tab,
  busy,
  onMove,
  compact = false,
}: {
  a: Appointment;
  tab: string;
  busy: boolean;
  onMove: (id: string, status: Appointment["status"], result?: TestResult) => void;
  compact?: boolean;
}) {
  const [confirmPos, setConfirmPos] = useState(false);
  const { state } = useFlux();
  const tt = testTypeById(a.testTypeId, state.testTypes);
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className={compact ? "flex flex-col gap-3" : "flex flex-wrap items-center gap-4"}>
        <div className={compact ? "flex items-start gap-3" : "contents"}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary font-[var(--font-display)] text-sm font-bold text-primary">
            {a.person.firstName[0]}
            {a.person.lastName[0]}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {a.person.firstName} {a.person.lastName}
              </span>
              {a.persons > 1 && <span className="rounded bg-secondary px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">+{a.persons - 1}</span>}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {a.ref} · {a.person.email}
            </div>
            {compact && (
              <div className="mt-1 text-xs text-muted-foreground">
                {a.time} · {tt?.label} · {priceLabel(tt?.price ?? 0)}
              </div>
            )}
          </div>
        </div>
        <div className={compact ? "hidden" : "hidden text-sm sm:block"}>
          <div className="font-semibold">{a.time}</div>
          <div className="text-xs text-muted-foreground">{tt?.label} · {priceLabel(tt?.price ?? 0)}</div>
        </div>

        {tab === "waiting" && <StatusBadge status="waiting" />}
        {tab === "checked-in" && <ReadyTimer id={a.id} />}
        {tab === "completed" && a.result && <ResultBadge result={a.result} />}

        {/* Actions */}
        <div className={`flex w-full items-center gap-2 ${compact ? "" : "sm:w-auto"}`}>
          {tab === "waiting" && (
            <>
              <button
                disabled={busy}
                onClick={() => onMove(a.id, "checked-in")}
                className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 sm:flex-none"
              >
                {busy ? "…" : "Check in"}
              </button>
              <button onClick={() => onMove(a.id, "canceled")} className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-secondary">
                Cancel
              </button>
            </>
          )}
          {tab === "checked-in" && !confirmPos && (
            <>
              <button disabled={busy} onClick={() => onMove(a.id, "completed", "negative")} className="rounded-lg bg-success px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                Negative
              </button>
              <button disabled={busy} onClick={() => onMove(a.id, "completed", "invalid")} className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-50">
                Invalid
              </button>
              <button disabled={busy} onClick={() => setConfirmPos(true)} className="rounded-lg bg-[color:var(--danger)] px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                Positive
              </button>
            </>
          )}
          {tab === "checked-in" && confirmPos && (
            <div className="flex items-center gap-2 rounded-lg border border-[color:var(--danger)]/30 bg-danger-soft px-2 py-1.5">
              <span className="text-xs font-medium text-[color:var(--danger)]">Confirm positive?</span>
              <button onClick={() => onMove(a.id, "completed", "positive")} className="rounded bg-[color:var(--danger)] px-2 py-1 text-xs font-semibold text-white">Yes</button>
              <button onClick={() => setConfirmPos(false)} className="rounded border border-border bg-card px-2 py-1 text-xs">No</button>
            </div>
          )}
          {tab === "completed" && (
            <>
              <span className="hidden text-xs text-muted-foreground md:block">{a.completedAt} · {a.agent}</span>
              <button onClick={() => printApptCertificate(a, state.testTypes, state.center)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-secondary">
                <Printer className="h-4 w-4" /> PDF
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
