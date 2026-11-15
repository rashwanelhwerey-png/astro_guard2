"use client";

import { useEffect, useMemo, useState } from "react";
import FormField from "@/components/landing/FormField";
import StepIndicator from "@/components/landing/StepIndicator";
import { validateStep } from "@/lib/mission/validation";

/**
 * Step 1 — NASA agency sync link.
 * Shown as its own component so the card body stays a switch of three screens.
 */
function AgencySyncStep({ values, errors, onChange, onTouched }) {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-slate-400">
        Paste your agency portal link or type the uplink channel code issued with your
        flight assignment. AstroGuard binds the session to that channel for the whole EVA.
      </p>

      <FormField
        label="Agency Sync Link / Code"
        hint="URL or channel code"
        placeholder="NASA-ISS-ORBIT-2026"
        value={values.agencyLink}
        error={errors.agencyLink}
        icon={<LinkGlyph />}
        autoFocus
        onChange={(agencyLink) => onChange({ agencyLink })}
        onBlur={() => onTouched("agencyLink")}
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
          recent
        </span>
        {["NASA-ISS-ORBIT-2026", "NASA-DSN-GOLDSTONE", "NASA-JSC-CREW2"].map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => onChange({ agencyLink: code })}
            className="btn-ghost !py-1 !text-[10px]"
          >
            {code}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Step 2 — identity + passcode, side by side on wide viewports. */
function IdentityStep({ values, errors, onChange, onTouched }) {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-slate-400">
        Declare who is on the line. Display names and badge IDs are both accepted — the
        vault resolves either one to your crew record.
      </p>

      <div className="grid gap-x-4 sm:grid-cols-2">
        <FormField
          label="Astronaut Name / ID"
          hint="Field A"
          placeholder="Kholoud Hussein"
          value={values.astronautName}
          error={errors.astronautName}
          icon={<BadgeGlyph />}
          autoComplete="username"
          autoFocus
          onChange={(astronautName) => onChange({ astronautName })}
          onBlur={() => onTouched("astronautName")}
        />
        <FormField
          label="Secure Passcode"
          hint="Field B"
          type="password"
          placeholder="••••••••"
          value={values.passcode}
          error={errors.passcode}
          icon={<KeyGlyph />}
          autoComplete="current-password"
          onChange={(passcode) => onChange({ passcode })}
          onBlur={() => onTouched("passcode")}
        />
      </div>

      <p className="font-mono text-[10px] leading-relaxed tracking-[0.08em] text-slate-500">
        Example identity: <span className="text-neon-cyan/80">ASTRO-KH-07</span> · passcode
        minimum 6 characters · never reused across missions.
      </p>
    </div>
  );
}

/** Step 3 — pre-flight summary + the launch control. */
function LaunchStep({ values, submitting, error, onLaunch }) {
  const summary = useMemo(
    () => [
      { label: "Channel", value: values.agencyLink.toUpperCase() },
      { label: "Operator", value: values.astronautName },
      { label: "Passcode", value: "•".repeat(Math.max(6, values.passcode.length)) },
    ],
    [values]
  );

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-slate-400">
        Everything checks out. Initiating will open an encrypted telemetry channel, verify
        your identity against the crew vault, and boot the AstroGuard OS surface.
      </p>

      <dl className="glass-panel--soft rounded-lg p-3">
        {summary.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 border-b border-slate-500/15 py-1.5 last:border-0"
          >
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
              {row.label}
            </dt>
            <dd className="readout truncate text-xs">{row.value}</dd>
          </div>
        ))}
      </dl>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-alert-critical/50 bg-alert-critical/10 px-3 py-2 font-mono text-[11px] text-alert-critical"
        >
          {error}
        </p>
      ) : null}

      <button type="button" className="btn-launch" onClick={onLaunch} disabled={submitting}>
        {submitting ? "Transmitting…" : "Initiate AstroGuard OS"}
      </button>

      <p className="text-center font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
        unauthorised access is logged and reported to flight rules
      </p>
    </div>
  );
}

/**
 * Glassmorphic mission-access card.
 * Owns step state, per-step validation, and the keyboard contract
 * (Enter advances, Escape returns to step 1).
 */
