import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  Archive,
  BadgeCheck,
  Bell,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Columns3,
  Download,
  FileText,
  Gauge,
  LayoutDashboard,
  LayoutGrid,
  List,
  Lock,
  LogOut,
  Menu,
  Plus,
  Printer,
  Search,
  Send,
  Settings as SettingsIcon,
  ShieldCheck,
  Stethoscope,
  Timer,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  type Agent,
  type Appointment,
  type AppointmentStatus,
  type Center,
  type PatientRecord,
  type TestType,
  type TestResult,
  localDay,
  priceLabel,
  testTypeById,
} from "./data";
import {
  EmptyState,
  Field,
  GhostButton,
  KpiCard,
  LiveDot,
  Logo,
  Modal,
  PrimaryButton,
  ResultBadge,
  Segmented,
  StatusBadge,
} from "./primitives";
import { type Role, useFlux } from "../store/flux-store";
import { useI18n } from "../lib/i18n";
import { CommandPalette } from "./command-palette";
import {
  cancelAppointment,
  checkInAppointment,
  clearAuthToken,
  createBooking,
  emitAppointmentResult,
  hasAuthToken,
  addAgent as createAgentApi,
  loadRealAppState,
  login as loginAgent,
  saveSettings,
  storeAuthToken,
  updateAgent as updateAgentApi,
} from "../lib/api";
import { LanguageToggle } from "../lib/i18n";
import { validateEmail } from "../lib/validation";

type Section = "dashboard" | "today" | "appointments" | "agents" | "settings" | "patients" | "archive" | "reports";

const NAV: { key: Section; label: string; icon: typeof LayoutDashboard; soon?: boolean }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "today", label: "Today", icon: Clock },
  { key: "appointments", label: "Appointments", icon: CalendarDays },
  { key: "patients", label: "Test persons", icon: Users },
  { key: "archive", label: "Archive", icon: Archive },
  { key: "agents", label: "Agents", icon: BadgeCheck },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

const NAV_SECONDARY: { key: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "reports", label: "Reports & audit", icon: FileText },
];

const ALL_SECTIONS = [...NAV, ...NAV_SECONDARY];

function sectionFromUrl(): Section {
  const m = window.location.pathname.toLowerCase().match(/\/admin\/([a-z]+)/);
  const key = m?.[1] as Section | undefined;
  return key && ALL_SECTIONS.some((n) => n.key === key) ? key : "dashboard";
}

