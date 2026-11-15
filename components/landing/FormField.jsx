"use client";

import { useId, useState } from "react";

/**
 * Labelled mission input. Owns only presentation + error surface; the value and
 * validation state are controlled by the parent form so step logic stays in one place.
 */
export default function FormField({
  label,
  hint,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  type = "text",
  autoComplete = "off",
  icon,
  autoFocus = false,
}) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isSecret = type === "password";
  const invalid = Boolean(error);

  return (
    <div>
      <label className="field-label" htmlFor={id}>
        <span>{label}</span>
        {hint ? <span className="text-[10px] tracking-[0.14em] text-slate-500">{hint}</span> : null}
      </label>

      <div className={`field-shell ${invalid ? "field-shell--invalid" : ""}`}>
        {icon ? (
          <span aria-hidden="true" className="text-neon-cyan/70">
            {icon}
          </span>
        ) : null}

        <input
          id={id}
          className="field-input"
          type={isSecret && revealed ? "text" : type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />

        {isSecret ? (
          <button
            type="button"
            onClick={() => setRevealed((current) => !current)}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 transition-colors hover:text-neon-cyan"
            aria-label={revealed ? "Hide passcode" : "Reveal passcode"}
          >
            {revealed ? "hide" : "show"}
          </button>
        ) : null}
      </div>

      {/* Reserved height keeps the card from jumping when an error appears. */}
      <p
        id={`${id}-error`}
        className={`mt-1.5 min-h-[16px] font-mono text-[11px] leading-tight ${
          invalid ? "text-alert-critical" : "text-transparent"
        }`}
      >
        {invalid ? `⚠ ${error}` : "—"}
      </p>
    </div>
  );
}
