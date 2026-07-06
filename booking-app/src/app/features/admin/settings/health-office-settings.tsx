import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PrimaryButton } from "../../../shared";
import { useFlux } from "../../../store/flux-store";
import { loadRealAppState, saveSettings } from "../../../lib/api";
import { SettingsCard, SettingField } from "./settings-card";

/** Health-office email settings — where positive results and reports are sent. */
export function HealthOfficeSettings() {
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
