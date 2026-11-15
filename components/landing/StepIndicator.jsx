"use client";

const STEPS = [
  { index: 1, label: "Agency Sync", short: "01" },
  { index: 2, label: "Identity", short: "02" },
  { index: 3, label: "Launch", short: "03" },
];

/**
 * Three-node access rail. `maxReached` lets completed steps stay lit when the
 * operator navigates backwards.
 */
export default function StepIndicator({ current = 1, maxReached = 1, onSelect }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Onboarding progress">
      {STEPS.map((step, position) => {
        const isCurrent = step.index === current;
        const isDone = step.index < current;
        const isReachable = step.index <= maxReached;

        const nodeTone = isCurrent
          ? "border-neon-cyan bg-neon-cyan/15 text-neon-cyan shadow-neon-sm"
          : isDone
            ? "border-alert-nominal/60 bg-alert-nominal/10 text-alert-nominal"
            : isReachable
              ? "border-slate-500/40 text-slate-400"
              : "border-slate-700/60 text-slate-600";

        return (
          <li key={step.index} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              disabled={!isReachable}
              onClick={() => isReachable && onSelect?.(step.index)}
              aria-current={isCurrent ? "step" : undefined}
              className="group flex items-center gap-2 disabled:cursor-not-allowed"
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-md border font-mono text-[11px] transition-all duration-300 ${nodeTone}`}
              >
                {isDone ? "✓" : step.short}
              </span>
              <span
                className={`hidden font-mono text-[10px] uppercase tracking-[0.18em] sm:block ${
                  isCurrent ? "text-neon-cyan" : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </button>
            {position < STEPS.length - 1 ? (
              <span
                aria-hidden="true"
                className={`h-px flex-1 transition-colors duration-500 ${
                  step.index < current ? "bg-neon-cyan/60" : "bg-slate-700/60"
                }`}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
