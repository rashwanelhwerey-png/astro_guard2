"use client";

import Panel from "@/components/shared/Panel";
import OrbitMap from "@/components/dashboard/OrbitMap";
import VitalsPanel from "@/components/dashboard/VitalsPanel";
import SubsystemGrid from "@/components/dashboard/SubsystemGrid";
import AdvisoryFeed from "@/components/dashboard/AdvisoryFeed";
import { useMission } from "@/components/dashboard/MissionProvider";

/**
 * Suit-side surface: what the astronaut sees inside the helmet.
 * Big legible readouts, low information density, one glance = one decision.
 */
export default function AstronautHUD() {
  const { snapshot, session } = useMission();
  const { orbit, mission } = snapshot;

  return (
    <div className="space-y-4">
      <div className="glass-panel hud-frame flex flex-wrap items-center justify-between gap-4 rounded-xl px-5 py-4">
        <div>
          <p className="label-eyebrow">Extravehicular Activity · Suit Side</p>
          <h1 className="title-glow font-display text-lg font-bold uppercase tracking-[0.14em] text-neon-cyan sm:text-2xl">
            {session?.operator?.name ?? "Astronaut"} — HUD
          </h1>
        </div>
        <div className="flex flex-wrap gap-5 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
          <Readout label="Alt" value={`${orbit.altitudeKm} km`} />
          <Readout label="Vel" value={`${orbit.velocityKms} km/s`} />
          <Readout label="Lat" value={`${orbit.latitude.toFixed(1)}°`} />
          <Readout label="Lon" value={`${orbit.longitude.toFixed(1)}°`} />
          <Readout label="Eclipse" value={`T−${orbit.nextEclipseInMin} min`} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <div className="space-y-4">
          <Panel
            title="Ground Track"
            eyebrow={mission.orbit.regime}
            right={<span className="chip chip--idle">orbit {orbit.orbitsCompleted}</span>}
          >
            <OrbitMap orbit={orbit} />
          </Panel>

          <Panel title="Suit Subsystems" eyebrow="live envelope" bodyClassName="pt-1">
            <SubsystemGrid subsystems={snapshot.subsystems} columns={2} />
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Bio-Neural Vitals" eyebrow="ecg · spo₂ · eeg">
            <VitalsPanel snapshot={snapshot} operator={session?.operator} />
          </Panel>

          <Panel title="Advisory Feed" eyebrow="flight rules" tone="amber" bodyClassName="pt-1">
            <AdvisoryFeed limit={3} stamp={snapshot.stamp} />
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Readout({ label, value }) {
  return (
    <div>
      <p className="text-[9px] tracking-[0.2em] text-slate-500">{label}</p>
      <p className="readout text-sm normal-case tracking-normal">{value}</p>
    </div>
  );
}
