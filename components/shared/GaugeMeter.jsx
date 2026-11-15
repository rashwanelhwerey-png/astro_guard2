/**
 * Horizontal band meter. Renders a subsystem's position inside its healthy
 * envelope, with the caution/critical colours owned by globals.css.
 */
export default function GaugeMeter({ label, value, unit, ratio = 0, status = "nominal", detail }) {
  const fillClass =
    status === "critical"
      ? "meter-fill meter-fill--critical"
      : status === "caution"
        ? "meter-fill meter-fill--caution"
        : "meter-fill";

  const valueTone =
    status === "critical"
      ? "text-alert-critical"
      : status === "caution"
        ? "text-alert-caution"
        : "text-slate-100";

  return (
    <div>
      <div className="field-label">
        <span>{label}</span>
        {detail ? <span className="text-[10px] tracking-[0.1em] text-slate-500">{detail}</span> : null}
      </div>
      <div className="flex items-center gap-3">
        <div className="meter-track flex-1">
          <div className={fillClass} style={{ width: `${Math.round(ratio * 100)}%` }} />
        </div>
        <span className={`readout w-[74px] text-right text-sm ${valueTone}`}>
          {value}
          <span className="ml-1 text-[10px] text-slate-500">{unit}</span>
        </span>
      </div>
    </div>
  );
}
