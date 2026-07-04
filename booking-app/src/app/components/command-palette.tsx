import { Command } from "cmdk";
import { CalendarDays, LayoutDashboard, Plus, Search, User } from "lucide-react";
import { useFlux } from "../store/flux-store";
import { testTypeById } from "./data";

export function CommandPalette({
  open,
  onClose,
  onNavigate,
  onNewAppointment,
  sections,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (key: string) => void;
  onNewAppointment: () => void;
  sections: { key: string; label: string }[];
}) {
  const { state } = useFlux();
  if (!open) return null;

  const run = (fn: () => void) => {
    fn();
    onClose();
  };

  const patients = state.patients.slice(0, 6);
  const appts = state.appointments.slice(0, 6);

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 p-4 pt-[12vh]" onClick={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Command palette" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground">
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Command.Input
              autoFocus
              placeholder="Jump to a section, patient or appointment…"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">Esc</kbd>
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">No results found.</Command.Empty>

            <Command.Group heading="Actions">
              <Item onSelect={() => run(onNewAppointment)}>
                <Plus className="h-4 w-4 text-primary" /> New appointment
              </Item>
            </Command.Group>

            <Command.Group heading="Navigate">
              {sections.map((s) => (
                <Item key={s.key} value={`go ${s.label}`} onSelect={() => run(() => onNavigate(s.key))}>
                  <LayoutDashboard className="h-4 w-4 text-muted-foreground" /> {s.label}
                </Item>
              ))}
            </Command.Group>

            <Command.Group heading="Patients">
              {patients.map((p) => (
                <Item key={p.id} value={`patient ${p.firstName} ${p.lastName} ${p.email}`} onSelect={() => run(() => onNavigate("patients"))}>
                  <User className="h-4 w-4 text-muted-foreground" /> {p.firstName} {p.lastName}
                  <span className="ml-auto text-xs text-muted-foreground">{p.city}</span>
                </Item>
              ))}
            </Command.Group>

            <Command.Group heading="Recent appointments">
              {appts.map((a) => (
                <Item key={a.id} value={`appt ${a.person.firstName} ${a.person.lastName} ${a.ref}`} onSelect={() => run(() => onNavigate("appointments"))}>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" /> {a.person.firstName} {a.person.lastName}
                  <span className="ml-auto text-xs text-muted-foreground">{testTypeById(a.testTypeId, state.testTypes)?.label}</span>
                </Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function Item({ children, onSelect, value }: { children: React.ReactNode; onSelect: () => void; value?: string }) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-secondary"
    >
      {children}
    </Command.Item>
  );
}
