import { ChevronLeft, ChevronRight, type LayoutDashboard, LogOut, X } from "lucide-react";
import { Logo } from "../../shared";
import { useI18n } from "../../lib/i18n";
import { type Role, useFlux } from "../../store/flux-store";
import { NAV, NAV_SECONDARY, type Section } from "./nav";

/** Collapsible admin sidebar with primary + enterprise navigation and role switch. */
export function Sidebar({
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
