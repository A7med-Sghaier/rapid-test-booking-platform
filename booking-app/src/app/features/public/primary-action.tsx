import { ArrowRight, Check } from "lucide-react";
import { useI18n } from "../../lib/i18n";

/** Wizard's primary button — continue / confirm / confirming states. */
export function PrimaryAction({
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
