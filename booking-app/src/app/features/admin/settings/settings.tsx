import { useState } from "react";
import { BasicData } from "./basic-data";
import { HealthOfficeSettings } from "./health-office-settings";
import { TestTypesSettings } from "./test-types-settings";
import { OpeningTimes } from "./opening-times";
import { SlotSettings } from "./slot-settings";
import { TestKits } from "./test-kits";

/** Settings shell — a tabbed container for the individual configuration panels. */
export function Settings() {
  const tabs = ["Basic data", "Health office", "Test types", "Opening times", "Slot settings", "Test kits"];
  const [tab, setTab] = useState(tabs[0]);
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <nav className="flex gap-1 overflow-x-auto lg:flex-col">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
              tab === t ? "bg-card text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:bg-card/60"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className="space-y-5">
        {tab === "Basic data" && <BasicData />}
        {tab === "Health office" && <HealthOfficeSettings />}
        {tab === "Test types" && <TestTypesSettings />}
        {tab === "Opening times" && <OpeningTimes />}
        {tab === "Slot settings" && <SlotSettings />}
        {tab === "Test kits" && <TestKits />}
      </div>
    </div>
  );
}
