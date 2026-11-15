"use client";

import GaugeMeter from "@/components/shared/GaugeMeter";

/**
 * DSN link budget: signal strength, throughput, latency and packet loss.
 * Ratios are normalised inside the component because each metric has its own
 * sane operating window.
 */
export default function CommsPanel({ comms, orbit }) {
  const rssiRatio = Math.min(1, Math.max(0, (comms.rssi + 100) / 40));
  const latencyRatio = Math.min(1, comms.latencyMs / 180);
  const lossRatio = Math.min(1, comms.packetLoss / 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Node" value={comms.node.split(" ")[1] ?? comms.node} sub={comms.node} />
        <Stat label="Ground vel" value={`${orbit.velocityKms} km/s`} sub="inertial" />
      </div>

      <div className="space-y-3">
        <GaugeMeter label="S-Band RSSI" value={comms.rssi} unit="dBm" ratio={rssiRatio} status={rssiRatio > 0.7 ? "nominal" : "caution"} />
        <GaugeMeter
          label="Latency"
          value={comms.latencyMs}
          unit="ms"
          ratio={latencyRatio}
          status={latencyRatio > 0.75 ? "caution" : "nominal"}
        />
        <GaugeMeter
          label="Packet loss"
          value={comms.packetLoss}
          unit="%"
          ratio={lossRatio}
          status={comms.packetLoss > 0.5 ? "caution" : "nominal"}
        />
      </div>

      <div className="flex items-center justify-between border-t border-neon-cyan/15 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
        <span>
          up <span className="readout text-neon-cyan/90">{comms.uplinkMbps}</span> Mbps
        </span>
        <span>
          down <span className="readout text-neon-cyan/90">{comms.downlinkMbps}</span> Mbps
        </span>
        <span className="text-alert-nominal">encrypted</span>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-md border border-neon-cyan/15 bg-void-deep/60 px-3 py-2">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="readout mt-0.5 truncate text-sm">{value}</p>
      <p className="truncate font-mono text-[9px] tracking-[0.12em] text-slate-600">{sub}</p>
    </div>
  );
}
