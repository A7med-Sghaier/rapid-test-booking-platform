import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PrimaryButton } from "../../../shared";
import { useFlux } from "../../../store/flux-store";
import { loadRealAppState, saveSettings } from "../../../lib/api";
import { draftId } from "../lib/id";
import { SettingsCard } from "./settings-card";

/** Manage test kits; exactly one kit is active at a time. */
export function TestKits() {
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
