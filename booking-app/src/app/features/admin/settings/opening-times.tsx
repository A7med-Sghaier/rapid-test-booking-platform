import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Center } from "../../../components/data";
import { PrimaryButton } from "../../../shared";
import { useFlux } from "../../../store/flux-store";
import { loadRealAppState, saveSettings } from "../../../lib/api";
import { SettingsCard } from "./settings-card";

interface DayHours {
  day: string;
  open: boolean;
  from: string;
  to: string;
}

/** Weekly opening-hours editor that drives available booking slots. */
export function OpeningTimes() {
  const { state, hydrate } = useFlux();
  const loadedHours = useMemo(() => centerOpeningHours(state.center), [state.center]);
  const [hours, setHours] = useState<DayHours[]>(loadedHours);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setHours(loadedHours);
  }, [loadedHours]);

  function update(day: string, patch: Partial<DayHours>) {
    setHours((prev) => prev.map((h) => (h.day === day ? { ...h, ...patch } : h)));
  }

  async function save() {
    setSaving(true);
    try {
      await saveSettings({
        ...state.center,
        openingTimes: hoursToOpeningTimes(hours),
        testTypes: state.testTypes,
        kits: state.kits,
        activeKitId: state.activeKitId,
      });
      hydrate(await loadRealAppState());
      toast.success("Opening times saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Opening times could not be saved");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard title="Opening times" desc="Weekly schedule for available slots.">
      <div className="space-y-2">
        {hours.length === 0 && <p className="px-1 text-sm text-muted-foreground">No opening times configured.</p>}
        {hours.map((h) => (
          <div key={h.day} className="flex items-center gap-3 rounded-xl border border-border px-4 py-2.5">
            <span className="w-28 text-sm font-medium">{h.day}</span>
            <button
              type="button"
              onClick={() => update(h.day, { open: !h.open })}
              role="switch"
              aria-checked={h.open}
              aria-label={`${h.day} open`}
              className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 ${h.open ? "justify-end bg-success" : "justify-start bg-border"}`}
            >
              <span className="h-4 w-4 rounded-full bg-white shadow" />
            </button>
            {h.open ? (
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="time"
                  value={h.from}
                  onChange={(e) => update(h.day, { from: e.target.value })}
                  className="w-28 rounded-lg border border-border bg-input-background px-2 py-1.5 text-center outline-none focus:ring-2 focus:ring-primary/40 [color-scheme:light]"
                />
                <span className="text-muted-foreground">–</span>
                <input
                  type="time"
                  value={h.to}
                  onChange={(e) => update(h.day, { to: e.target.value })}
                  className="w-28 rounded-lg border border-border bg-input-background px-2 py-1.5 text-center outline-none focus:ring-2 focus:ring-primary/40 [color-scheme:light]"
                />
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Closed</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end border-t border-border pt-4">
        <PrimaryButton disabled={saving} onClick={() => void save()}>{saving ? "Saving..." : "Save opening times"}</PrimaryButton>
      </div>
    </SettingsCard>
  );
}

function centerOpeningHours(center: Center): DayHours[] {
  const openingTimes = center.openingTimes ?? {};
  const days = [
    ["Mo", "Monday"],
    ["Tu", "Tuesday"],
    ["We", "Wednesday"],
    ["Th", "Thursday"],
    ["Fr", "Friday"],
    ["Sa", "Saturday"],
    ["Su", "Sunday"],
  ] as const;
  return days.flatMap(([key, day]) => {
    const opening = openingTimes[key] ?? openingTimes[day.toLowerCase()];
    if (!opening) return [];
    return [{
      day,
      open: Boolean(opening.isOpen),
      from: opening.from ?? "",
      to: opening.to ?? "",
    }];
  });
}

function hoursToOpeningTimes(hours: DayHours[]): Center["openingTimes"] {
  const keys: Record<string, string> = {
    Monday: "Mo",
    Tuesday: "Tu",
    Wednesday: "We",
    Thursday: "Th",
    Friday: "Fr",
    Saturday: "Sa",
    Sunday: "Su",
  };
  return hours.reduce<NonNullable<Center["openingTimes"]>>((openingTimes, hour) => {
    openingTimes[keys[hour.day] ?? hour.day] = {
      isOpen: hour.open,
      from: hour.from,
      to: hour.to,
    };
    return openingTimes;
  }, {});
}
