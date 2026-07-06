import {
  Archive,
  BadgeCheck,
  CalendarDays,
  Clock,
  FileText,
  LayoutDashboard,
  Settings as SettingsIcon,
  Users,
} from "lucide-react";

export type Section =
  | "dashboard"
  | "today"
  | "appointments"
  | "agents"
  | "settings"
  | "patients"
  | "archive"
  | "reports";

export const NAV: { key: Section; label: string; icon: typeof LayoutDashboard; soon?: boolean }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "today", label: "Today", icon: Clock },
  { key: "appointments", label: "Appointments", icon: CalendarDays },
  { key: "patients", label: "Test persons", icon: Users },
  { key: "archive", label: "Archive", icon: Archive },
  { key: "agents", label: "Agents", icon: BadgeCheck },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

export const NAV_SECONDARY: { key: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "reports", label: "Reports & audit", icon: FileText },
];

export const ALL_SECTIONS = [...NAV, ...NAV_SECONDARY];

/** Resolve the active admin section from the /admin/<section> URL. */
export function sectionFromUrl(): Section {
  const m = window.location.pathname.toLowerCase().match(/\/admin\/([a-z]+)/);
  const key = m?.[1] as Section | undefined;
  return key && ALL_SECTIONS.some((n) => n.key === key) ? key : "dashboard";
}
