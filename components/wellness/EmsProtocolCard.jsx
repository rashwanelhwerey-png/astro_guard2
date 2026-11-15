"use client";

import Panel from "@/components/shared/Panel";
import { useWellness } from "@/components/wellness/WellnessProvider";
import { EMS, formatClock } from "@/lib/wellness/protocol";

const PHASE_TONE = {
  activation: { chip: "chip--nominal", fill: "", label: "stimulating" },
  rest: { chip: "chip--caution", fill: "meter-fill--caution", label: "perfusion rest" },
  standby: { chip: "chip--idle", fill: "", label: "standby" },
};

const PRESETS = [45, 70, 100];

/**
 * Card 4 — Zero-G EMS Workout Protocol.
 * Everything live (phase, channel, block, countdown) is derived from the single
 * session start timestamp, so the readout survives a reload mid-session.
 */
export default function EmsProtocolCard() {
  const { ems, rec, sleep, startEms, stopEms, resetEms, setLoadPct } = useWellness();
  const phase = PHASE_TONE[ems.phase.key] ?? PHASE_TONE.standby;
  const blocked = rec.emsLocked && !ems.running;

  return (
    <Panel
      title="Zero-G EMS Protocol"
      eyebrow="card 04 · muscle stimulation"
      right={
        <span className={`chip ${blocked ? "chip--critical" : phase.chip}`}>
          <span className={`status-dot ${ems.running ? "fx-live" : ""}`} />
          {blocked ? "interlocked" : ems.running ? phase.label : "standby"}
        </span>
      }
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="readout text-[38px] leading-none">
            {ems.running ? formatClock(ems.elapsed) : formatClock(ems.doneSec)}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
            {ems.running ? "session elapsed" : "banked from prior blocks"}
          </p>
        </div>
        <div className="text-right">
          <p className="readout text-[26px] leading-none text-neon-cyan">
            {ems.milliamps}
            <span className="ml-1 font-mono text-[12px] text-slate-500">mA</span>
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
            suit bus drive
          </p>
        </div>
      </div>

      {/* Live phase strip — the real-time indicator. */}
      <div
        className="mt-4 rounded-lg border border-neon-cyan/20 bg-void-deep/60 p-3"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-display text-[13px] font-semibold uppercase tracking-[0.18em] text-neon-cyan title-glow">
            {ems.phase.label}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
            block {ems.phase.block || "—"} · {ems.phase.channel} group
          </span>
        </div>
        <div className="meter-track mt-2.5">
          <div
            className={`meter-fill ${phase.fill}`}
            style={{ width: `${ems.running ? ems.progressPct : 0}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
          <span>{ems.running ? `switches in ${ems.phase.secondsToSwitch}s` : `${EMS.blockSec}s on / ${EMS.restSec}s off`}</span>
          <span>
            {ems.running ? `${formatClock(ems.remaining)} left` : `${EMS.sessionMin} min target`}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
            load
          </span>
          <span className="readout text-[11px]">
            {ems.loadPct}%
            <span className="text-slate-600"> · {rec.intensity.label}</span>
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setLoadPct(preset)}
              disabled={ems.running}
              className={`rounded-lg border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                ems.loadPct === preset
                  ? "border-neon-cyan/70 bg-neon-cyan/18 text-neon-cyan"
                  : "border-slate-500/30 bg-void-deep/60 text-slate-400 hover:border-neon-cyan/50 hover:text-neon-cyan"
              }`}
            >
              {preset}%
            </button>
          ))}
          {sleep.quality >= 40 && ems.loadPct !== rec.intensity.loadPct ? (
            <button
              type="button"
              onClick={() => setLoadPct(rec.intensity.loadPct)}
              disabled={ems.running}
              className="rounded-lg border border-neon-lime/50 bg-neon-lime/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-neon-lime transition-colors duration-200 hover:bg-neon-lime/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              sync to sleep
            </button>
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-slate-400">{rec.intensity.note}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {ems.running ? (
          <button type="button" onClick={stopEms} className="btn-ghost flex-1 py-2.5">
            hold session
          </button>
        ) : (
          <button
            type="button"
            onClick={startEms}
            disabled={blocked || ems.loadPct === 0}
            className="btn-launch flex-1 py-2.5 text-[11px] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {blocked ? "protocol locked · rest required" : "begin ems session"}
          </button>
        )}
        <button
          type="button"
          onClick={resetEms}
          disabled={ems.running || ems.doneSec === 0}
          className="btn-ghost px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-35"
        >
          reset
        </button>
      </div>

      <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-600">
        session {ems.emsPct}% complete · {formatClock(ems.doneSec)} banked toward daily quota
      </p>
    </Panel>
  );
}
