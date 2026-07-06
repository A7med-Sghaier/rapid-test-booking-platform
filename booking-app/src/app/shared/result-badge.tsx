import type { TestResult } from "../components/data";

const resultMap: Record<TestResult, { label: string; cls: string }> = {
  negative: { label: "Negative", cls: "bg-success-soft text-[color:var(--success)] ring-1 ring-[color:var(--success)]/20" },
  positive: { label: "Positive", cls: "bg-danger-soft text-[color:var(--danger)] ring-1 ring-[color:var(--danger)]/25" },
  invalid: { label: "Invalid", cls: "bg-warning-soft text-[color:var(--warning-foreground)] ring-1 ring-[color:var(--warning)]/30" },
};

/** Coloured chip for a test result (negative / positive / invalid). */
export function ResultBadge({ result }: { result: TestResult }) {
  const r = resultMap[result];
  return <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${r.cls}`}>{r.label}</span>;
}
