"use client";

import Panel from "@/components/shared/Panel";
import { useWellness } from "@/components/wellness/WellnessProvider";
import { RATION_PACKS } from "@/lib/wellness/protocol";

/**
 * Card 3 — Bio-Calorie & Nutrition.
 * Intake is logged by ration pack (the only items in the galley manifest), so
 * macro/micro totals always reconcile with the calorie bar.
 */
export default function NutritionCard() {
  const { nutrition, rec, logPack, undoPack, resetIntake } = useWellness();

  return (
    <Panel
      title="Bio-Calorie & Nutrition"
      eyebrow="card 03 · fuel ledger"
      right={
        <span className={`chip ${nutrition.fuelPct >= 90 ? "chip--nominal" : nutrition.fuelPct >= 55 ? "chip--caution" : "chip--critical"}`}>
          <span className="status-dot" />
          {nutrition.packsLogged} logged
        </span>
      }
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="readout text-[38px] leading-none">
            {nutrition.kcal}
            <span className="ml-1 font-mono text-[14px] text-slate-500">kcal</span>
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
            of {nutrition.goalKcal} kcal burn plan
          </p>
        </div>
        <div className="text-right">
          <p className="readout text-[26px] leading-none text-neon-cyan">{nutrition.fuelPct}%</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
            energy closed
          </p>
        </div>
      </div>

      <div
        className="meter-track--block mt-4"
        role="progressbar"
        aria-valuenow={nutrition.fuelPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Calorie intake against daily plan"
      >
        <div className="meter-fill" style={{ width: `${nutrition.fuelPct}%` }} />
      </div>

      <div className="mt-4 space-y-2.5">
        <p className="label-eyebrow text-neon-cyan/70">macro balance</p>
        {nutrition.macros.map((item) => (
          <MetricRow key={item.key} item={item} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
        <p className="col-span-2 label-eyebrow text-neon-cyan/70">micro-nutrient coverage</p>
        {nutrition.micros.map((item) => (
          <MetricRow key={item.key} item={item} compact />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {RATION_PACKS.map((pack) => (
          <button
            key={pack.id}
            type="button"
            onClick={() => logPack(pack.id)}
            className="rounded-lg border border-neon-cyan/35 bg-neon-cyan/10 px-3 py-2 text-left transition-all duration-200 hover:bg-neon-cyan/20 hover:shadow-neon-sm active:scale-[0.98]"
          >
            <span className="block font-mono text-[11px] uppercase tracking-[0.12em] text-neon-cyan">
              {pack.label}
            </span>
            <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
              {pack.kcal} kcal
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={undoPack}
          disabled={nutrition.packsLogged === 0}
          className="rounded-lg border border-slate-500/30 bg-void-deep/60 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300 transition-colors duration-200 hover:border-neon-magenta/60 hover:text-neon-magenta disabled:cursor-not-allowed disabled:opacity-35"
        >
          undo
        </button>
        <button
          type="button"
          onClick={resetIntake}
          disabled={nutrition.packsLogged === 0}
          className="btn-ghost px-3 py-2 text-[11px] disabled:cursor-not-allowed disabled:opacity-35"
        >
          clear
        </button>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-slate-400">{rec.fuelNote}</p>
    </Panel>
  );
}

function MetricRow({ item, compact = false }) {
  const tone = item.pct >= 90 ? "" : item.pct >= 50 ? "meter-fill--caution" : "meter-fill--critical";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span
          className={`font-mono uppercase tracking-[0.16em] text-slate-400 ${compact ? "text-[9px]" : "text-[10px]"}`}
        >
          {item.label}
        </span>
        <span className="readout text-[11px]">
          {item.value}
          <span className="text-slate-600">
            /{item.goal} {item.unit}
          </span>
        </span>
      </div>
      <div className="meter-track mt-1">
        <div className={`meter-fill ${tone}`} style={{ width: `${item.pct}%` }} />
      </div>
    </div>
  );
}
