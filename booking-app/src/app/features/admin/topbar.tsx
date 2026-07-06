import { Bell, Menu, Plus, Search } from "lucide-react";
import { useFlux } from "../../store/flux-store";
import { LanguageToggle, useI18n } from "../../lib/i18n";

/** Sticky admin header: page title, command search, new-appointment and profile. */
export function Topbar({ title, onMenu, onNew, onSearch }: { title: string; onMenu: () => void; onNew: () => void; onSearch: () => void }) {
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
