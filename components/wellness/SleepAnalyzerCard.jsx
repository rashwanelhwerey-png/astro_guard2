"use client";

import Panel from "@/components/shared/Panel";
import { useWellness } from "@/components/wellness/WellnessProvider";
import { SLEEP } from "@/lib/wellness/protocol";

const TONE_TEXT = {
  nominal: "text-alert-nominal",
  caution: "text-alert-caution",
  critical: "text-alert-critical",
};
const TONE_FILL = { nominal: "", caution: "meter-fill--caution", critical: "meter-fill--critical" };
const TONE_CHIP = {
  nominal: "chip--nominal",
  caution: "chip--caution",
  critical: "chip--critical",
};

/**
 * Card 1 — Interactive Sleep Analyzer.
 * The slider is the only input; quality, sleep debt and every recommendation
 * below are derived in lib/wellness/protocol.js.
 */
export default function SleepAnalyzerCard() {
  const { sleep, rec, setSleepHours } = useWellness();
  const pct = ((sleep.hours - SLEEP.min) / (SLEEP.max - SLEEP.min)) * 100;

  return (
    <Panel
      title="Sleep Analyzer"
      eyebrow="card 01 · rest architecture"
      right={
        <span className={`chip ${TONE_CHIP[sleep.band]}`}>
          <span className="status-dot" />
          {sleep.band}
        </span>
      }
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="readout text-[38px] leading-none">{sleep.quality}%</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
            sleep quality index
          </p>
        </div>
        <div className="text-right">
          <p className="readout text-[26px] leading-none text-neon-cyan">
            {sleep.hours.toFixed(1)}
            <span className="ml-1 font-mono text-[12px] text-slate-500">h</span>
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
            logged rest
          </p>
        </div>
      </div>

      <div className="meter-track mt-4">
        <div
          className={`meter-fill ${TONE_FILL[sleep.band]}`}
          style={{ width: `${sleep.quality}%` }}
        />
      </div>

      <label htmlFor="sleep-hours" className="mt-5 block">
        <span className="label-eyebrow text-neon-cyan/70">
          hours slept · optimal {sleep.optimal}
        </span>
        <input
          id="sleep-hours"
          className="range-neon mt-2"
          type="range"
          min={SLEEP.min}
          max={SLEEP.max}
          step={SLEEP.step}
          value={sleep.hours}
          style={{ "--range-pct": `${pct}%` }}
          onChange={(event) => setSleepHours(event.target.value)}
          aria-valuetext={`${sleep.hours.toFixed(1)} hours, quality ${sleep.quality} percent`}
        />
        <span className="mt-1 flex justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-slate-600">
          <span>{SLEEP.min}h</span>
          <span>{SLEEP.max}h</span>
        </span>
      </label>

      <dl className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-neon-cyan/15 bg-void-deep/50 px-3 py-2">
          <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
            sleep debt
          </dt>
          <dd className="readout text-[15px]">{sleep.debt.toFixed(1)} h</dd>
        </div>
        <div className="rounded-lg border border-neon-cyan/15 bg-void-deep/50 px-3 py-2">
          <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
            protocol gate
          </dt>
          <dd className={`readout text-[15px] ${TONE_TEXT[sleep.band]}`}>
            {rec.emsLocked ? "interlocked" : "cleared"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 space-y-2">
        <p className="label-eyebrow text-neon-cyan/70">flight-surgeon advisories</p>
        <AdviceRow label="Workout load" value={rec.intensity.label} note={rec.intensity.note} />
        <AdviceRow
          label="Red-light therapy"
          value={rec.redLight.indicated ? `${rec.redLight.minutes} min · 660 nm` : "not indicated"}
          note={rec.redLight.note}
        />
      </div>
    </Panel>
  );
}

function AdviceRow({ label, value, note }) {
  return (
    <div className="rounded-lg border border-neon-cyan/15 bg-neon-cyan/[0.04] px-3 py-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
          {label}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-neon-cyan">
          {value}
        </span>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{note}</p>
    </div>
  );
}
