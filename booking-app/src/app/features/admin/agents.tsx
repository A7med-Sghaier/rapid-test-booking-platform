import { useState } from "react";
import { toast } from "sonner";
import { Activity, BadgeCheck, Plus, Timer } from "lucide-react";
import type { Agent } from "../../components/data";
import { Field as ModalField, GhostButton, KpiCard, Modal, PrimaryButton } from "../../shared";
import { useFlux } from "../../store/flux-store";
import { addAgent as createAgentApi, loadRealAppState, updateAgent as updateAgentApi } from "../../lib/api";
import { validateEmail } from "../../lib/validation";
import { draftId } from "./lib/id";

/** Agent roster with role/status and add/edit management for privileged users. */
export function Agents() {
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
