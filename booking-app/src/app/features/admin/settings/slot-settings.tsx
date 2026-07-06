import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PrimaryButton } from "../../../shared";
import { useFlux } from "../../../store/flux-store";
import { loadRealAppState, saveSettings } from "../../../lib/api";
import { SettingsCard, SettingField } from "./settings-card";

/** Per-slot capacity settings that drive public availability. */
export function SlotSettings() {
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