export function AdminApp({ onExit }: { onExit: () => void }) {
  const { t } = useI18n();
  const [authed, setAuthed] = useState(() => hasAuthToken());
  const [section, setSectionState] = useState<Section>(sectionFromUrl());
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [newApptOpen, setNewApptOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Sync section <-> URL (/admin/<section>) for deep links + browser back.
  function setSection(s: Section) {
    setSectionState(s);
    const base = window.location.pathname.replace(/\/admin(\/.*)?$/i, "");
    window.history.pushState({}, "", `${base}/admin/${s}`);
  }
  useEffect(() => {
    const onPop = () => setSectionState(sectionFromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // ⌘K / Ctrl-K command palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} onExit={onExit} />;

  const active = ALL_SECTIONS.find((n) => n.key === section);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        section={section}
        setSection={(s) => {
          setSection(s);
          setMobileNav(false);
        }}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileNav={mobileNav}
        setMobileNav={setMobileNav}
        onExit={() => {
          clearAuthToken();
          setAuthed(false);
          onExit();
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={active ? t(`admin.nav.${active.key}`) : ""}
          onMenu={() => setMobileNav(true)}
          onNew={() => setNewApptOpen(true)}
          onSearch={() => setPaletteOpen(true)}
        />
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
          {section === "dashboard" && <Dashboard />}
          {section === "today" && <TodayOps />}
          {section === "appointments" && <Appointments />}
          {section === "agents" && <Agents />}
          {section === "settings" && <Settings />}
          {section === "patients" && <TestPersons />}
          {section === "archive" && <ArchiveView />}
          {section === "reports" && <Reports />}
        </main>
      </div>

      {newApptOpen && <NewAppointmentDrawer onClose={() => setNewApptOpen(false)} />}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={(s) => setSection(s as Section)}
        onNewAppointment={() => setNewApptOpen(true)}
        sections={ALL_SECTIONS.map((n) => ({ key: n.key, label: n.label }))}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
function AdminLogin({ onLogin, onExit }: { onLogin: () => void; onExit: () => void }) {
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [failure, setFailure] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setFailure(null);
    try {
      const auth = await loginAgent(userName, password);
      if (auth.access_token) {
        storeAuthToken(auth);
        onLogin();
        return;
      }
      setFailure(auth.error ?? "Login failed");
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-[color:var(--sidebar)] p-12 text-white lg:flex">
        <Logo dark />
        <div>
          <h2 className="font-[var(--font-display)] text-3xl font-bold leading-tight">
            Operations console for your test center.
          </h2>
          <p className="mt-3 max-w-sm text-slate-400">
            Check-ins, results, certificates and health-office reporting — one fast, secure workspace for your agents.
          </p>
          <div className="mt-8 flex gap-6 text-sm text-slate-300">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[color:var(--success)]" /> GDPR secured</span>
            <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-[color:var(--success)]" /> Live sync</span>
          </div>
        </div>
        <p className="text-xs text-slate-500">Rapid Test Platform</p>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h1 className="font-[var(--font-display)] text-2xl font-bold">Staff sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your agent credentials to continue.</p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">Username</span>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-input-background px-3 py-2.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <input value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full bg-transparent text-sm outline-none" />
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">Password</span>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-input-background px-3 py-2.5">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent text-sm outline-none" />
              </div>
            </label>
            {failure && <div className="rounded-xl bg-danger-soft px-3 py-2 text-sm font-medium text-[color:var(--danger)]">{failure}</div>}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" defaultChecked /> Remember me
              </label>
              <button type="button" className="font-medium text-primary hover:underline">Need help?</button>
            </div>
            <button
              disabled={loading || !userName.trim() || !password}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : null}
              Sign in
            </button>
          </form>

          <button onClick={onExit} className="mt-6 text-sm text-muted-foreground hover:text-foreground">
            ← Back to public site
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar + topbar
// ---------------------------------------------------------------------------
function Sidebar({
  section,
  setSection,
  collapsed,
  setCollapsed,
  mobileNav,
  setMobileNav,
  onExit,
}: {
  section: Section;
  setSection: (s: Section) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileNav: boolean;
  setMobileNav: (v: boolean) => void;
  onExit: () => void;
}) {
  const { t } = useI18n();
  const w = collapsed ? "lg:w-[76px]" : "lg:w-64";
  return (
    <>
      {mobileNav && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileNav(false)} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col bg-[color:var(--sidebar)] text-[color:var(--sidebar-foreground)] transition-transform lg:static lg:h-screen lg:translate-x-0 ${w} ${
          mobileNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4">
          {collapsed ? <Logo dark compact /> : <Logo dark />}
          <button onClick={() => setMobileNav(false)} className="text-slate-400 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV.map((n) => (
            <NavItem key={n.key} n={{ ...n, label: t(`admin.nav.${n.key}`) }} active={section === n.key} collapsed={collapsed} onClick={() => setSection(n.key)} />
          ))}
          <div className="my-3 border-t border-[color:var(--sidebar-border)]" />
          {!collapsed && <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("admin.enterprise")}</div>}
          {NAV_SECONDARY.map((n) => (
            <NavItem key={n.key} n={{ ...n, label: t(`admin.nav.${n.key}`) }} active={section === n.key} collapsed={collapsed} onClick={() => setSection(n.key)} />
          ))}
        </nav>

        <div className="border-t border-[color:var(--sidebar-border)] p-3">
          {!collapsed && <RoleSwitcher />}
          <button
            onClick={onExit}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-[color:var(--sidebar-accent)] hover:text-white"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" /> {!collapsed && t("admin.signOut")}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mt-1 hidden w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-[color:var(--sidebar-accent)] hover:text-white lg:flex"
          >
            {collapsed ? <ChevronRight className="h-4.5 w-4.5" /> : <ChevronLeft className="h-4.5 w-4.5" />}
            {!collapsed && t("admin.collapse")}
          </button>
        </div>
      </aside>
    </>
  );
}

function RoleSwitcher() {
  const { state, dispatch } = useFlux();
  const { t } = useI18n();
  const roles: Role[] = ["Lead agent", "Agent", "Admin"];
  return (
    <label className="mb-2 block rounded-lg bg-[color:var(--sidebar-accent)] px-3 py-2">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{t("admin.viewingAs")}</span>
      <select
        value={state.role}
        onChange={(e) => dispatch({ type: "SET_ROLE", role: e.target.value as Role })}
        className="mt-0.5 w-full cursor-pointer bg-transparent text-sm font-medium text-slate-200 outline-none"
      >
        {roles.map((r) => (
          <option key={r} value={r} className="text-foreground">{r}</option>
        ))}
      </select>
    </label>
  );
}

function NavItem({
  n,
  active,
  collapsed,
  onClick,
}: {
  n: { label: string; icon: typeof LayoutDashboard; soon?: boolean };
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const Icon = n.icon;
  return (
    <button
      onClick={onClick}
      title={collapsed ? n.label : undefined}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-[color:var(--sidebar-primary)] text-white shadow-sm"
          : "text-slate-300 hover:bg-[color:var(--sidebar-accent)] hover:text-white"
      }`}
    >
      <Icon className="h-4.5 w-4.5 shrink-0" />
      {!collapsed && (
        <span className="flex-1 text-left">{n.label}</span>
      )}
      {!collapsed && n.soon && (
        <span className="rounded bg-[color:var(--sidebar-accent)] px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
          Soon
        </span>
      )}
    </button>
  );
}

function Topbar({ title, onMenu, onNew, onSearch }: { title: string; onMenu: () => void; onNew: () => void; onSearch: () => void }) {
  const { state } = useFlux();
  const { t, lang } = useI18n();
  const me = state.agents[0];
  const now = new Date().toLocaleDateString(lang, { weekday: "long", day: "numeric", month: "long" });
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur lg:px-8">
      <button onClick={onMenu} className="lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
      <div className="min-w-0">
        <h1 className="truncate font-[var(--font-display)] text-lg font-bold">{title}</h1>
        <span className="hidden text-xs text-muted-foreground sm:block">{now}</span>
      </div>
      <button
        onClick={onSearch}
        className="ml-auto hidden items-center gap-2 rounded-xl border border-border bg-input-background px-3 py-2 text-muted-foreground hover:bg-secondary md:flex"
      >
        <Search className="h-4 w-4" />
        <span className="w-40 text-left text-sm">{t("admin.search")}</span>
        <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-semibold">⌘K</kbd>
      </button>
      <button onClick={onNew} className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 md:ml-0">
        <Plus className="h-4 w-4" /> <span className="hidden sm:inline">{t("admin.newAppointment")}</span>
      </button>
      <LanguageToggle />
      <button className="relative grid h-9 w-9 place-items-center rounded-xl border border-border bg-card hover:bg-secondary" aria-label="Notifications">
        <Bell className="h-4.5 w-4.5" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[color:var(--danger)]" />
      </button>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card py-1 pl-1 pr-2.5">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
          {me ? `${me.firstName[0] ?? ""}${me.lastName[0] ?? ""}` : "RT"}
        </span>
        <span className="hidden text-sm font-medium sm:block">{me ? `${me.firstName[0] ?? ""}. ${me.lastName}` : "Signed in"}</span>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
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

function Dashboard() {
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

function Alert({ icon, tone, title, sub }: { icon: React.ReactNode; tone: "danger" | "warning" | "info"; title: string; sub: string }) {
  const map = {
    danger: "bg-danger-soft text-[color:var(--danger)]",
    warning: "bg-warning-soft text-[color:var(--warning-foreground)]",
    info: "bg-info-soft text-info",
  };
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border p-3">
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${map[tone]}`}>{icon}</span>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Today operations
// ---------------------------------------------------------------------------
type TodayView = "kanban" | "grid" | "list";
type TodayTab = "waiting" | "checked-in" | "completed";

const TODAY_COLUMNS: { key: TodayTab; label: string }[] = [
  { key: "waiting", label: "Waiting" },
  { key: "checked-in", label: "Checked in" },
  { key: "completed", label: "Completed" },
];

function TodayOps() {
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

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------
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

function Appointments() {
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

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const active = value !== "all";
  const current = options.find((o) => o.value === value);
  return (
    <label className={`relative inline-flex items-center rounded-xl border px-3 py-2 text-sm font-medium ${active ? "border-primary text-foreground" : "border-border text-muted-foreground"} bg-card hover:bg-secondary`}>
      <span className="pointer-events-none mr-1 text-muted-foreground">{label}:</span>
      <span className="pointer-events-none">{active ? current?.label : "All"}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Test persons
// ---------------------------------------------------------------------------
function ageFromDob(dob: string) {
  const d = new Date(dob);
  if (!dob || Number.isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  return String(Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)));
}

function TestPersons() {
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

// Single field implementation lives in primitives; keep the name for existing call sites.
const ModalField = Field;

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

// ---------------------------------------------------------------------------
// Archive
// ---------------------------------------------------------------------------
// Normalized certificate shape used by CSV export + PDF, derived from an Appointment.
interface CertRow {
  id: string;
  ref: string;
  name: string;
  testTypeId: string;
  result: TestResult;
  date: string;
  agent: string;
  certificateId: string;
  transmitted: boolean;
}

function toCertRow(a: Appointment): CertRow {
  return {
    id: a.id,
    ref: a.ref,
    name: `${a.person.firstName} ${a.person.lastName}`,
    testTypeId: a.testTypeId,
    result: a.result ?? "negative",
    date: a.date,
    agent: a.agent ?? "—",
    certificateId: a.certificateId ?? a.ref,
    transmitted: !!a.transmitted,
  };
}

function printApptCertificate(a: Appointment, testTypes: TestType[], center: Center) {
  printCertificate(toCertRow(a), testTypes, center);
}

function downloadCsv(rows: CertRow[], testTypes: TestType[]) {
  const headers = ["Ref", "Name", "Test type", "Result", "Date", "Agent", "Certificate", "Transmitted"];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.ref,
        r.name,
        testTypeById(r.testTypeId, testTypes)?.label ?? r.testTypeId,
        r.result,
        r.date,
        r.agent,
        r.certificateId,
        r.transmitted ? "yes" : "no",
      ]
        .map((v) => escape(String(v)))
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `archive-${localDay(new Date())}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${rows.length} records`);
}

function printCertificate(r: CertRow, testTypes: TestType[], center: Center) {
  const tt = testTypeById(r.testTypeId, testTypes);
  const resultTheme: Record<TestResult, { bg: string; fg: string; label: string; note: string }> = {
    negative: { bg: "#ecfdf5", fg: "#047857", label: "NEGATIVE", note: "No SARS-CoV-2 antigen detected." },
    positive: { bg: "#fef2f2", fg: "#b91c1c", label: "POSITIVE", note: "SARS-CoV-2 antigen detected — isolation advised." },
    invalid: { bg: "#fffbeb", fg: "#b45309", label: "INVALID", note: "Test inconclusive — a retest is recommended." },
  };
  const rt = resultTheme[r.result];
  const issued = new Date(r.date + "T00:00").toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" });
  const printedOn = new Date().toLocaleString("en", { dateStyle: "long", timeStyle: "short" });
  const verifyUrl = `${window.location.origin}/verify/${r.certificateId}`;

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${r.certificateId}</title>
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html,body { margin:0; padding:0; }
    body { font-family: 'Inter', ui-sans-serif, system-ui, Arial, sans-serif; color:#0f172a; background:#f1f5f9; }
    .page { position:relative; width:210mm; min-height:297mm; margin:0 auto; background:#fff; padding:0; overflow:hidden; }
    .accent { position:absolute; top:0; left:0; right:0; height:6px; background:linear-gradient(90deg,#4f46e5,#10b981); }
    .wm { position:absolute; top:52%; left:50%; transform:translate(-50%,-50%) rotate(-24deg); font-size:150px; font-weight:800; letter-spacing:6px; color:#0f172a; opacity:0.03; white-space:nowrap; pointer-events:none; }
    .inner { position:relative; padding:56px 56px 40px; }
    header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid #e2e8f0; padding-bottom:24px; }
    .brand { display:flex; gap:14px; align-items:center; }
    .logo { width:46px; height:46px; border-radius:12px; background:#4f46e5; display:flex; align-items:center; justify-content:center; }
    .brand h1 { font-size:19px; font-weight:800; margin:0; letter-spacing:-0.2px; }
    .brand p { font-size:12px; color:#64748b; margin:2px 0 0; }
    .docmeta { text-align:right; font-size:11px; color:#64748b; line-height:1.7; }
    .docmeta b { color:#0f172a; }
    .title { margin:34px 0 6px; font-size:26px; font-weight:800; letter-spacing:-0.4px; }
    .subtitle { font-size:13px; color:#64748b; margin:0 0 30px; }
    .grid { display:flex; gap:28px; }
    .col { flex:1; }
    .section-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; margin:0 0 12px; }
    .field { margin-bottom:14px; }
    .field .k { font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; }
    .field .v { font-size:15px; font-weight:600; margin-top:2px; }
    .result { margin:34px 0; border:1px solid ${rt.fg}22; background:${rt.bg}; border-radius:16px; padding:22px 26px; display:flex; justify-content:space-between; align-items:center; }
    .result .lbl { font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:${rt.fg}; opacity:.85; }
    .result .big { font-size:30px; font-weight:800; color:${rt.fg}; letter-spacing:.5px; margin-top:4px; }
    .result .note { font-size:12px; color:#475569; margin-top:6px; max-width:340px; }
    .qr { width:96px; height:96px; border-radius:12px; background:
        repeating-linear-gradient(90deg,#0f172a 0 6px,#fff 6px 12px),
        repeating-linear-gradient(0deg,#0f172a 0 6px,transparent 6px 12px);
        background-blend-mode:multiply; border:6px solid #fff; box-shadow:0 0 0 1px #e2e8f0; }
    .verify { display:flex; gap:18px; align-items:center; margin-top:6px; }
    .verify .vtext { font-size:11px; color:#64748b; line-height:1.6; }
    .verify .vtext b { color:#0f172a; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }
    .sign { display:flex; justify-content:space-between; align-items:flex-end; margin-top:54px; }
    .sigline { width:220px; border-top:1.5px solid #0f172a; padding-top:6px; font-size:11px; color:#64748b; }
    .stamp { width:96px; height:96px; border-radius:50%; border:2px dashed ${r.transmitted ? "#10b981" : "#cbd5e1"}; color:${r.transmitted ? "#047857" : "#94a3b8"}; display:flex; align-items:center; justify-content:center; text-align:center; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:1px; transform:rotate(-8deg); }
    footer { position:absolute; left:56px; right:56px; bottom:30px; border-top:1px solid #e2e8f0; padding-top:14px; font-size:10px; color:#94a3b8; display:flex; justify-content:space-between; }
  </style></head><body>
  <div class="page">
    <div class="accent"></div>
    <div class="wm">CERTIFIED</div>
    <div class="inner">
      <header>
        <div class="brand">
          <div class="logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div>
            <h1>${center.name || "Rapid Test Center"}</h1>
            <p>${[center.address, center.city].filter(Boolean).join(", ")}${center.phone ? ` · ${center.phone}` : ""}</p>
          </div>
        </div>
        <div class="docmeta">
          Certificate&nbsp;ID<br><b>${r.certificateId}</b><br>
          Reference&nbsp;<b>${r.ref}</b>
        </div>
      </header>

      <div class="title">Official Test Certificate</div>
      <p class="subtitle">SARS-CoV-2 rapid test result issued in accordance with national testing regulations.</p>

      <div class="grid">
        <div class="col">
          <p class="section-label">Tested person</p>
          <div class="field"><div class="k">Full name</div><div class="v">${r.name}</div></div>
          <div class="field"><div class="k">Certificate reference</div><div class="v">${r.ref}</div></div>
        </div>
        <div class="col">
          <p class="section-label">Test details</p>
          <div class="field"><div class="k">Test type</div><div class="v">${tt?.label ?? r.testTypeId}</div></div>
          <div class="field"><div class="k">Date of test</div><div class="v">${issued}</div></div>
        </div>
      </div>

      <div class="result">
        <div>
          <div class="lbl">Test result</div>
          <div class="big">${rt.label}</div>
          <div class="note">${rt.note}</div>
        </div>
        <div class="qr"></div>
      </div>

      <div class="verify">
        <div class="vtext">
          Scan the code or visit <b>${verifyUrl}</b><br>
          to verify the authenticity of this certificate.
        </div>
      </div>

      <div class="sign">
        <div class="sigline">${r.agent} · Authorised test agent</div>
        <div class="stamp">${r.transmitted ? "Reported to<br>Health Office" : "Not<br>Transmitted"}</div>
      </div>
    </div>

    <footer>
      <span>${center.name || "Rapid Test Center"} — GDPR-compliant · Data encrypted</span>
      <span>Generated ${printedOn}</span>
    </footer>
  </div>
  </body></html>`;
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();
  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => iframe.remove(), 1000);
  }, 250);
}

function ArchiveView() {
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

// ---------------------------------------------------------------------------
// Reports & audit
// ---------------------------------------------------------------------------
function Reports() {
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

// ---------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------
function Agents() {
  const { state, hydrate } = useFlux();
  const agents = state.agents;
  const canManage = state.role === "Lead agent" || state.role === "Admin";
  const [editing, setEditing] = useState<Agent | null>(null);
  const [open, setOpen] = useState(false);

  function openAdd() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(a: Agent) {
    setEditing(a);
    setOpen(true);
  }
  async function save(a: Agent) {
    const exists = agents.some((x) => x.id === a.id);
    try {
      if (exists) await updateAgentApi(a);
      else await createAgentApi(a);
      hydrate(await loadRealAppState());
      toast.success(exists ? "Agent updated" : `${a.firstName} ${a.lastName} added`);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Agent could not be saved");
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Active agents" value={agents.filter((a) => a.status === "active").length} icon={<BadgeCheck className="h-4.5 w-4.5" />} tone="success" />
        <KpiCard label="Checked in today" value={agents.reduce((s, a) => s + a.checkedInToday, 0)} icon={<Timer className="h-4.5 w-4.5" />} tone="violet" />
        <KpiCard label="Results emitted today" value={agents.reduce((s, a) => s + a.resultsToday, 0)} icon={<Activity className="h-4.5 w-4.5" />} tone="info" />
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="font-[var(--font-display)] font-semibold">Agents</h3>
          {canManage && (
            <button onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4" /> Add agent
            </button>
          )}
        </div>
        <div className="divide-y divide-border">
          {agents.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                {a.firstName[0]}{a.lastName[0]}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{a.firstName} {a.lastName}</div>
                <div className="text-xs text-muted-foreground">{a.email}</div>
              </div>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">{a.role}</span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${a.status === "active" ? "text-[color:var(--success)]" : "text-muted-foreground"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${a.status === "active" ? "bg-success" : "bg-muted-foreground"}`} />
                {a.status === "active" ? "Active" : "Away"}
              </span>
              <div className="hidden text-right text-xs text-muted-foreground md:block">
                <div>{a.checkedInToday} check-ins · {a.resultsToday} results</div>
                <div>Last active {a.lastActive}</div>
              </div>
              {canManage && (
                <button onClick={() => openEdit(a)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary">Edit</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {open && <AgentModal agent={editing} onClose={() => setOpen(false)} onSave={save} />}
    </div>
  );
}

function AgentModal({ agent, onClose, onSave }: { agent: Agent | null; onClose: () => void; onSave: (a: Agent) => void | Promise<void> }) {
  const [username, setUsername] = useState(agent?.username ?? "");
  const [firstName, setFirstName] = useState(agent?.firstName ?? "");
  const [lastName, setLastName] = useState(agent?.lastName ?? "");
  const [email, setEmail] = useState(agent?.email ?? "");
  const [role, setRole] = useState<Agent["role"]>(agent?.role ?? "Agent");
  const [status, setStatus] = useState<Agent["status"]>(agent?.status ?? "active");
  const [emailTouched, setEmailTouched] = useState(false);

  const emailError = validateEmail(email);
  const valid = username.trim() !== "" && firstName.trim() !== "" && lastName.trim() !== "" && !emailError;

  function submit() {
    if (!valid) return;
    onSave({
      id: agent?.id ?? draftId("agent"),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      username: username.trim(),
      role,
      status,
      checkedInToday: agent?.checkedInToday ?? 0,
      resultsToday: agent?.resultsToday ?? 0,
      lastActive: agent?.lastActive ?? "just now",
    });
  }

  return (
    <Modal
      title={agent ? "Edit agent" : "Add agent"}
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton disabled={!valid} onClick={submit}>{agent ? "Save changes" : "Add agent"}</PrimaryButton>
        </>
      }
    >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ModalField label="Username" value={username} onChange={setUsername} required />
          </div>
          <ModalField label="First name" value={firstName} onChange={setFirstName} required />
          <ModalField label="Last name" value={lastName} onChange={setLastName} required />
          <div className="sm:col-span-2">
            <ModalField label="Email" type="email" value={email} onChange={setEmail} onBlur={() => setEmailTouched(true)} error={emailTouched ? emailError : null} required />
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Agent["role"])}
              className="w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="Lead agent">Lead agent</option>
              <option value="Agent">Agent</option>
              <option value="Admin">Admin</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Agent["status"])}
              className="w-full rounded-xl border border-border bg-input-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="active">Active</option>
              <option value="away">Away</option>
            </select>
          </label>
        </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
function Settings() {
  const tabs = ["Basic data", "Health office", "Test types", "Opening times", "Slot settings", "Test kits"];
  const [tab, setTab] = useState(tabs[0]);
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <nav className="flex gap-1 overflow-x-auto lg:flex-col">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
              tab === t ? "bg-card text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:bg-card/60"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className="space-y-5">
        {tab === "Basic data" && <BasicData />}
        {tab === "Health office" && <HealthOfficeSettings />}
        {tab === "Test types" && <TestTypesSettings />}
        {tab === "Opening times" && <OpeningTimes />}
        {tab === "Slot settings" && <SlotSettings />}
        {tab === "Test kits" && <TestKits />}
      </div>
    </div>
  );
}

function SettingsCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h3 className="font-[var(--font-display)] font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SettingField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="grid gap-1.5 sm:grid-cols-[200px_1fr] sm:items-center sm:gap-4">
      <span className="text-sm font-medium">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-border bg-input-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
    </label>
  );
}

function BasicData() {
  const { state, hydrate } = useFlux();
  const center = state.center;
  const [name, setName] = useState(center.name);
  const [address, setAddress] = useState(center.address);
  const [postalCode, setPostalCode] = useState(String(center.postalCode ?? ""));
  const [city, setCity] = useState(center.city);
  const [country, setCountry] = useState(center.country ?? "");
  const [logo, setLogo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(center.name);
    setAddress(center.address);
    setPostalCode(String(center.postalCode ?? ""));
    setCity(center.city);
    setCountry(center.country ?? "");
  }, [center]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function save() {
    setSaving(true);
    try {
      await saveSettings({
        ...state.center,
        name,
        address,
        postalCode,
        city,
        country,
        logo: logo ?? state.center.logo,
        testTypes: state.testTypes,
        kits: state.kits,
        activeKitId: state.activeKitId,
      });
      hydrate(await loadRealAppState());
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Settings could not be saved");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard title="Basic data" desc="Your test center's public identity.">
      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-secondary text-primary">
          {logo ? <img src={logo} alt="Center logo" className="h-full w-full object-cover" /> : <Building2 className="h-7 w-7" />}
        </span>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        <button onClick={() => fileRef.current?.click()} className="rounded-xl border border-dashed border-border px-4 py-2 text-sm font-medium hover:bg-secondary">
          {logo ? "Change logo" : "Upload logo"}
        </button>
        {logo && (
          <button onClick={() => setLogo(null)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Remove
          </button>
        )}
      </div>
      <SettingField label="Center name" value={name} onChange={setName} />
      <SettingField label="Address" value={address} onChange={setAddress} />
      <SettingField label="Postal code" value={postalCode} onChange={setPostalCode} />
      <SettingField label="City" value={city} onChange={setCity} />
      <SettingField label="Country" value={country} onChange={setCountry} />
      <div className="flex justify-end border-t border-border pt-4">
        <PrimaryButton disabled={saving} onClick={() => void save()}>{saving ? "Saving..." : "Save settings"}</PrimaryButton>
      </div>
    </SettingsCard>
  );
}

function HealthOfficeSettings() {
  const { state, hydrate } = useFlux();
  const [email, setEmail] = useState(state.center.healthOfficeEmail ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => setEmail(state.center.healthOfficeEmail ?? ""), [state.center.healthOfficeEmail]);

  async function save() {
    setSaving(true);
    try {
      await saveSettings({ ...state.center, healthOfficeEmail: email, testTypes: state.testTypes, kits: state.kits, activeKitId: state.activeKitId });
      hydrate(await loadRealAppState());
      toast.success("Health office settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Settings could not be saved");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard title="Health office & email" desc="Where positive results and reports are sent.">
      <SettingField label="Health office email" value={email} onChange={setEmail} />
      <div className="flex justify-end border-t border-border pt-4">
        <PrimaryButton disabled={saving} onClick={() => void save()}>{saving ? "Saving..." : "Save settings"}</PrimaryButton>
      </div>
    </SettingsCard>
  );
}

function SlotSettings() {
  const { state, hydrate } = useFlux();
  const [maxPerSlot, setMaxPerSlot] = useState(String(state.center.maxPerSlot ?? ""));
  const [saving, setSaving] = useState(false);

  useEffect(() => setMaxPerSlot(String(state.center.maxPerSlot ?? "")), [state.center.maxPerSlot]);

  async function save() {
    setSaving(true);
    try {
      await saveSettings({ ...state.center, maxPerSlot: Number(maxPerSlot), testTypes: state.testTypes, kits: state.kits, activeKitId: state.activeKitId });
      hydrate(await loadRealAppState());
      toast.success("Slot settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Settings could not be saved");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard title="Slot settings" desc="Capacity logic for each 15-minute slot.">
      <SettingField label="Max persons per slot" type="number" value={maxPerSlot} onChange={setMaxPerSlot} />
      <p className="text-sm text-muted-foreground">Each slot accepts up to this many persons across all bookings. Full slots are hidden from the public booking flow automatically.</p>
      <div className="flex justify-end border-t border-border pt-4">
        <PrimaryButton disabled={saving} onClick={() => void save()}>{saving ? "Saving..." : "Save settings"}</PrimaryButton>
      </div>
    </SettingsCard>
  );
}

function TestTypesSettings() {
  const { state, hydrate } = useFlux();
  const types = state.testTypes;
  const [editing, setEditing] = useState<TestType | null>(null);
  const [open, setOpen] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function persist(nextTypes: TestType[], success: string) {
    try {
      await saveSettings({ ...state.center, testTypes: nextTypes, kits: state.kits, activeKitId: state.activeKitId });
      hydrate(await loadRealAppState());
      toast.success(success);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Test types could not be saved");
    } finally {
      setSavingId(null);
    }
  }

  function toggle(id: string) {
    setSavingId(id);
    void persist(types.map((type) => (type.id === id ? { ...type, active: !type.active } : type)), "Test type updated");
  }
  function save(t: TestType) {
    setSavingId(t.id);
    const nextTypes = types.some((type) => type.id === t.id)
      ? types.map((type) => (type.id === t.id ? t : type))
      : [...types, t];
    void persist(nextTypes, "Test type saved");
    setOpen(false);
  }

  return (
    <SettingsCard title="Test types" desc="Manage the tests offered in your booking flow.">
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-2.5 font-medium">Label</th><th className="px-4 py-2.5 font-medium">Price</th><th className="px-4 py-2.5 font-medium">Active</th><th /></tr>
          </thead>
          <tbody>
            {types.map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{t.label}</td>
                <td className="px-4 py-3">{priceLabel(t.price)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggle(t.id)}
                    disabled={savingId === t.id}
                    role="switch"
                    aria-checked={t.active}
                    aria-label={`${t.label} active`}
                    className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 ${t.active ? "justify-end bg-success" : "justify-start bg-border"}`}
                  >
                    <span className="h-4 w-4 rounded-full bg-white shadow" />
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setEditing(t); setOpen(true); }} className="text-xs font-medium text-primary hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={() => { setEditing(null); setOpen(true); }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
        <Plus className="h-4 w-4" /> Add test type
      </button>

      {open && <TestTypeModal type={editing} onClose={() => setOpen(false)} onSave={save} />}
    </SettingsCard>
  );
}

function TestTypeModal({ type, onClose, onSave }: { type: TestType | null; onClose: () => void; onSave: (t: TestType) => void }) {
  const [label, setLabel] = useState(type?.label ?? "");
  const [price, setPrice] = useState(type ? String(type.price) : "0");
  const [durationMin, setDurationMin] = useState(type ? String(type.durationMin) : "15");
  const [description, setDescription] = useState(type?.description ?? "");
  const [active, setActive] = useState(type?.active ?? true);

  const valid = label.trim() !== "" && !Number.isNaN(Number(price)) && !Number.isNaN(Number(durationMin));

  function submit() {
    if (!valid) return;
    onSave({
      id: type?.id ?? draftId("test-type"),
      label: label.trim(),
      price: Number(price),
      durationMin: Number(durationMin),
      description: description.trim(),
      badge: type?.badge,
      active,
    });
  }

  return (
    <Modal
      title={type ? "Edit test type" : "Add test type"}
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton disabled={!valid} onClick={submit}>{type ? "Save changes" : "Add test type"}</PrimaryButton>
        </>
      }
    >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ModalField label="Label" value={label} onChange={setLabel} required />
          </div>
          <ModalField label="Price (€)" type="number" value={price} onChange={setPrice} required />
          <ModalField label="Duration (min)" type="number" value={durationMin} onChange={setDurationMin} required />
          <div className="sm:col-span-2">
            <ModalField label="Description" value={description} onChange={setDescription} />
          </div>
          <label className="flex cursor-pointer items-center gap-3 sm:col-span-2">
            <button
              type="button"
              onClick={() => setActive((v) => !v)}
              role="switch"
              aria-checked={active}
              className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 ${active ? "justify-end bg-success" : "justify-start bg-border"}`}
            >
              <span className="h-4 w-4 rounded-full bg-white shadow" />
            </button>
            <span className="text-sm font-medium">Active in booking flow</span>
          </label>
        </div>
    </Modal>
  );
}

interface DayHours {
  day: string;
  open: boolean;
  from: string;
  to: string;
}

function OpeningTimes() {
  const { state, hydrate } = useFlux();
  const loadedHours = useMemo(() => centerOpeningHours(state.center), [state.center]);
  const [hours, setHours] = useState<DayHours[]>(loadedHours);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setHours(loadedHours);
  }, [loadedHours]);

  function update(day: string, patch: Partial<DayHours>) {
    setHours((prev) => prev.map((h) => (h.day === day ? { ...h, ...patch } : h)));
  }

  async function save() {
    setSaving(true);
    try {
      await saveSettings({
        ...state.center,
        openingTimes: hoursToOpeningTimes(hours),
        testTypes: state.testTypes,
        kits: state.kits,
        activeKitId: state.activeKitId,
      });
      hydrate(await loadRealAppState());
      toast.success("Opening times saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Opening times could not be saved");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard title="Opening times" desc="Weekly schedule for available slots.">
      <div className="space-y-2">
        {hours.length === 0 && <p className="px-1 text-sm text-muted-foreground">No opening times configured.</p>}
        {hours.map((h) => (
          <div key={h.day} className="flex items-center gap-3 rounded-xl border border-border px-4 py-2.5">
            <span className="w-28 text-sm font-medium">{h.day}</span>
            <button
              type="button"
              onClick={() => update(h.day, { open: !h.open })}
              role="switch"
              aria-checked={h.open}
              aria-label={`${h.day} open`}
              className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 ${h.open ? "justify-end bg-success" : "justify-start bg-border"}`}
            >
              <span className="h-4 w-4 rounded-full bg-white shadow" />
            </button>
            {h.open ? (
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="time"
                  value={h.from}
                  onChange={(e) => update(h.day, { from: e.target.value })}
                  className="w-28 rounded-lg border border-border bg-input-background px-2 py-1.5 text-center outline-none focus:ring-2 focus:ring-primary/40 [color-scheme:light]"
                />
                <span className="text-muted-foreground">–</span>
                <input
                  type="time"
                  value={h.to}
                  onChange={(e) => update(h.day, { to: e.target.value })}
                  className="w-28 rounded-lg border border-border bg-input-background px-2 py-1.5 text-center outline-none focus:ring-2 focus:ring-primary/40 [color-scheme:light]"
                />
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Closed</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end border-t border-border pt-4">
        <PrimaryButton disabled={saving} onClick={() => void save()}>{saving ? "Saving..." : "Save opening times"}</PrimaryButton>
      </div>
    </SettingsCard>
  );
}

function centerOpeningHours(center: Center): DayHours[] {
  const openingTimes = center.openingTimes ?? {};
  const days = [
    ["Mo", "Monday"],
    ["Tu", "Tuesday"],
    ["We", "Wednesday"],
    ["Th", "Thursday"],
    ["Fr", "Friday"],
    ["Sa", "Saturday"],
    ["Su", "Sunday"],
  ] as const;
  return days.flatMap(([key, day]) => {
    const opening = openingTimes[key] ?? openingTimes[day.toLowerCase()];
    if (!opening) return [];
    return [{
      day,
      open: Boolean(opening.isOpen),
      from: opening.from ?? "",
      to: opening.to ?? "",
    }];
  });
}

function hoursToOpeningTimes(hours: DayHours[]): Center["openingTimes"] {
  const keys: Record<string, string> = {
    Monday: "Mo",
    Tuesday: "Tu",
    Wednesday: "We",
    Thursday: "Th",
    Friday: "Fr",
    Saturday: "Sa",
    Sunday: "Su",
  };
  return hours.reduce<NonNullable<Center["openingTimes"]>>((openingTimes, hour) => {
    openingTimes[keys[hour.day] ?? hour.day] = {
      isOpen: hour.open,
      from: hour.from,
      to: hour.to,
    };
    return openingTimes;
  }, {});
}

function TestKits() {
  const { state, hydrate } = useFlux();
  const [kits, setKits] = useState(state.kits);
  const [activeId, setActiveId] = useState(state.activeKitId);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setKits(state.kits);
    setActiveId(state.activeKitId);
  }, [state.activeKitId, state.kits]);

  function add() {
    const name = newName.trim();
    if (!name) return;
    const id = draftId("kit");
    setKits((prev) => [...prev, { id, name }]);
    setActiveId((prev) => prev || id);
    setNewName("");
    setAdding(false);
  }

  async function save() {
    setSaving(true);
    try {
      await saveSettings({ ...state.center, testTypes: state.testTypes, kits, activeKitId: activeId });
      hydrate(await loadRealAppState());
      toast.success("Test kits saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Test kits could not be saved");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard title="Test kits" desc="Only one kit can be active at a time.">
      <div className="space-y-2">
        {kits.map((k) => {
          const active = k.id === activeId;
          return (
            <label key={k.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-4 py-3">
              <input
                type="radio"
                name="kit"
                checked={active}
                onChange={() => setActiveId(k.id)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              <span className="flex-1 text-sm font-medium">{k.name}</span>
              {active && <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-[color:var(--success)]">Active</span>}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setKits((prev) => prev.filter((kit) => kit.id !== k.id));
                  if (activeId === k.id) setActiveId(kits.find((kit) => kit.id !== k.id)?.id ?? "");
                }}
                className="text-xs font-medium text-muted-foreground hover:text-[color:var(--danger)]"
              >
                Remove
              </button>
            </label>
          );
        })}
        {kits.length === 0 && <p className="px-1 text-sm text-muted-foreground">No test kits configured.</p>}
      </div>

      {adding ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Test kit name…"
            className="flex-1 rounded-xl border border-border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button type="button" onClick={add} disabled={!newName.trim()} className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-40">
            Add
          </button>
          <button type="button" onClick={() => { setAdding(false); setNewName(""); }} className="rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-secondary">
            Cancel
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          <Plus className="h-4 w-4" /> Add test kit
        </button>
      )}
      <div className="flex justify-end border-t border-border pt-4">
        <PrimaryButton disabled={saving} onClick={() => void save()}>{saving ? "Saving..." : "Save test kits"}</PrimaryButton>
      </div>
    </SettingsCard>
  );
}

function draftId(prefix: string) {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  const values = new Uint32Array(2);
  globalThis.crypto?.getRandomValues(values);
  const token = Array.from(values, (value) => value.toString(36)).join("");
  return `${prefix}-${token}`;
}

// ---------------------------------------------------------------------------
// Future pages
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// New appointment drawer
// ---------------------------------------------------------------------------
function NewAppointmentDrawer({ onClose }: { onClose: () => void }) {
  const { state, hydrate } = useFlux();
  const activeTypes = state.testTypes.filter((t) => t.active);
  const [testTypeId, setTestTypeId] = useState(activeTypes[0]?.id ?? "");
  const [time, setTime] = useState("14:30");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!testTypeId && activeTypes[0]) setTestTypeId(activeTypes[0].id);
  }, [activeTypes, testTypeId]);

  const emailError = validateEmail(email);
  const testType = activeTypes.find((type) => type.id === testTypeId);
  const valid = firstName.trim() !== "" && !emailError && Boolean(testType);

  async function create() {
    if (!valid) return;
    setSubmitting(true);
    try {
      await createBooking({
        center: state.center,
        testType: testType as TestType,
        startsAt: appointmentIsoForToday(time),
        persons: [{
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          city: state.center.city || "",
          dob,
        }],
        consentAccepted: true,
      });
      hydrate(await loadRealAppState());
      toast.success(`Appointment created for ${firstName} ${lastName}`);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Appointment could not be created");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col bg-card shadow-2xl" role="dialog" aria-modal="true" aria-label="New appointment">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-[var(--font-display)] text-lg font-bold">New appointment</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div>
            <div className="mb-2 text-sm font-semibold">Test type</div>
            <div className="grid gap-2">
              {activeTypes.map((t) => (
                <label key={t.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-2.5 hover:border-primary/40">
                  <input type="radio" name="ntt" checked={testTypeId === t.id} onChange={() => setTestTypeId(t.id)} className="h-4 w-4 accent-[var(--primary)]" />
                  <span className="flex-1 text-sm font-medium">{t.label}</span>
                  <span className="text-sm font-semibold text-primary">{priceLabel(t.price)}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Time" type="time" value={time} onChange={setTime} />
            <div />
            <Field label="First name" value={firstName} onChange={setFirstName} required />
            <Field label="Last name" value={lastName} onChange={setLastName} />
            <div className="col-span-2"><Field label="Email" type="email" value={email} onChange={setEmail} onBlur={() => setEmailTouched(true)} error={emailTouched ? emailError : null} required /></div>
            <Field label="Phone" value={phone} onChange={setPhone} />
            <Field label="Date of birth" type="date" value={dob} onChange={setDob} />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton disabled={!valid || submitting} onClick={() => void create()}>{submitting ? "Creating..." : "Create appointment"}</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function appointmentIsoForToday(time: string) {
  const [hours, minutes] = time.split(":").map((part) => Number(part));
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date.toISOString();
}