export default function OnboardingCard({ onLaunch, submitting = false, submitError = null }) {
  const [step, setStep] = useState(1);
  const [maxReached, setMaxReached] = useState(1);
  const [values, setValues] = useState({
    agencyLink: "",
    astronautName: "",
    passcode: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const patch = (changes) => {
    setValues((current) => ({ ...current, ...changes }));
    // Clear any error for a field the operator is actively editing.
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(changes)) delete next[key];
      return next;
    });
  };

  const markTouched = (field) => {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors((current) => ({ ...current, ...validateStep(step, values) }));
  };

  const applyValidation = (stepErrors) => {
    const invalid = Object.entries(stepErrors).filter(([, message]) => message !== null);
    if (invalid.length === 0) return true;
    setErrors((current) => ({ ...current, ...Object.fromEntries(invalid) }));
    setTouched((current) => ({
      ...current,
      ...Object.fromEntries(invalid.map(([field]) => [field, true])),
    }));
    return false;
  };

  const advance = () => {
    if (!applyValidation(validateStep(step, values))) return;
    setErrors({});
    const nextStep = Math.min(3, step + 1);
    setStep(nextStep);
    setMaxReached((current) => Math.max(current, nextStep));
  };

  const goBack = () => setStep((current) => Math.max(1, current - 1));

  /** Step 3's launch control re-checks every field before transmitting. */
  const launch = () => {
    const allErrors = validateStep(3, values);
    const invalid = Object.entries(allErrors).find(([, message]) => message !== null);
    if (invalid) {
      applyValidation(allErrors);
      setStep(invalid[0] === "agencyLink" ? 1 : 2);
      return;
    }
    onLaunch?.(values);
  };

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape" && step > 1) goBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  return (
    <div className="glass-panel hud-frame relative w-full max-w-[560px] overflow-hidden rounded-2xl">
      {/* CRT sweep sells the "live console" feel without any imagery cost. */}
      <span aria-hidden="true" className="fx-scanline pointer-events-none absolute inset-0" />

      <header className="relative border-b border-neon-cyan/20 px-6 pb-5 pt-6 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-eyebrow">Bio-Neural Space OS · v4.1.7</p>
            <h1 className="title-glow mt-1 font-display text-[15px] font-bold uppercase leading-snug tracking-[0.16em] text-neon-cyan sm:text-lg">
              AstroGuard <span className="text-slate-500">// </span>
              <br />
              Mission Secure Access
            </h1>
          </div>
          <StatusBadge />
        </div>

        <div className="mt-5">
          <StepIndicator current={step} maxReached={maxReached} onSelect={setStep} />
        </div>
      </header>

      <form
        className="relative px-6 py-6 sm:px-8"
        onSubmit={(event) => {
          event.preventDefault();
          if (step < 3) advance();
          else launch();
        }}
      >
        <fieldset className="space-y-5 border-0 p-0">
          <legend className="sr-only">Mission access credentials</legend>

          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
              Step {step} of 3 —{" "}
              <span className="text-neon-cyan">
                {step === 1 ? "Agency Sync" : step === 2 ? "Astronaut Identity" : "Launch Sequence"}
              </span>
            </p>
            <span className="font-mono text-[10px] tracking-[0.18em] text-slate-600">
              {["LINK", "AUTH", "GO"][step - 1]}
            </span>
          </div>

          {step === 1 ? (
            <AgencySyncStep values={values} errors={errors} onChange={patch} onTouched={markTouched} />
          ) : null}
          {step === 2 ? (
            <IdentityStep values={values} errors={errors} onChange={patch} onTouched={markTouched} />
          ) : null}
          {step === 3 ? (
            <LaunchStep
              values={values}
              submitting={submitting}
              error={submitError}
              onLaunch={launch}
            />
          ) : null}
        </fieldset>

        {step < 3 ? (
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={goBack}
              className={`btn-ghost ${step === 1 ? "invisible" : ""}`}
            >
              ← Back
            </button>
            <button type="submit" className="btn-launch !w-auto !px-8 !py-3 !text-[12px]">
              Continue →
            </button>
          </div>
        ) : null}

        <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">
          press enter to advance · esc to step back
        </p>
      </form>
    </div>
  );
}

/** Live pulsing status badge — cycles READY → UPLINK LOCK → READY. */
function StatusBadge() {
  const states = ["SYSTEM READY", "UPLINK LOCK", "VAULT ONLINE"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((current) => (current + 1) % states.length), 3200);
    return () => window.clearInterval(id);
  }, [states.length]);

  return (
    <div className="flex flex-col items-end gap-2">
      <span className="chip chip--nominal animate-pulse-ring">
        <span className="status-dot" />
        {states[index]}
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">
        3 of 3 nodes green
      </span>
    </div>
  );
}

/* --- inline glyphs: tiny, dependency-free, and tinted by the parent --- */
function LinkGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M10 14a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 5.5" />
      <path d="M14 10a5 5 0 0 0-7.07 0L4.1 12.83a5 5 0 0 0 7.07 7.07l1.32-1.32" />
    </svg>
  );
}
function BadgeGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}
function KeyGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
