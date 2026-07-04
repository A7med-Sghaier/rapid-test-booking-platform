import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronRight,
  Clock,
  Mail,
  MapPin,
  Phone,
  Plus,
  QrCode,
  ShieldCheck,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import type { Center, TestType } from "./data";
import { localDay, priceLabel } from "./data";
import { Field, Logo, TrustBadge } from "./primitives";
import { type BookedSlot, useFlux } from "../store/flux-store";
import { createBooking, loadRealAppState } from "../lib/api";
import { LanguageToggle, useI18n } from "../lib/i18n";
import { validateEmail } from "../lib/validation";

type Screen = "home" | "booking" | "done";
interface DraftPerson {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  dob: string;
}

interface SelectedSlot {
  date: string;
  time: string;
  startsAt: string;
  low: boolean;
  full: boolean;
}

const STEPS = ["Test type", "Appointment", "Details"];

export function PublicApp() {
  const { state, hydrate } = useFlux();
  const { t } = useI18n();
  const [screen, setScreen] = useState<Screen>("home");
  const [step, setStep] = useState(0);
  const [testTypeId, setTestTypeId] = useState<string | null>(null);
  const [slot, setSlot] = useState<SelectedSlot | null>(null);
  const [persons, setPersons] = useState<DraftPerson[]>([blankPerson()]);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [bookingQr, setBookingQr] = useState<string | null>(null);
  const testTypes = state.testTypes;
  const center = state.center;

  function reset() {
    setStep(0);
    setTestTypeId(null);
    setSlot(null);
    setPersons([blankPerson()]);
    setConsent(false);
  }

  const tt = testTypeId ? testTypes.find((t) => t.id === testTypeId) ?? null : null;
  const mobileTotal = tt ? tt.price * persons.length : 0;
  const primaryDisabled =
    step === 0
      ? !testTypeId
      : step === 1
        ? !slot
        : !consent || submitting || persons.some((p) => !p.firstName || !p.email);

  async function handlePrimary() {
    if (step < 2) {
      setStep((s) => s + 1);
      return;
    }
    if (!tt || !slot) return;
    setSubmitting(true);
    try {
      const result = await createBooking({
        center,
        testType: tt,
        startsAt: slot.startsAt,
        persons,
        consentAccepted: consent,
      });
      setBookingRef("Booking confirmed");
      setBookingQr(result.data ?? null);
      hydrate(await loadRealAppState());
      setScreen("done");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Booking could not be submitted");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader center={center} />
      {screen === "home" && (
        <HomeScreen
          center={center}
          onStart={() => {
            reset();
            setScreen("booking");
          }}
        />
      )}

      {screen === "booking" && (
        <>
          <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-28 pt-2 lg:grid-cols-[1fr_340px] lg:py-10 lg:pb-10">
            <div className="min-w-0">
              <div className="sticky top-[60px] z-10 -mx-4 border-b border-border bg-background/95 px-4 py-2 backdrop-blur lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
                <div className="flex items-center gap-4 lg:block">
                  <button
                    onClick={() => (step === 0 ? setScreen("home") : setStep((s) => s - 1))}
                    aria-label="Back"
                    className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground lg:mb-4"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden lg:inline">Back</span>
                  </button>
                  <div className="min-w-0 flex-1 lg:flex-none">
                    <Stepper step={step} />
                  </div>
                  <div className="h-4 w-4 shrink-0 lg:hidden" aria-hidden />
                </div>
                <div className="mt-2 lg:mt-4">
                  <h2 className="font-[var(--font-display)] text-base font-bold leading-tight">{t(`step.${step + 1}.title`)}</h2>
                  <p className="text-xs text-muted-foreground">{t(`step.${step + 1}.sub`)}</p>
                </div>
              </div>

              <div className="mt-3 lg:mt-5">
                {step === 0 && <StepTestType testTypes={testTypes} selected={testTypeId} onSelect={setTestTypeId} />}
                {step === 1 && <StepAppointment center={center} bookedSlots={state.bookedSlots} selected={slot} onSelect={setSlot} />}
                {step === 2 && (
                  <StepPersons persons={persons} setPersons={setPersons} consent={consent} setConsent={setConsent} />
                )}
              </div>

              {/* Desktop nav */}
              <div className="mt-8 hidden items-center justify-between border-t border-border pt-5 lg:flex">
                <span className="text-sm text-muted-foreground">
                  {t("step.of", { a: step + 1, b: STEPS.length })}
                </span>
                <PrimaryAction
                  step={step}
                  submitting={submitting}
                  disabled={primaryDisabled}
                  onClick={handlePrimary}
                />
              </div>
            </div>

            <SummaryPanel center={center} tt={tt} slot={slot} persons={persons.length} className="hidden lg:block" />
          </div>

          {/* Mobile sticky bottom bar */}
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] text-muted-foreground">
                  {t("step.of", { a: step + 1, b: STEPS.length })} · {persons.length}
                </div>
                <div className="font-[var(--font-display)] text-lg font-bold leading-tight">
                  {mobileTotal === 0 ? t("summary.free") : `€${mobileTotal}`}
                </div>
              </div>
              <PrimaryAction
                step={step}
                submitting={submitting}
                disabled={primaryDisabled}
                onClick={handlePrimary}
              />
            </div>
          </div>
        </>
      )}

      {screen === "done" && (
        <DoneScreen
          tt={tt}
          slot={slot}
          persons={persons.length}
          bookingRef={bookingRef}
          bookingQr={bookingQr}
          center={center}
          onHome={() => setScreen("home")}
          onAnother={() => {
            reset();
            setScreen("booking");
          }}
        />
      )}
    </div>
  );
}

