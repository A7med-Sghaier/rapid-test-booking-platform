import { useEffect, useRef, useState } from "react";
import { Building2 } from "lucide-react";
import { toast } from "sonner";
import { PrimaryButton } from "../../../shared";
import { useFlux } from "../../../store/flux-store";
import { loadRealAppState, saveSettings } from "../../../lib/api";
import { SettingsCard, SettingField } from "./settings-card";

/** Center identity settings: logo upload plus name and address fields. */
export function BasicData() {
  const { state, hydrate } = useFlux();
  const center = state.center;
  const [name, setName] = useState(center.name);
  const [address, setAddress] = useState(center.address);
  const [postalCode, setPostalCode] = useState(String(center.postalCode ?? ""));
  const [city, setCity] = useState(center.city);
  const [country, setCountry] = useState(center.country ?? "");
  const [logo, setLogo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(center.name);
    setAddress(center.address);
    setPostalCode(String(center.postalCode ?? ""));
    setCity(center.city);
    setCountry(center.country ?? "");
  }, [center]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function save() {
    setSaving(true);
    try {
      await saveSettings({
        ...state.center,
        name,
        address,
        postalCode,
        city,
        country,
        logo: logo ?? state.center.logo,
        testTypes: state.testTypes,
        kits: state.kits,
        activeKitId: state.activeKitId,
      });
      hydrate(await loadRealAppState());
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Settings could not be saved");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard title="Basic data" desc="Your test center's public identity.">
      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-secondary text-primary">
          {logo ? <img src={logo} alt="Center logo" className="h-full w-full object-cover" /> : <Building2 className="h-7 w-7" />}
        </span>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        <button onClick={() => fileRef.current?.click()} className="rounded-xl border border-dashed border-border px-4 py-2 text-sm font-medium hover:bg-secondary">
          {logo ? "Change logo" : "Upload logo"}
        </button>
        {logo && (
          <button onClick={() => setLogo(null)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Remove
          </button>
        )}
      </div>
      <SettingField label="Center name" value={name} onChange={setName} />
      <SettingField label="Address" value={address} onChange={setAddress} />
      <SettingField label="Postal code" value={postalCode} onChange={setPostalCode} />
      <SettingField label="City" value={city} onChange={setCity} />
      <SettingField label="Country" value={country} onChange={setCountry} />
      <div className="flex justify-end border-t border-border pt-4">
        <PrimaryButton disabled={saving} onClick={() => void save()}>{saving ? "Saving..." : "Save settings"}</PrimaryButton>
      </div>
    </SettingsCard>
  );
}
