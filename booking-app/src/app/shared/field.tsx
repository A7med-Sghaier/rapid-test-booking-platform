import { useRef } from "react";

let fieldSeq = 0;

/** Field — single labelled input used across every form in the app. */
export function Field({
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  required,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string | null;
}) {
  const id = useRef(`f${++fieldSeq}`).current;
  const invalid = !!error;
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {label} {required && <span className="text-[color:var(--danger)]">*</span>}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-err` : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`w-full rounded-xl border bg-input-background px-3 py-2.5 text-sm outline-none transition-shadow [color-scheme:light] focus:ring-2 ${
          invalid ? "border-[color:var(--danger)] focus:ring-[color:var(--danger)]/30" : "border-border focus:ring-primary/40"
        }`}
      />
      {invalid && (
        <span id={`${id}-err`} className="mt-1 block text-xs font-medium text-[color:var(--danger)]">
          {error}
        </span>
      )}
    </label>
  );
}
