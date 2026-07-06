import { useEffect, useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import type { TestType } from "../../components/data";
import { priceLabel } from "../../components/data";
import { Field, GhostButton, PrimaryButton } from "../../shared";
import { useFlux } from "../../store/flux-store";
import { createBooking, loadRealAppState } from "../../lib/api";
import { validateEmail } from "../../lib/validation";

/** Slide-over drawer for staff to create a walk-in appointment on the spot. */
export function NewAppointmentDrawer({ onClose }: { onClose: () => void }) {
  const { state, hydrate } = useFlux();
  const activeTypes = state.testTypes.filter((t) => t.active);
  const [testTypeId, setTestTypeId] = useState(activeTypes[0]?.id ?? "");
  const [time, setTime] = useState("14:30");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!testTypeId && activeTypes[0]) setTestTypeId(activeTypes[0].id);
  }, [activeTypes, testTypeId]);

  const emailError = validateEmail(email);
  const testType = activeTypes.find((type) => type.id === testTypeId);
  const valid = firstName.trim() !== "" && !emailError && Boolean(testType);

  async function create() {
    if (!valid) return;
    setSubmitting(true);
    try {
      await createBooking({
        center: state.center,
        testType: testType as TestType,
        startsAt: appointmentIsoForToday(time),
        persons: [{
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          city: state.center.city || "",
          dob,
        }],
        consentAccepted: true,
      });
      hydrate(await loadRealAppState());
      toast.success(`Appointment created for ${firstName} ${lastName}`);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Appointment could not be created");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col bg-card shadow-2xl" role="dialog" aria-modal="true" aria-label="New appointment">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-[var(--font-display)] text-lg font-bold">New appointment</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div>
            <div className="mb-2 text-sm font-semibold">Test type</div>
            <div className="grid gap-2">
              {activeTypes.map((t) => (
                <label key={t.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-2.5 hover:border-primary/40">
                  <input type="radio" name="ntt" checked={testTypeId === t.id} onChange={() => setTestTypeId(t.id)} className="h-4 w-4 accent-[var(--primary)]" />
                  <span className="flex-1 text-sm font-medium">{t.label}</span>
                  <span className="text-sm font-semibold text-primary">{priceLabel(t.price)}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Time" type="time" value={time} onChange={setTime} />
            <div />
            <Field label="First name" value={firstName} onChange={setFirstName} required />
            <Field label="Last name" value={lastName} onChange={setLastName} />
            <div className="col-span-2"><Field label="Email" type="email" value={email} onChange={setEmail} onBlur={() => setEmailTouched(true)} error={emailTouched ? emailError : null} required /></div>
            <Field label="Phone" value={phone} onChange={setPhone} />
            <Field label="Date of birth" type="date" value={dob} onChange={setDob} />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton disabled={!valid || submitting} onClick={() => void create()}>{submitting ? "Creating..." : "Create appointment"}</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function appointmentIsoForToday(time: string) {
  const [hours, minutes] = time.split(":").map((part) => Number(part));
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date.toISOString();
}
