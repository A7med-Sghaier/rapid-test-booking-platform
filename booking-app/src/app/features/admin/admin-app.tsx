import { useEffect, useState } from "react";
import { useI18n } from "../../lib/i18n";
import { clearAuthToken, hasAuthToken } from "../../lib/api";
import { CommandPalette } from "../../components/command-palette";
import { ALL_SECTIONS, type Section, sectionFromUrl } from "./nav";
import { AdminLogin } from "./login";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Dashboard } from "./dashboard";
import { TodayOps } from "./today";
import { Appointments } from "./appointments";
import { TestPersons } from "./patients";
import { ArchiveView } from "./archive";
import { Reports } from "./reports";
import { Agents } from "./agents";
import { Settings } from "./settings/settings";
import { NewAppointmentDrawer } from "./new-appointment-drawer";

/**
 * Admin/operations console. Handles auth gating, URL-synced section routing and
 * the ⌘K command palette, then renders the sidebar/topbar shell around the
 * active section's feature view.
 */
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
