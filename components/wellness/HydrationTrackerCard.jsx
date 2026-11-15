"use client";

import Panel from "@/components/shared/Panel";
import { useWellness } from "@/components/wellness/WellnessProvider";
import { HYDRATION } from "@/lib/wellness/protocol";

/**
 * Card 2 — Zero-G Hydration Tracker.
 * Quick actions are the primary input; the remaining-to-goal readout is derived
 * so it can never disagree with the bar.
 */
export default function HydrationTrackerCard() {
  const { hydration, rec, addWater, resetWater } = useWellness();
  const litres = (hydration.intakeMl / 1000).toFixed(2);

  const fillTone =
    hydration.pct >= 90 ? "" : hydration.pct >= 55 ? "meter-fill--caution" : "meter-fill--critical";

  return (
    <Panel
      title="Zero-G Hydration"
      eyebrow="card 02 · fluid loop"
      right={
        <span
          className={`chip ${hydration.overCeiling ? "chip--caution" : hydration.pct >= 90 ? "chip--nominal" : "chip--idle"}`}
        >
          <span className="status-dot" />
          {hydration.overCeiling ? "over ceiling" : hydration.pct >= 90 ? "goal met" : "intake open"}
        </span>
      }
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="readout text-[38px] leading-none">
            {litres}
            <span className="ml-1 font-mono text-[14px] text-slate-500">L</span>
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
            {hydration.intakeMl} ml of {hydration.goalMl} ml
          </p>
        </div>
        <div className="text-right">
          <p className="readout text-[26px] leading-none text-neon-cyan">{hydration.pct}%</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
            daily goal
          </p>
        </div>
      </div>

      <div className="meter-track--block mt-4" role="progressbar" aria-valuenow={hydration.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Water intake against daily goal">
        <div className={`meter-fill ${fillTone}`} style={{ width: `${hydration.pct}%` }} />
      </div>

      <p className="mt-3 rounded-lg border border-neon-cyan/15 bg-neon-cyan/[0.04] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-300">
        {hydration.remainingMl > 0 ? (
          <>
            <span className="text-neon-cyan">{hydration.remainingMl} ml</span> to reach the{" "}
            {hydration.goalMl / 1000} L goal
          </>
        ) : (
          <span className="text-alert-nominal">goal closed · {hydration.intakeMl - hydration.goalMl} ml surplus</span>
        )}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {HYDRATION.quickAddMl.map((ml) => (
          <button
            key={ml}
            type="button"
            onClick={() => addWater(ml)}
            className="rounded-lg border border-neon-cyan/35 bg-neon-cyan/10 px-2 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-neon-cyan transition-all duration-200 hover:bg-neon-cyan/20 hover:shadow-neon-sm active:scale-[0.98]"
          >
            +{ml} ml
          </button>
        ))}
        <button
          type="button"
          onClick={() => addWater(-250)}
          disabled={hydration.intakeMl < 250}
          className="rounded-lg border border-slate-500/30 bg-void-deep/60 px-2 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300 transition-colors duration-200 hover:border-neon-magenta/60 hover:text-neon-magenta disabled:cursor-not-allowed disabled:opacity-35"
        >
          −250 ml
        </button>
        <button
          type="button"
          onClick={resetWater}
          disabled={hydration.intakeMl === 0}
          className="btn-ghost px-2 py-2.5 text-[10px] disabled:cursor-not-allowed disabled:opacity-35"
        >
          reset
        </button>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-slate-400">{rec.hydrationNote}</p>
    </Panel>
  );
}
