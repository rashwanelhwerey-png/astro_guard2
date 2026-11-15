"use client";

import { useEffect, useState } from "react";
import { SYNC_SEQUENCE } from "@/data/mission-profile";

/**
 * Futuristic boot state shown while /api/auth/sync is in flight.
 * Progress is driven by real elapsed time and capped at 92% until the API
 * resolves, so the UI never lies about being done before the server agrees.
 */
export default function SyncOverlay({ active, operator, handshake, error }) {
  const [progress, setProgress] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      setLineIndex(0);
      return undefined;
    }
    const startedAt = Date.now();
    const id = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setProgress(Math.min(92, Math.round((elapsed / 2600) * 92)));
      setLineIndex(Math.min(SYNC_SEQUENCE.length - 1, Math.floor(elapsed / 450)));
    }, 90);
    return () => window.clearInterval(id);
  }, [active]);

  useEffect(() => {
    if (handshake) setProgress(100);
  }, [handshake]);

  if (!active && !error) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 grid place-items-center bg-void-deep/88 px-6 backdrop-blur-xl"
    >
      <div className="glass-panel hud-frame relative w-full max-w-[520px] overflow-hidden rounded-2xl px-6 py-8 sm:px-10">
        <span aria-hidden="true" className="fx-scanline pointer-events-none absolute inset-0" />

        {error ? (
          <div className="relative text-center">
            <p className="label-eyebrow !text-alert-critical">Sync Aborted</p>
            <h2 className="title-glow mt-2 font-display text-lg uppercase tracking-[0.14em] text-alert-critical">
              Uplink Rejected
            </h2>
            <p className="mt-3 font-mono text-xs leading-relaxed text-slate-300">{error}</p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
              returning to access console…
            </p>
          </div>
        ) : (
          <>
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <p className="label-eyebrow">Handshake · {handshake?.protocol ?? "ASTROGUARD-TL/1.2"}</p>
                <h2 className="title-glow mt-1 font-display text-base uppercase tracking-[0.12em] text-neon-cyan sm:text-lg">
                  Establishing Orbital Telemetry Sync…
                </h2>
              </div>
              <RadarSpinner />
            </div>

            <div className="relative mt-7">
              <div className="flex items-end justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  {operator ? `Binding ${operator.id}` : "Binding channel"}
                </span>
                <span className="readout text-xl">{progress}%</span>
              </div>
              <div className="meter-track mt-2 h-2">
                <div className="meter-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ul className="relative mt-6 space-y-1.5 font-mono text-[11px] leading-relaxed">
              {SYNC_SEQUENCE.map((line, index) => {
                const done = index < lineIndex || Boolean(handshake);
                const current = index === lineIndex && !handshake;
                return (
                  <li
                    key={line}
                    className={`flex items-center gap-2 transition-opacity duration-300 ${
                      done ? "text-alert-nominal" : current ? "text-neon-cyan" : "text-slate-600"
                    }`}
                  >
                    <span className="w-4 shrink-0">{done ? "✓" : current ? "▸" : "·"}</span>
                    <span className="truncate">{line}</span>
                  </li>
                );
              })}
            </ul>

            {handshake ? (
              <p className="relative mt-6 border-t border-neon-cyan/20 pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                cipher {handshake.cipher} · node {handshake.node} · rtt {handshake.roundTripMs}ms
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function RadarSpinner() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true" className="shrink-0">
      <circle cx="23" cy="23" r="20" fill="none" stroke="rgba(0,240,255,0.18)" strokeWidth="1.5" />
      <circle
        cx="23"
        cy="23"
        r="20"
        fill="none"
        stroke="#00F0FF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="34 92"
        style={{ transformOrigin: "23px 23px", animation: "spin 1.4s linear infinite" }}
      />
      <circle cx="23" cy="23" r="3" fill="#00F0FF" opacity="0.8" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </svg>
  );
}
