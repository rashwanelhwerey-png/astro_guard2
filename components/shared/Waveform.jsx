import { useMemo } from "react";

/**
 * SVG trace renderer shared by the HUD waveforms and the ground-control
 * sparklines. Values are normalised to the series' own min/max so a channel
 * stays legible regardless of its unit.
 */
export default function Waveform({
  data = [],
  color = "#00F0FF",
  height = 64,
  strokeWidth = 1.6,
  fill = true,
  glow = true,
  animate = false,
}) {
  const { line, area } = useMemo(() => {
    if (data.length < 2) return { line: "", area: "" };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const width = 100;
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / span) * (height - 6) - 3;
      return [Number(x.toFixed(3)), Number(y.toFixed(3))];
    });
    const linePath = points
      .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`)
      .join(" ");
    return {
      line: linePath,
      area: `${linePath} L100 ${height} L0 ${height} Z`,
    };
  }, [data, height]);

  const gradientId = useMemo(() => `wf-${color.replace(/[^a-z0-9]/gi, "")}`, [color]);

  if (!line) {
    return (
      <div
        className="flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600"
        style={{ height }}
      >
        awaiting samples
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height, display: "block" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill ? <path d={area} fill={`url(#${gradientId})`} /> : null}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={
          glow
            ? { filter: `drop-shadow(0 0 4px ${color})` }
            : undefined
        }
        strokeDasharray={animate ? "1000" : undefined}
        className={animate ? "animate-trace" : undefined}
      />
    </svg>
  );
}
