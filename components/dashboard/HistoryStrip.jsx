"use client";

import Waveform from "@/components/shared/Waveform";
import { SUBSYSTEMS } from "@/data/mission-profile";

const CHANNELS = [
  { key: "o2", color: "#7CFF4F" },
  { key: "pressure", color: "#00F0FF" },
  { key: "power", color: "#FFB300" },
  { key: "neural", color: "#FF3DF2" },
];

/** Compact rolling-window sparklines for the trend board. */
export default function HistoryStrip({ history = {} }) {
  return (
    <div className="space-y-3">
      {CHANNELS.map((channel) => {
        const spec = SUBSYSTEMS.find((entry) => entry.key === channel.key);
        const series = history[channel.key] ?? [];
        const last = series.at(-1);
        const first = series[0];
        const delta = last != null && first != null ? Number((last - first).toFixed(2)) : 0;

        return (
          <div key={channel.key} className="flex items-center gap-3">
            <div className="w-[110px] shrink-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
                {spec?.label ?? channel.key}
              </p>
              <p className="readout text-sm">
                {last ?? "—"}
                <span className="ml-1 text-[10px] text-slate-600">{spec?.unit}</span>
              </p>
            </div>
            <div className="min-w-0 flex-1 rounded border border-neon-cyan/12 bg-void-deep/60 px-1.5 py-1">
              <Waveform data={series} color={channel.color} height={30} strokeWidth={1.2} fill={false} glow={false} />
            </div>
            <span
              className={`w-[52px] shrink-0 text-right font-mono text-[10px] ${
                delta > 0 ? "text-alert-nominal" : delta < 0 ? "text-alert-caution" : "text-slate-600"
              }`}
            >
              {delta > 0 ? "▲" : delta < 0 ? "▼" : "•"} {Math.abs(delta)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
