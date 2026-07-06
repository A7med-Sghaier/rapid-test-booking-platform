import { Check } from "lucide-react";
import { STEPS } from "./types";

/** Three-step progress indicator for the booking wizard. */
export function Stepper({ step }: { step: number }) {
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
