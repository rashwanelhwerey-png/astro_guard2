"use client";

import { useEffect, useState } from "react";

/**
 * Mission clock. Ticks client-side only (mounted guard) so the server render
 * and the first client paint agree.
 */
export default function MissionClock({ startIso, className = "" }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const elapsedMs = Math.max(0, now - Date.parse(startIso ?? `${now - 5 * 86400000}`));
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const days = String(Math.floor(totalSeconds / 86400)).padStart(3, "0");
  const hours = String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  const utc = new Date(now).toISOString().slice(11, 19);

  return (
    <div className={`flex items-baseline gap-4 ${className}`}>
      <div>
        <p className="label-eyebrow">Mission Elapsed</p>
        <p className="readout text-lg leading-tight">
          T+{days}:{hours}:{minutes}:{seconds}
        </p>
      </div>
      <div className="border-l border-neon-cyan/20 pl-4">
        <p className="label-eyebrow">UTC</p>
        <p className="readout text-lg leading-tight">{utc}</p>
      </div>
    </div>
  );
}
