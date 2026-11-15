"use client";

import SpaceBackdrop from "@/components/shared/SpaceBackdrop";
import MissionProvider from "@/components/dashboard/MissionProvider";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { WellnessProvider } from "@/components/wellness/WellnessProvider";

/**
 * Mission surface. `dim=0.86` keeps the astronaut image present but quieter
 * behind dense telemetry than on the access console.
 *
 * WellnessProvider sits above the surface switch: the logged day (water, rations,
 * a running EMS block) has to outlive a trip to the HUD and back.
 */
export default function DashboardPage() {
  return (
    <MissionProvider>
      <SpaceBackdrop dim={0.86} />
      <WellnessProvider>
        <DashboardShell />
      </WellnessProvider>
    </MissionProvider>
  );
}
