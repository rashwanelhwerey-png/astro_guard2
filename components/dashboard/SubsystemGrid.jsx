"use client";

import GaugeMeter from "@/components/shared/GaugeMeter";

/**
 * Subsystem meters. `columns` is the only difference between the HUD (2-up,
 * large) and Ground Control (4-up, dense) renderings.
 */
export default function SubsystemGrid({ subsystems = [], columns = 2, showBand = true }) {
  return (
    <div className={`grid gap-x-6 gap-y-4 sm:grid-cols-2 ${columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-2"}`}>
      {subsystems.map((item) => (
        <GaugeMeter
          key={item.key}
          label={item.label}
          value={item.value}
          unit={item.unit}
          ratio={item.ratio}
          status={item.status}
          detail={showBand ? item.status.toUpperCase() : undefined}
        />
      ))}
    </div>
  );
}
