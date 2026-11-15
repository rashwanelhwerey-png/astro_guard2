"use client";

import Waveform from "@/components/shared/Waveform";
import { SUBSYSTEMS } from "@/data/mission-profile";

/**
 * Raw channel table: envelope, live value, deviation and a 48-sample trace.
 * This is the view a flight controller would screenshot into the mission log.
 */
export default function SubsystemTable({ subsystems = [], history = {} }) {
  return (
    <div className="overflow-x-auto">
      <table className="telemetry-table">
        <thead>
          <tr>
            <th>Channel</th>
            <th>Envelope</th>
            <th className="text-right">Live</th>
            <th className="text-right">Δ band</th>
            <th>Trace</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {subsystems.map((item) => {
            const spec = SUBSYSTEMS.find((entry) => entry.key === item.key);
            const [min, max] = spec.band;
            const deviation = item.value < min ? item.value - min : item.value > max ? item.value - max : 0;
            const series = history[item.key] ?? [];

            return (
              <tr key={item.key}>
                <td className="text-slate-100">
                  {item.label}
                  <span className="ml-2 text-[10px] tracking-[0.14em] text-slate-600">
                    {item.key.toUpperCase()}
                  </span>
                </td>
                <td className="text-slate-400">
                  {min} … {max} {item.unit}
                </td>
                <td className="readout text-right">
                  {item.value}
                  <span className="ml-1 text-[10px] text-slate-500">{item.unit}</span>
                </td>
                <td
                  className={`readout text-right ${
                    deviation === 0 ? "text-slate-500" : "text-alert-caution"
                  }`}
                >
                  {deviation === 0 ? "—" : `${deviation > 0 ? "+" : ""}${Number(deviation.toFixed(2))}`}
                </td>
                <td className="w-[130px]">
                  <Waveform
                    data={series}
                    color={item.status === "nominal" ? "#2E9BFF" : "#FFB300"}
                    height={26}
                    strokeWidth={1.2}
                    fill={false}
                    glow={false}
                  />
                </td>
                <td>
                  <span
                    className={`chip ${
                      item.status === "caution"
                        ? "chip--caution"
                        : item.status === "critical"
                          ? "chip--critical"
                          : "chip--nominal"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
