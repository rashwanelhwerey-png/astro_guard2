"use client";

import Panel from "@/components/shared/Panel";
import SubsystemGrid from "@/components/dashboard/SubsystemGrid";
import SubsystemTable from "@/components/dashboard/SubsystemTable";
import CrewRoster from "@/components/dashboard/CrewRoster";
import AdvisoryFeed from "@/components/dashboard/AdvisoryFeed";
import CommsPanel from "@/components/dashboard/CommsPanel";
import HistoryStrip from "@/components/dashboard/HistoryStrip";
import { useMission } from "@/components/dashboard/MissionProvider";

/**
 * Flight-side surface: the whole mission, not just one suit.
 * Higher density, tabular data, crew + link + anomaly context.
 */
export default function GroundControl() {
  const { snapshot, pollMs } = useMission();
  const anomalies = snapshot.subsystems.filter((item) => item.status !== "nominal");

  return (
    <div className="space-y-4">
      <div className="glass-panel hud-frame rounded-xl px-5 py-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-eyebrow">Flight Control Room · Houston</p>
            <h1 className="title-glow font-display text-lg font-bold uppercase tracking-[0.14em] text-neon-cyan sm:text-2xl">
              NASA Ground Control
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`chip ${anomalies.length ? "chip--caution" : "chip--nominal"}`}>
              <span className="status-dot" />
              {anomalies.length} subsystem {anomalies.length === 1 ? "flag" : "flags"}
            </span>
            <span className="chip chip--idle">poll {pollMs / 1000}s</span>
            <span className="chip chip--idle">crew {snapshot.crew.length}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <Panel
            title="Vehicle & Suit Telemetry"
            eyebrow="all channels"
            right={<span className="chip chip--idle">{snapshot.stamp.slice(11, 19)}Z</span>}
          >
            <SubsystemGrid subsystems={snapshot.subsystems} columns={4} showBand={false} />
          </Panel>

          <Panel title="Crew Roster" eyebrow="4 EVA certified" bodyClassName="pt-1">
            <CrewRoster crew={snapshot.crew} />
          </Panel>

          <Panel title="Channel Detail" eyebrow="raw envelope" bodyClassName="pt-1">
            <SubsystemTable subsystems={snapshot.subsystems} history={snapshot.history} />
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Link Budget" eyebrow={snapshot.comms.node}>
            <CommsPanel comms={snapshot.comms} orbit={snapshot.orbit} />
          </Panel>

          <Panel title="Trend · last 48 polls" eyebrow="rolling window">
            <HistoryStrip history={snapshot.history} />
          </Panel>

          <Panel title="Anomaly & Advisory Log" eyebrow="flight rules" tone="amber" bodyClassName="pt-1">
            <AdvisoryFeed limit={6} stamp={snapshot.stamp} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
