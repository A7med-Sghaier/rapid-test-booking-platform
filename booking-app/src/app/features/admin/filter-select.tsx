/** Compact dropdown filter with an "all" default, used across admin tables. */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const active = value !== "all";
  const current = options.find((o) => o.value === value);
  return (
    <label className={`relative inline-flex items-center rounded-xl border px-3 py-2 text-sm font-medium ${active ? "border-primary text-foreground" : "border-border text-muted-foreground"} bg-card hover:bg-secondary`}>
      <span className="pointer-events-none mr-1 text-muted-foreground">{label}:</span>
      <span className="pointer-events-none">{active ? current?.label : "All"}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
