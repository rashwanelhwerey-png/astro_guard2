"use client";

import MissionHeader from "@/components/dashboard/MissionHeader";
import AstronautHUD from "@/components/dashboard/AstronautHUD";
import GroundControl from "@/components/dashboard/GroundControl";
import WellnessDashboard from "@/components/wellness/WellnessDashboard";
import { useMission } from "@/components/dashboard/MissionProvider";

const SURFACES = {
  hud: AstronautHUD,
  ground: GroundControl,
  wellness: WellnessDashboard,
};

/**
 * Thin shell that swaps the mission surfaces. Only one is mounted at a time so
 * an inactive view costs no render work — which is why the wellness log lives in
 * WellnessProvider above this switch rather than inside its cards.
 */
export default function DashboardShell() {
  const { view, checking } = useMission();

  if (checking) {
    return (
      <main className="grid min-h-screen place-items-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon-cyan/80 animate-pulse">
          restoring mission session…
        </p>
      </main>
    );
  }

  const Surface = SURFACES[view];

  return (
    <main className="relative min-h-screen">
      <MissionHeader />
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6">
        <Surface />
      </div>
    </main>
  );
}
