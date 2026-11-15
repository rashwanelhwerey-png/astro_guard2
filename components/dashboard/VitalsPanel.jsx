"use client";

import { useMemo } from "react";
import Waveform from "@/components/shared/Waveform";
import { BIO_CHANNELS } from "@/data/mission-profile";

/**
 * Bio-neural vitals block for the helmet HUD.
 * Three traces + three big numerals: the astronaut reads it with gloves on.
 */
export default function VitalsPanel({ snapshot, operator }) {
  const { waveforms, subsystems, crew } = snapshot;

  const self = useMemo(() => {
    const byId = crew.find((member) => member.id === operator?.id);
    if (byId) return byId;
    // Demo identity may not be in the roster — synthesise from live channels.
    const heart = subsystems.find((item) => item.key === "heart");
    const o2 = subsystems.find((item) => item.key === "o2");
    return {
      name: operator?.name ?? "Unregistered",
      id: operator?.id ?? "ASTRO-XX-00",
      role: "EVA Lead",
      suit: "xEMU-07",
      heart: Math.round(heart?.value ?? 72),
      o2: o2?.value ?? 98,
      status: o2?.status ?? "nominal",
    };
  }, [crew, subsystems, operator]);

  const traces = { ecg: waveforms.ecg, spo2: waveforms.spo2, eeg: waveforms.eeg };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Big label="Cardiac" value={self.heart} unit="bpm" tone={self.heart > 104 ? "caution" : "nominal"} />
        <Big label="SpO₂" value={self.o2} unit="%" tone={self.o2 < 93 ? "caution" : "nominal"} />
        <Big
          label="Neural"
          value={subsystems.find((item) => item.key === "neural")?.value ?? 0}
          unit="ms"
          tone="nominal"
        />
      </div>

      <div className="space-y-3">
        {BIO_CHANNELS.map((channel) => (
          <div key={channel.key}>
            <div className="field-label">
              <span style={{ color: channel.color }}>{channel.label}</span>
              <span className="text-[10px] tracking-[0.14em] text-slate-600">
                {traces[channel.key]?.length ?? 0} samples
              </span>
            </div>
            <div className="rounded-md border border-neon-cyan/12 bg-void-deep/65 px-2 py-1">
              <Waveform data={traces[channel.key]} color={channel.color} height={44} strokeWidth={1.4} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neon-cyan/15 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
        <span>
          suit <span className="text-slate-300">{self.suit}</span> · {self.role}
        </span>
        <span className={`chip ${self.status === "caution" ? "chip--caution" : "chip--nominal"}`}>
          <span className="status-dot" />
          {self.status === "caution" ? "monitor" : "bio stable"}
        </span>
      </div>
    </div>
  );
}

function Big({ label, value, unit, tone }) {
  const toneClass = tone === "caution" ? "text-alert-caution" : "text-slate-50";
  return (
    <div className="rounded-lg border border-neon-cyan/18 bg-void-deep/65 px-3 py-2.5 text-center">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className={`readout mt-1 text-2xl leading-none ${toneClass}`}>{value}</p>
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-600">{unit}</p>
    </div>
  );
}
