/**
 * Standard instrument panel used across both dashboard surfaces.
 * `tone` recolours the header rule so anomaly modules read differently at a glance.
 */
const TONES = {
  cyan: { rule: "bg-neon-cyan/50", text: "text-neon-cyan/70" },
  amber: { rule: "bg-alert-caution/60", text: "text-alert-caution/80" },
  magenta: { rule: "bg-neon-magenta/50", text: "text-neon-magenta/80" },
};

export default function Panel({
  title,
  eyebrow,
  right,
  tone = "cyan",
  className = "",
  bodyClassName = "pt-3",
  children,
}) {
  const palette = TONES[tone] ?? TONES.cyan;

  return (
    <section className={`glass-panel--soft hud-frame relative rounded-xl p-4 ${className}`}>
      <header className="mb-2 flex items-start justify-between gap-3">
        <div>
          {eyebrow ? (
            <p className={`label-eyebrow ${palette.text}`}>{eyebrow}</p>
          ) : null}
          <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-100">
            {title}
          </h2>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </header>
      <span aria-hidden="true" className={`mb-3 block h-px w-full ${palette.rule}`} />
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
