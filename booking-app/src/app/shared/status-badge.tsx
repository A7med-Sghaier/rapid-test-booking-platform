import type { AppointmentStatus } from "../components/data";

const statusMap: Record<AppointmentStatus, { label: string; cls: string; dot: string }> = {
  waiting: { label: "Waiting", cls: "bg-info-soft text-info", dot: "bg-info" },
  "checked-in": { label: "Checked in", cls: "bg-violet-soft text-violet", dot: "bg-violet" },
  completed: { label: "Completed", cls: "bg-success-soft text-[color:var(--success)]", dot: "bg-success" },
  canceled: { label: "Canceled", cls: "bg-danger-soft text-[color:var(--danger)]", dot: "bg-[color:var(--danger)]" },
};

/** Pill showing an appointment's lifecycle status with a coloured dot. */
export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const s = statusMap[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
