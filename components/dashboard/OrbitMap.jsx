"use client";

import { useMemo } from "react";
import { MISSION } from "@/data/mission-profile";

/**
 * Equirectangular ground track.
 * The vehicle position comes straight from the telemetry seed, so the marker
 * moves in lockstep with the numeric readouts instead of drifting on its own clock.
 */
export default function OrbitMap({ orbit }) {
  const inclination = MISSION.orbit.inclinationDeg;

  const trace = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 72; i += 1) {
      const phase = i / 72;
      const lon = -180 + phase * 360;
      const lat = Math.sin(phase * Math.PI * 2) * inclination;
      points.push([((lon + 180) / 360) * 100, 25 - (lat / 180) * 25]);
    }
    return points
      .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
      .join(" ");
  }, [inclination]);

  const x = ((orbit.longitude + 180) / 360) * 100;
  const y = 25 - (orbit.latitude / 180) * 25;

  return (
    <div className="relative">
      <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="h-[220px] w-full sm:h-[260px]">
        <defs>
          <linearGradient id="orb-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b2a4a" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#03060F" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="100" height="50" fill="url(#orb-sea)" />

        {/* graticule */}
        {Array.from({ length: 9 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={(i + 1) * 10}
            y1="0"
            x2={(i + 1) * 10}
            y2="50"
            stroke="rgba(0,240,255,0.12)"
            strokeWidth="0.2"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={(i + 1) * 10}
            x2="100"
            y2={(i + 1) * 10}
            stroke="rgba(0,240,255,0.12)"
            strokeWidth="0.2"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(0,240,255,0.3)" strokeWidth="0.3" />

        {/* stylised continents — abstract landmasses, not survey data */}
        <g fill="rgba(124,255,79,0.14)" stroke="rgba(124,255,79,0.28)" strokeWidth="0.25">
          <path d="M12 12 L22 10 L26 18 L20 26 L14 22 Z" />
          <path d="M24 30 L30 28 L33 38 L27 44 L23 36 Z" />
          <path d="M48 10 L62 9 L66 17 L56 22 L49 16 Z" />
          <path d="M54 26 L61 25 L63 36 L57 42 L53 33 Z" />
          <path d="M70 12 L88 13 L92 22 L78 27 L71 20 Z" />
          <path d="M82 32 L92 31 L94 38 L85 41 Z" />
        </g>

        {/* orbit sine trace */}
        <path
          d={trace}
          fill="none"
          stroke="#00F0FF"
          strokeWidth="1.2"
          strokeDasharray="3 2"
          opacity="0.75"
          vectorEffect="non-scaling-stroke"
        />

        {/* terminator / day-night band */}
        <rect
          x={Math.max(0, x - 34)}
          y="0"
          width="34"
          height="50"
          fill="rgba(3,6,15,0.5)"
        />

        {/* vehicle */}
        <g transform={`translate(${x} ${y})`}>
          <circle r="3.4" fill="none" stroke="#FF3DF2" strokeWidth="0.4" opacity="0.7" />
          <circle r="1.5" fill="#FF3DF2" />
          <line x1="-5" y1="0" x2="5" y2="0" stroke="#FF3DF2" strokeWidth="0.3" opacity="0.6" />
          <line x1="0" y1="-5" x2="0" y2="5" stroke="#FF3DF2" strokeWidth="0.3" opacity="0.6" />
        </g>
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Cell label="Phase" value={`${(orbit.phase * 100).toFixed(1)}%`} />
        <Cell label="Inclination" value={`${inclination}°`} />
        <Cell label="Period" value={`${MISSION.orbit.periodMin} min`} />
        <Cell label="Orbits" value={String(orbit.orbitsCompleted)} />
      </div>
    </div>
  );
}

function Cell({ label, value }) {
  return (
    <div className="rounded-md border border-neon-cyan/15 bg-void-deep/60 px-3 py-2">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="readout mt-0.5 text-sm">{value}</p>
    </div>
  );
}
