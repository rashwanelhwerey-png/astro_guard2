"use client";

import { useMemo } from "react";
import { ADVISORIES } from "@/data/mission-profile";

/**
 * Flight-rules advisory feed. Levels come from the static profile so the mix of
 * nominal/caution/critical rows stays stable; `stamp` is the current telemetry
 * tick, which keeps the relative timestamps honest across polls.
 */
export default function AdvisoryFeed({ limit = 8, stamp }) {
  const rows = useMemo(() => {
    const now = stamp ? Date.parse(stamp) : Date.now();
    return ADVISORIES.slice(0, limit).map((advisory) => ({
      ...advisory,
      stamp: new Date(now + advisory.utcOffsetMin * 60000).toISOString().slice(11, 19),
    }));
  }, [limit, stamp]);

  return (
    <ul className="space-y-3 divide-y divide-slate-500/10">
      {rows.map((row) => (
        <li key={row.id} className="flex gap-3 pt-2 first:pt-0">
          <span
            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
              row.level === "critical"
                ? "bg-alert-critical shadow-[0_0_10px_#FF4D6D]"
                : row.level === "caution"
                  ? "bg-alert-caution shadow-[0_0_10px_#FFB300]"
                  : "bg-alert-nominal shadow-[0_0_10px_#7CFF4F]"
            }`}
          />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
              <span className="text-neon-cyan/70">{row.source}</span>
              <span>·</span>
              <span>{row.id}</span>
              <span>·</span>
              <span>{row.stamp}Z</span>
            </p>
            <p className="mt-0.5 text-[13px] leading-snug text-slate-300">{row.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
