import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useFlux } from "../../store/flux-store";
import { createBooking, loadRealAppState } from "../../lib/api";
import { useI18n } from "../../lib/i18n";
import { type Screen, type SelectedSlot, type DraftPerson, STEPS } from "./types";
import { blankPerson } from "./persons";
import { PublicHeader } from "./public-header";
import { HomeScreen } from "./home-screen";
import { Stepper } from "./stepper";
import { StepTestType } from "./step-test-type";
import { StepAppointment } from "./step-appointment";
import { StepPersons } from "./step-persons";
import { PrimaryAction } from "./primary-action";
import { SummaryPanel } from "./summary-panel";
import { DoneScreen } from "./done-screen";

/**
 * Public booking experience: landing page + three-step wizard (test type,
 * appointment, persons) and the confirmation screen. Orchestrates screen and
 * step state and delegates each section to a focused component.
 */
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
