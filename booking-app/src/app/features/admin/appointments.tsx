import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, List, Printer, Search, X } from "lucide-react";
import type { Appointment, AppointmentStatus, TestResult } from "../../components/data";
import { priceLabel, testTypeById } from "../../components/data";
import { EmptyState, GhostButton, Modal, PrimaryButton, ResultBadge, StatusBadge } from "../../shared";
import { useFlux } from "../../store/flux-store";
import { FilterSelect } from "./filter-select";
import { DetailRow } from "./detail-row";
import { printApptCertificate } from "./lib/certificate";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const STATUS_DOT: Record<AppointmentStatus, string> = {
  waiting: "bg-warning",
  "checked-in": "bg-violet",
  completed: "bg-success",
  canceled: "bg-muted-foreground",
};

function isoDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Appointment browser with a month calendar, day agenda and filterable list. */
export function Appointments() {
  const { state } = useFlux();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [resultFilter, setResultFilter] = useState<TestResult | "all">("all");
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [listDate, setListDate] = useState<string>("");
  const [detail, setDetail] = useState<Appointment | null>(null);

  const today = new Date();
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<string>(isoDay(today));

  const withDates = useMemo(
    () =>
      state.appointments.filter(
        (a) =>
          (a.person.firstName + a.person.lastName + a.ref).toLowerCase().includes(q.toLowerCase()) &&
          (statusFilter === "all" || a.status === statusFilter) &&
          (typeFilter === "all" || a.testTypeId === typeFilter) &&
          (resultFilter === "all" || a.result === resultFilter),
      ),
    [state.appointments, q, statusFilter, typeFilter, resultFilter],
  );

  const byDay = useMemo(() => {
    const m = new Map<string, Appointment[]>();
    withDates.forEach((a) => {
      const arr = m.get(a.date) ?? [];
      arr.push(a);
      m.set(a.date, arr);
    });
    m.forEach((arr) => arr.sort((x, y) => x.time.localeCompare(y.time)));
    return m;
  }, [withDates]);

  // Build the calendar grid (weeks starting Monday).
  const cells = useMemo(() => {
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const startOffset = (first.getDay() + 6) % 7; // Mon = 0
    const start = new Date(first);
    start.setDate(first.getDate() - startOffset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [viewMonth]);

  const daySelected = byDay.get(selectedDay) ?? [];
  const monthLabel = viewMonth.toLocaleDateString("en", { month: "long", year: "numeric" });

  function shiftMonth(delta: number) {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  }
  function goToday() {
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(isoDay(today));
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-input-background px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient or ref…" className="w-52 bg-transparent text-sm outline-none" />
        </div>
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as AppointmentStatus | "all")}
          options={[
            { value: "all", label: "All statuses" },
            { value: "waiting", label: "Waiting" },
            { value: "checked-in", label: "Checked in" },
            { value: "completed", label: "Completed" },
            { value: "canceled", label: "Canceled" },
          ]}
        />
        <FilterSelect
          label="Test type"
          value={typeFilter}
          onChange={setTypeFilter}
          options={[{ value: "all", label: "All types" }, ...state.testTypes.map((t) => ({ value: t.id, label: t.label }))]}
        />
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
        {view === "list" && (
          <div
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm hover:bg-secondary"
            onClick={(e) => {
              const input = e.currentTarget.querySelector("input") as HTMLInputElement | null;
              try {
                input?.showPicker?.();
              } catch {
                input?.focus();
              }
            }}
          >
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={listDate}
              onChange={(e) => setListDate(e.target.value)}
              className="cursor-pointer bg-transparent font-medium text-foreground outline-none [color-scheme:light]"
              aria-label="Pick a date"
            />
            {listDate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setListDate("");
                }}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Clear date"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
        <div className="ml-auto flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          <button
            onClick={() => setView("calendar")}
            className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${view === "calendar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
            aria-label="Calendar view"
            title="Calendar"
          >
            <CalendarDays className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
            aria-label="List view"
            title="List"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {view === "calendar" ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          {/* Calendar */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-[var(--font-display)] font-bold">{monthLabel}</h3>
              <div className="flex items-center gap-1">
                <button onClick={() => shiftMonth(-1)} className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-secondary" aria-label="Previous month">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={goToday} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary">
                  Today
                </button>
                <button onClick={() => shiftMonth(1)} className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-secondary" aria-label="Next month">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS.map((w) => (
                <div key={w} className="pb-1 text-center text-xs font-medium text-muted-foreground">{w}</div>
              ))}
              {cells.map((d) => {
                const key = isoDay(d);
                const inMonth = d.getMonth() === viewMonth.getMonth();
                const items = byDay.get(key) ?? [];
                const isToday = key === isoDay(today);
                const isSelected = key === selectedDay;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDay(key)}
                    className={`flex min-h-[76px] flex-col rounded-lg border p-1.5 text-left transition-colors ${
                      isSelected ? "border-primary ring-2 ring-primary/30" : "border-border hover:bg-secondary/50"
                    } ${inMonth ? "bg-card" : "bg-secondary/30"}`}
                  >
                    <span
                      className={`mb-1 grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                        isToday ? "bg-primary text-primary-foreground" : inMonth ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {d.getDate()}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {items.slice(0, 4).map((a) => (
                        <span key={a.id} className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[a.status]}`} />
                      ))}
                    </div>
                    {items.length > 0 && (
                      <span className="mt-auto text-[11px] font-medium text-muted-foreground">{items.length} appt{items.length > 1 ? "s" : ""}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day agenda */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="font-[var(--font-display)] font-bold">
              {new Date(selectedDay).toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">{daySelected.length} appointment{daySelected.length === 1 ? "" : "s"}</p>
            {daySelected.length === 0 ? (
              <EmptyState icon={<CalendarDays className="h-6 w-6" />} title="No appointments" description="Nothing scheduled for this day." />
            ) : (
              <div className="space-y-2">
                {daySelected.map((a) => {
                  const tt = testTypeById(a.testTypeId, state.testTypes);
                  return (
                    <button
                      key={a.id}
                      onClick={() => setDetail(a)}
                      className="flex w-full items-center gap-3 rounded-xl border border-border p-2.5 text-left hover:bg-secondary/50"
                    >
                      <span className="w-11 shrink-0 text-sm font-semibold">{a.time}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{a.person.firstName} {a.person.lastName}</span>
                        <span className="block truncate text-xs text-muted-foreground">{tt?.label}</span>
                      </span>
                      {a.result ? <ResultBadge result={a.result} /> : <StatusBadge status={a.status} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <ListTable
          rows={listDate ? withDates.filter((a) => a.date === listDate) : withDates}
          label={listDate ? new Date(listDate).toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" }) : monthLabel}
          onView={setDetail}
        />
      )}

      {detail && <AppointmentDetail a={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function ListTable({ rows, label, onView }: { rows: Appointment[]; label: string; onView: (a: Appointment) => void }) {
  const { state } = useFlux();
  return (
    <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="font-[var(--font-display)] font-semibold">
              {label} · <span className="text-muted-foreground">{rows.length} appointments</span>
            </h3>
          </div>
          {rows.length === 0 ? (
            <div className="p-6"><EmptyState icon={<CalendarDays className="h-6 w-6" />} title="No matches" description="Try another search, date, or filter." /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Time</th>
                    <th className="px-5 py-3 font-medium">Patient</th>
                    <th className="px-5 py-3 font-medium">Test type</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Result</th>
                    <th className="px-5 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {[...rows].sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time)).map((a) => {
                    const tt = testTypeById(a.testTypeId, state.testTypes);
                    return (
                      <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                        <td className="px-5 py-3 text-muted-foreground">{new Date(a.date).toLocaleDateString("en", { month: "short", day: "numeric" })}</td>
                        <td className="px-5 py-3 font-semibold">{a.time}</td>
                        <td className="px-5 py-3">
                          <div className="font-medium">{a.person.firstName} {a.person.lastName}</div>
                          <div className="text-xs text-muted-foreground">{a.ref}</div>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{tt?.label}</td>
                        <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                        <td className="px-5 py-3">{a.result ? <ResultBadge result={a.result} /> : <span className="text-muted-foreground">—</span>}</td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => onView(a)} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-secondary">View</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
  );
}

function AppointmentDetail({ a, onClose }: { a: Appointment; onClose: () => void }) {
  const { state } = useFlux();
  const tt = testTypeById(a.testTypeId, state.testTypes);
  return (
    <Modal
      title={`${a.person.firstName} ${a.person.lastName}`}
      onClose={onClose}
      footer={
        <>
          {a.status === "completed" && a.result && (
            <PrimaryButton onClick={() => printApptCertificate(a, state.testTypes, state.center)}>
              <Printer className="h-4 w-4" /> Print PDF
            </PrimaryButton>
          )}
          <GhostButton onClick={onClose}>Close</GhostButton>
        </>
      }
    >
      <dl className="space-y-3 text-sm">
        <DetailRow label="Reference" value={a.ref} />
        <DetailRow label="Date" value={new Date(a.date + "T00:00").toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })} />
        <DetailRow label="Time" value={a.time} />
        <DetailRow label="Test type" value={`${tt?.label} · ${priceLabel(tt?.price ?? 0)}`} />
        <DetailRow label="Persons" value={String(a.persons)} />
        <DetailRow label="Email" value={a.person.email} />
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Status</dt>
          <dd><StatusBadge status={a.status} /></dd>
        </div>
        {a.result && (
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Result</dt>
            <dd><ResultBadge result={a.result} /></dd>
          </div>
        )}
        {a.agent && <DetailRow label="Agent" value={a.agent} />}
      </dl>
    </Modal>
  );
}
