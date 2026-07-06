import { useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { Field } from "../../shared";
import { useI18n } from "../../lib/i18n";
import { validateEmail } from "../../lib/validation";
import type { DraftPerson } from "./types";
import { blankPerson } from "./persons";

/** Step 3 — collect one or more persons' details plus data consent. */
export function StepPersons({
  persons,
  setPersons,
  consent,
  setConsent,
}: {
  persons: DraftPerson[];
  setPersons: (p: DraftPerson[]) => void;
  consent: boolean;
  setConsent: (v: boolean) => void;
}) {
  const { t } = useI18n();
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  function update(id: string, key: keyof DraftPerson, value: string) {
    setPersons(persons.map((p) => (p.id === id ? { ...p, [key]: value } : p)));
  }
  return (
    <div>
      <div className="space-y-4">
        {persons.map((p, i) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-secondary text-xs text-primary">
                  {i + 1}
                </span>
                {i === 0 ? t("person.primary") : `${t("summary.persons")} ${i + 1}`}
              </span>
              {persons.length > 1 && (
                <button
                  onClick={() => setPersons(persons.filter((x) => x.id !== p.id))}
                  className="inline-flex items-center gap-1 text-sm text-[color:var(--danger)] hover:underline"
                >
                  <Trash2 className="h-4 w-4" /> {t("person.remove")}
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("field.firstName")} value={p.firstName} onChange={(v) => update(p.id, "firstName", v)} required />
              <Field label={t("field.lastName")} value={p.lastName} onChange={(v) => update(p.id, "lastName", v)} />
              <Field
                label={t("field.email")}
                type="email"
                value={p.email}
                onChange={(v) => update(p.id, "email", v)}
                onBlur={() => setTouched((s) => ({ ...s, [p.id]: true }))}
                error={touched[p.id] ? validateEmail(p.email) : null}
                required
              />
              <Field label={t("field.phone")} value={p.phone} onChange={(v) => update(p.id, "phone", v)} />
              <Field label={t("field.city")} value={p.city} onChange={(v) => update(p.id, "city", v)} />
              <Field label="Date of birth" type="date" value={p.dob} onChange={(v) => update(p.id, "dob", v)} />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setPersons([...persons, blankPerson()])}
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-border bg-card px-4 py-2.5 text-sm font-semibold text-primary hover:bg-secondary"
      >
        <UserPlus className="h-4 w-4" /> {t("person.add")}
      </button>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-4">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
        />
        <span className="text-sm text-muted-foreground">{t("consent")}</span>
      </label>
    </div>
  );
}
