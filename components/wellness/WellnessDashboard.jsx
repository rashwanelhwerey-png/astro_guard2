"use client";

import { qualityBand } from "@/lib/wellness/protocol";
import SleepAnalyzerCard from "@/components/wellness/SleepAnalyzerCard";
import HydrationTrackerCard from "@/components/wellness/HydrationTrackerCard";
import NutritionCard from "@/components/wellness/NutritionCard";
import EmsProtocolCard from "@/components/wellness/EmsProtocolCard";
import { useWellness } from "@/components/wellness/WellnessProvider";

/**
 * Daily Wellness bay — the third mission surface.
 * State lives in WellnessProvider above the surface switch, so moving to the
 * HUD or Ground Control never costs the operator their logged day.
 */
export default function WellnessDashboard() {
  return (
    <div className="space-y-4">
      <RecoveryStrip />
      <div className="grid gap-4 xl:grid-cols-2">
        <SleepAnalyzerCard />
        <HydrationTrackerCard />
        <NutritionCard />
        <EmsProtocolCard />
      </div>
    </div>
  );
}

const BAND = {
  nominal: { text: "text-alert-nominal", fill: "", copy: "cleared for EVA tasking" },
  caution: { text: "text-alert-caution", fill: "meter-fill--caution", copy: "monitor before tasking" },
  critical: { text: "text-alert-critical", fill: "meter-fill--critical", copy: "defer non-critical load" },
};

/** Weighted roll-up of the four cards, shown above them. */
function RecoveryStrip() {
  const { recoveryIndex, sleep, hydration, nutrition, ems } = useWellness();
  const band = BAND[qualityBand(recoveryIndex)];

  const factors = [
    { label: "Rest", value: `${sleep.quality}%`, weight: "40%" },
    { label: "Fluid", value: `${hydration.pct}%`, weight: "25%" },
    { label: "Fuel", value: `${nutrition.fuelPct}%`, weight: "20%" },
    { label: "EMS", value: `${ems.emsPct}%`, weight: "15%" },
  ];

  return (
    <section className="glass-panel hud-frame relative rounded-xl px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="min-w-[180px]">
          <p className="label-eyebrow text-neon-cyan/70">daily recovery index</p>
          <p className={`readout mt-1 text-[44px] leading-none ${band.text}`}>
            {recoveryIndex}
            <span className="ml-1 font-mono text-[14px] text-slate-500">/100</span>
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
            {band.copy}
          </p>
          <div className="meter-track mt-3">
            <div
              className={`meter-fill ${band.fill}`}
              style={{ width: `${recoveryIndex}%` }}
            />
          </div>
        </div>

        <dl className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          {factors.map((factor) => (
            <div
              key={factor.label}
              className="rounded-lg border border-neon-cyan/15 bg-void-deep/50 px-3 py-2"
            >
              <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
                {factor.label} · {factor.weight}
              </dt>
              <dd className="readout text-[18px]">{factor.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
