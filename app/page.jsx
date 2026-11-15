"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OnboardingCard from "@/components/landing/OnboardingCard";
import SyncOverlay from "@/components/landing/SyncOverlay";
import SpaceBackdrop from "@/components/shared/SpaceBackdrop";
import { MISSION } from "@/data/mission-profile";
import { buildSyncPayload } from "@/lib/mission/validation";
import { getMissionSession, saveSession } from "@/lib/mission/session";

/** Redirect delay lets the operator see the 100% handshake state. */
const TRANSITION_MS = 700;

export default function MissionAccessPage() {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [resumable, setResumable] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // A live session means the operator already cleared access — offer a resume.
  useEffect(() => {
    setResumable(Boolean(getMissionSession()));
  }, []);

  async function handleLaunch(values) {
    window.clearTimeout(timer.current);
    setError(null);
    setResult(null);
    setSyncing(true);

    try {
      const response = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(buildSyncPayload(values)),
      });
      const payload = await response.json();

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error?.message ?? `Sync failed (${response.status})`);
      }

      saveSession({
        token: payload.token,
        expiresAt: payload.expiresAt,
        sessionId: payload.sessionId,
        operator: payload.operator,
        handshake: payload.handshake,
      });
      setResult(payload);
      setSyncing(false);
      timer.current = window.setTimeout(
        () => router.push(payload.redirect ?? "/dashboard"),
        TRANSITION_MS
      );
    } catch (syncError) {
      setSyncing(false);
      setError(syncError.message);
      // Hold the failure state briefly, then drop back to the console.
      timer.current = window.setTimeout(() => setError(null), 2600);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col">
      <SpaceBackdrop />

      <TopRibbon />

      <div className="relative mx-auto grid w-full max-w-[1180px] flex-1 items-center gap-10 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <MissionBrief />

        <div className="flex flex-col items-center gap-4">
          <OnboardingCard
            onLaunch={handleLaunch}
            submitting={syncing}
            submitError={result ? null : error}
          />

          {resumable && !syncing ? (
            <Link
              href="/dashboard"
              className="btn-ghost !border-neon-cyan/40 !text-neon-cyan/90"
            >
              ▸ resume active session
            </Link>
          ) : null}
        </div>
      </div>

      <FooterStrip />

      <SyncOverlay active={syncing} operator={result?.operator} handshake={result?.handshake} error={error} />
    </main>
  );
}

/* ---------------------------------------------------------------- */

function TopRibbon() {
  return (
    <header className="relative flex items-center justify-between gap-4 border-b border-neon-cyan/15 bg-void-deep/45 px-5 py-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <AgenciesMark />
        <div>
          <p className="font-display text-[12px] font-bold uppercase tracking-[0.24em] text-neon-cyan">
            AstroGuard
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">
            bio-neural space operations
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
        <span className="hidden sm:inline">{MISSION.designation}</span>
        <span className="chip chip--idle">
          <span className="status-dot text-alert-nominal" />
          pre-flight
        </span>
      </div>
    </header>
  );
}

function MissionBrief() {
  const facts = [
    { label: "Orbit regime", value: MISSION.orbit.regime, detail: `${MISSION.orbit.altitudeKm} km` },
    { label: "Inclination", value: `${MISSION.orbit.inclinationDeg}°`, detail: "ISS ground track" },
    { label: "Velocity", value: `${MISSION.orbit.velocityKms} km/s`, detail: "Mach 22" },
    { label: "Uplink", value: `${MISSION.agency.uplinkMbps} Mbps`, detail: MISSION.agency.node },
  ];

  return (
    <section className="relative max-w-[520px]">
      <p className="label-eyebrow">Secure access console · step-by-step</p>
      <h2 className="title-glow mt-3 font-display text-2xl font-bold uppercase leading-tight tracking-[0.08em] text-slate-50 sm:text-4xl">
        Your suit is the
        <br />
        <span className="text-neon-cyan">interface.</span>
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-slate-300">
        AstroGuard binds bio-neural telemetry from your EVA suit to a live mission surface.
        Complete three checks — agency channel, crew identity, launch — and the OS boots into
        either your personal <span className="text-neon-cyan">Astronaut HUD</span> or the full{" "}
        <span className="text-neon-cyan">NASA Ground Control</span> console.
      </p>

      <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className="glass-panel--soft rounded-lg px-3 py-2.5">
            <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
              {fact.label}
            </dt>
            <dd className="readout mt-1 text-sm">{fact.value}</dd>
            <dd className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">
              {fact.detail}
            </dd>
          </div>
        ))}
      </dl>

      <ol className="mt-7 space-y-2.5">
        {[
          "Paste the agency sync link or channel code from your flight assignment.",
          "Declare your callsign and secure passcode to bind the session.",
          "Initiate the OS — telemetry verifies, then the console opens.",
        ].map((line, index) => (
          <li key={line} className="flex items-start gap-3 text-sm text-slate-400">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border border-neon-cyan/40 font-mono text-[10px] text-neon-cyan">
              {index + 1}
            </span>
            {line}
          </li>
        ))}
      </ol>
    </section>
  );
}

function FooterStrip() {
  return (
    <footer className="relative flex flex-wrap items-center justify-between gap-3 border-t border-neon-cyan/15 bg-void-deep/45 px-5 py-3 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500 backdrop-blur-md">
      <span>simulated mission data · no live agency connection</span>
      <span className="flex items-center gap-4">
        <span>ASTROGUARD-TL/1.2</span>
        <span className="text-alert-nominal">vault: online</span>
      </span>
    </footer>
  );
}

function AgenciesMark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-md border border-neon-cyan/40 bg-neon-cyan/10 shadow-neon-sm">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.5">
        <circle cx="12" cy="12" r="4" />
        <path d="M2.5 12c3-5 6.5-7.5 9.5-7.5S18.5 7 21.5 12c-3 5-6.5 7.5-9.5 7.5S5.5 17 2.5 12Z" />
        <path d="M12 2v2M12 20v2" />
      </svg>
    </span>
  );
}
