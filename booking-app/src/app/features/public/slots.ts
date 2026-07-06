import { Sun, Sunrise, Sunset } from "lucide-react";
import type { Center } from "../../components/data";
import { localDay } from "../../components/data";
import type { BookedSlot } from "../../store/flux-store";
import type { SelectedSlot } from "./types";

export const slotIcon = { Morning: Sunrise, Afternoon: Sun, Evening: Sunset } as const;
export type SlotGroupName = keyof typeof slotIcon;

export interface SlotGroup {
  name: SlotGroupName;
  slots: SelectedSlot[];
}

/** Build the morning/afternoon/evening slot groups for a given day, honouring
 * opening hours, per-slot capacity and the 10-minute booking cadence. */
export function buildSlotGroups(center: Center, bookedSlots: BookedSlot[], day: Date): SlotGroup[] {
  const groups: SlotGroup[] = [
    { name: "Morning", slots: [] },
    { name: "Afternoon", slots: [] },
    { name: "Evening", slots: [] },
  ];
  const opening = openingForDate(center, day);
  if (!opening?.isOpen) return groups;

  const start = combineDateAndTime(day, opening.from || "06:00");
  const end = combineDateAndTime(day, opening.to || "20:00");
  const now = new Date();
  if (localDay(day) === localDay(now) && start.getTime() < now.getTime() + 10 * 60000) {
    start.setTime(roundUpToStep(now.getTime() + 10 * 60000, 10));
  }
  const maxPerSlot = Number(center.maxPerSlot ?? 0);

  for (let cursor = new Date(start); cursor.getTime() <= end.getTime(); cursor.setMinutes(cursor.getMinutes() + 10)) {
    const personsCount = bookedPersonsCount(bookedSlots, cursor);
    const full = maxPerSlot > 0 && personsCount >= maxPerSlot;
    const low = maxPerSlot > 0 && personsCount >= Math.max(1, maxPerSlot - 1);
    const slot: SelectedSlot = {
      date: localDay(cursor),
      time: timeOfDay(cursor),
      startsAt: cursor.toISOString(),
      low,
      full,
    };
    const hour = cursor.getHours();
    const group = hour < 12 ? groups[0] : hour < 17 ? groups[1] : groups[2];
    group.slots.push(slot);
  }

  return groups.filter((group) => group.slots.length > 0);
}

function openingForDate(center: Center, date: Date) {
  const openingTimes = center.openingTimes ?? {};
  const shortKeys = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const longKey = date.toLocaleDateString("en", { weekday: "long" }).toLowerCase();
  return openingTimes[shortKeys[date.getDay()]] ?? openingTimes[longKey];
}

function combineDateAndTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map((part) => Number(part));
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours || 0, minutes || 0, 0, 0);
}

function roundUpToStep(ms: number, stepMinutes: number) {
  const stepMs = stepMinutes * 60000;
  return Math.ceil(ms / stepMs) * stepMs;
}

function bookedPersonsCount(bookedSlots: BookedSlot[], slot: Date) {
  const key = slotKey(slot);
  return bookedSlots.find((bookedSlot) => slotKey(new Date(bookedSlot.appointment)) === key)?.personsCount ?? 0;
}

function slotKey(date: Date) {
  return `${localDay(date)} ${timeOfDay(date)}`;
}

function timeOfDay(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
