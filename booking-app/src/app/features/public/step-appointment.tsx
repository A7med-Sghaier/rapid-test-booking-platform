import { useMemo, useState } from "react";
import type { Center } from "../../components/data";
import type { BookedSlot } from "../../store/flux-store";
import type { SelectedSlot } from "./types";
import { buildSlotGroups, slotIcon } from "./slots";

/** Step 2 — choose a day and an available time slot. */
export function StepAppointment({
  center,
  bookedSlots,
  selected,
  onSelect,
}: {
  center: Center;
  bookedSlots: BookedSlot[];
  selected: SelectedSlot | null;
  onSelect: (slot: SelectedSlot) => void;
}) {
  const [day, setDay] = useState(0);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
  const groups = useMemo(() => buildSlotGroups(center, bookedSlots, days[day]), [bookedSlots, center, days, day]);
  const totalSlots = groups.reduce((sum, group) => sum + group.slots.length, 0);

  return (
    <div>
      <div className="flex items-center justify-end">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-[color:var(--success)]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Backend availability
        </span>
      </div>

      {/* Date strip */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {days.map((d, i) => {
          const active = i === day;
          return (
            <button
              key={i}
              onClick={() => setDay(i)}
              className={`flex min-w-[64px] flex-col items-center rounded-xl border px-3 py-2.5 transition-colors ${
                active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-secondary"
              }`}
            >
              <span className="text-[11px] uppercase opacity-80">{d.toLocaleDateString("en", { weekday: "short" })}</span>
              <span className="font-[var(--font-display)] text-lg font-bold">{d.getDate()}</span>
            </button>
          );
        })}
      </div>

      {/* Slot groups */}
      {totalSlots === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <div className="font-semibold">No slots available</div>
          <p className="mt-1 text-sm text-muted-foreground">The selected day is closed or all configured slots are full.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
        {groups.map((group) => {
          const Icon = slotIcon[group.name];
          return (
            <div key={group.name}>
              <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                <Icon className="h-4 w-4" /> {group.name}
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {group.slots.map((s) => {
                  const full = s.full;
                  const low = s.low;
                  const active = selected?.startsAt === s.startsAt;
                  return (
                    <button
                      key={s.startsAt}
                      disabled={full}
                      onClick={() => onSelect(s)}
                      className={`relative rounded-xl border py-2.5 text-sm font-semibold transition-all ${
                        full
                          ? "cursor-not-allowed border-border bg-secondary/50 text-muted-foreground line-through"
                          : active
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      {s.time}
                      {low && !full && !active && (
                        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-warning" title="Few spots left" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
