"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import MissionClock from "@/components/shared/MissionClock";
import { useMission } from "@/components/dashboard/MissionProvider";
import { clearSession } from "@/lib/mission/session";

const SURFACES = [
  { key: "hud", label: "Astronaut HUD", hint: "suit-side" },
  { key: "ground", label: "NASA Ground Control", hint: "flight-side" },
  { key: "wellness", label: "Daily Wellness", hint: "recovery bay" },
];

export default function MissionHeader() {
  const { session, view, setView, linkState, snapshot } = useMission();
  const router = useRouter();
  const operator = session?.operator ?? { name: "Unregistered", id: "ASTRO-XX-00" };

  const linkTone =
    linkState === "live" ? "chip--nominal" : linkState === "degraded" ? "chip--caution" : "chip--idle";

  function exitToAirlock() {
    clearSession();
    router.replace("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-neon-cyan/20 bg-void-deep/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md border border-neon-cyan/45 bg-neon-cyan/10 shadow-neon-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="1.5">
              <path d="M12 3l7 4v6c0 4-3 6.5-7 8-4-1.5-7-4-7-8V7l7-4Z" />
              <path d="M9.5 12.2l1.9 1.9 3.6-3.8" />
            </svg>
          </span>
          <div>
            <p className="font-display text-[13px] font-bold uppercase tracking-[0.2em] text-neon-cyan title-glow">
              AstroGuard OS
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
              {snapshot.mission.designation} · {operator.channel}
            </p>
          </div>
        </div>

        <div className="hidden lg:block">
          <MissionClock startIso={session?.handshake?.verifiedAt} />
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <span className={`chip ${linkTone}`}>
            <span className="status-dot" />
            telemetry {linkState}
          </span>

          <ViewToggle view={view} onChange={setView} />

          <div className="flex items-center gap-2 border-l border-neon-cyan/20 pl-3">
            <div className="text-right">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-200">
                {operator.name}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
                {operator.id} · {operator.clearance}
              </p>
            </div>
            <Link href="/" className="btn-ghost" onClick={exitToAirlock}>
              exit
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

/** Segmented control switching between the two mission surfaces. */
function ViewToggle({ view, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Mission surface"
      className="flex rounded-lg border border-neon-cyan/25 bg-void-deep/70 p-1"
    >
      {SURFACES.map((surface) => {
        const active = view === surface.key;
        return (
          <button
            key={surface.key}
            role="tab"
            type="button"
            aria-selected={active}
            title={`${surface.label} — ${surface.hint}`}
            onClick={() => onChange(surface.key)}
            className={`rounded-md px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-all duration-300 ${
              active
                ? "bg-neon-cyan/18 text-neon-cyan shadow-neon-sm"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {surface.label}
          </button>
        );
      })}
    </div>
  );
}