function blankPerson(): DraftPerson {
  return { id: draftPersonId(), firstName: "", lastName: "", email: "", phone: "", city: "", dob: "" };
}

function draftPersonId() {
  if (globalThis.crypto?.randomUUID) return `draft-${globalThis.crypto.randomUUID()}`;
  const values = new Uint32Array(2);
  globalThis.crypto?.getRandomValues(values);
  const token = Array.from(values, (value) => value.toString(36)).join("");
  return `draft-${token}`;
}

function PublicHeader({ center }: { center: Center }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Logo />
        <div className="flex items-center gap-3">
          {(center.address || center.city) && (
            <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
              <MapPin className="h-4 w-4" /> {[center.address, center.city].filter(Boolean).join(", ")}
            </span>
          )}
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}

function HomeScreen({ center, onStart }: { center: Center; onStart: () => void }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const phone = center.phone?.trim();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-[color:var(--accent-foreground)]">
            <Sparkles className="h-3.5 w-3.5" /> {t("home.badge")}
          </span>
          <h1 className="mt-4 font-[var(--font-display)] text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            {t("home.title")}
          </h1>
          <p className="mt-4 max-w-md text-base text-muted-foreground">
            {t("home.subtitle")}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onStart}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              <CalendarCheck className="h-4.5 w-4.5" /> {t("home.book")}
            </button>
          </div>

          {/* Returning */}
          <div className="mt-6 rounded-2xl border border-border bg-card p-5">
            <div className="text-sm font-semibold">{t("home.registered")}</div>
            <p className="mt-0.5 text-xs text-muted-foreground">{t("home.registeredSub")}</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-input-background px-3 py-2.5">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-secondary">
                {t("home.sendLink")}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <TrustBadge icon={<ShieldCheck className="h-5 w-5" />} title={t("trust.secure")} sub={t("trust.secureSub")} />
          <TrustBadge icon={<Clock className="h-5 w-5" />} title={t("trust.fast")} sub={t("trust.fastSub")} />
          <TrustBadge icon={<QrCode className="h-5 w-5" />} title={t("trust.qr")} sub={t("trust.qrSub")} />
          <TrustBadge icon={<Mail className="h-5 w-5" />} title={t("trust.email")} sub={t("trust.emailSub")} />
          <div className="rounded-2xl bg-primary p-5 text-primary-foreground sm:col-span-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Phone className="h-4 w-4" /> {t("trust.help")}
            </div>
            <p className="mt-1 text-sm text-white/80">
              {phone ? `Call ${phone}` : "Contact the test center"}.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <div key={label} className="flex flex-1 items-center gap-2 last:flex-none">
            <div className="relative">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  done
                    ? "bg-success text-white"
                    : active
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/15"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 rounded ${done ? "bg-success" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepTestType({
  testTypes,
  selected,
  onSelect,
}: {
  testTypes: TestType[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  if (testTypes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <div className="font-semibold">No test types configured</div>
        <p className="mt-1 text-sm text-muted-foreground">Add active test types in admin settings before accepting bookings.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {testTypes.map((t) => {
          const active = selected === t.id;
          return (
            <button
              key={t.id}
              disabled={!t.active}
              onClick={() => onSelect(t.id)}
              className={`relative rounded-2xl border p-5 text-left transition-all ${
                !t.active
                  ? "cursor-not-allowed border-border bg-secondary/40 opacity-60"
                  : active
                    ? "border-primary bg-card ring-2 ring-primary/30"
                    : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="font-semibold">{t.label}</span>
                {active && (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{t.description}</p>
              <div className="mt-4 flex items-center gap-3 text-sm">
                <span className="font-[var(--font-display)] font-bold text-primary">{priceLabel(t.price)}</span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> {t.durationMin < 60 ? `${t.durationMin} min` : `${t.durationMin / 60} h`}
                </span>
                {t.badge && (
                  <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-[color:var(--accent-foreground)]">
                    {t.badge}
                  </span>
                )}
                {!t.active && (
                  <span className="ml-auto rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-semibold text-[color:var(--danger)]">
                    Unavailable
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const slotIcon = { Morning: Sunrise, Afternoon: Sun, Evening: Sunset } as const;
type SlotGroupName = keyof typeof slotIcon;
interface SlotGroup {
  name: SlotGroupName;
  slots: SelectedSlot[];
}

function StepAppointment({
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

function StepPersons({
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

function PrimaryAction({
  step,
  submitting,
  disabled,
  onClick,
}: {
  step: number;
  submitting: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const { t } = useI18n();
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {step < 2 ? (
        <>
          {t("step.continue")} <ArrowRight className="h-4 w-4" />
        </>
      ) : submitting ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          {t("step.confirming")}
        </>
      ) : (
        <>
          {t("step.confirm")} <Check className="h-4 w-4" />
        </>
      )}
    </button>
  );
}

function SummaryPanel({
  center,
  tt,
  slot,
  persons,
  className = "",
}: {
  center: Center;
  tt: TestType | null;
  slot: SelectedSlot | null;
  persons: number;
  className?: string;
}) {
  const { t } = useI18n();
  const total = tt ? tt.price * persons : 0;
  const centerLabel = [center.address, center.city].filter(Boolean).join(", ") || "—";
  return (
    <aside className={`h-fit rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24 ${className}`}>
      <h3 className="font-[var(--font-display)] font-bold">{t("summary.title")}</h3>
      <dl className="mt-4 space-y-3 text-sm">
        <Row label={t("summary.testType")} value={tt ? tt.label : "—"} />
        <Row label={t("summary.appointment")} value={slot ? `${slot.date} · ${slot.time}` : "—"} />
        <Row label={t("summary.persons")} value={String(persons)} />
        <Row label={t("summary.center")} value={centerLabel} />
      </dl>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">{t("summary.total")}</span>
        <span className="font-[var(--font-display)] text-xl font-bold">{total === 0 ? t("summary.free") : `€${total}`}</span>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" /> {t("summary.secure")}
      </p>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function buildSlotGroups(center: Center, bookedSlots: BookedSlot[], day: Date): SlotGroup[] {
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

function DoneScreen({
  tt,
  slot,
  persons,
  bookingRef,
  bookingQr,
  center,
  onHome,
  onAnother,
}: {
  tt: TestType | null;
  slot: SelectedSlot | null;
  persons: number;
  bookingRef: string;
  bookingQr: string | null;
  center: Center;
  onHome: () => void;
  onAnother: () => void;
}) {
  const { t } = useI18n();
  const ref = bookingRef || "Booking confirmed";
  const verifyUrl = `${window.location.origin}/verify/${ref}`;
  const centerLabel = [center.address, center.city].filter(Boolean).join(", ") || "—";
  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <div className="rounded-3xl border border-border bg-card p-7 text-center shadow-sm">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-soft">
          <Check className="h-8 w-8 text-[color:var(--success)]" strokeWidth={2.5} />
        </div>
        <h1 className="mt-4 font-[var(--font-display)] text-2xl font-bold">{t("done.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("done.sub")}</p>

        <div className="mt-6 grid place-items-center rounded-2xl border border-border bg-secondary/40 p-6">
          <div className="grid place-items-center rounded-xl bg-white p-3 shadow-sm">
            {bookingQr ? <img src={bookingQr} alt="Booking QR code" className="h-[148px] w-[148px]" /> : <QRCodeSVG value={verifyUrl} size={148} level="M" />}
          </div>
          <div className="mt-3 font-[var(--font-display)] text-sm font-bold tracking-widest">{ref}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">{t("done.scan")}</div>
        </div>

        <dl className="mt-6 space-y-3 text-left text-sm">
          <Row label={t("summary.testType")} value={tt?.label ?? "—"} />
          <Row label={t("summary.appointment")} value={slot ? `${slot.date} · ${slot.time}` : "—"} />
          <Row label={t("summary.persons")} value={String(persons)} />
          <Row label={t("summary.center")} value={centerLabel} />
        </dl>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <QrCode className="h-4 w-4" /> {t("done.downloadQr")}
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-secondary">
            <CalendarCheck className="h-4 w-4" /> {t("done.addCal")}
          </button>
        </div>
        <div className="mt-2 flex items-center justify-center gap-4 text-sm">
          <button onClick={onAnother} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
            <Plus className="h-4 w-4" /> {t("done.another")}
          </button>
          <button onClick={onHome} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            {t("done.home")} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}

// silence unused import lint safety
void X;
