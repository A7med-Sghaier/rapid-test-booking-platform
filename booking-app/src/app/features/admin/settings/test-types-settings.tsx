import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { TestType } from "../../../components/data";
import { priceLabel } from "../../../components/data";
import { Field as ModalField, GhostButton, Modal, PrimaryButton } from "../../../shared";
import { useFlux } from "../../../store/flux-store";
import { loadRealAppState, saveSettings } from "../../../lib/api";
import { draftId } from "../lib/id";
import { SettingsCard } from "./settings-card";

/** Manage the catalogue of test types offered in the public booking flow. */
export function TestTypesSettings() {
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
