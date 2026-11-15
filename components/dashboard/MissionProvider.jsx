"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchTelemetry, getMissionSession } from "@/lib/mission/session";
import { buildTelemetrySnapshot } from "@/lib/mission/telemetry";

const POLL_MS = 4000;
const MissionContext = createContext(null);

/**
 * Mission data provider.
 * Owns the session gate, the telemetry poll, and the surface switch so every
 * panel subscribes to one clock instead of racing its own interval.
 */
export default function MissionProvider({ children }) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [view, setView] = useState("hud");
  const [snapshot, setSnapshot] = useState(() => buildTelemetrySnapshot());
  const [linkState, setLinkState] = useState("connecting");

  // Gate: no session → back to the access console. Runs until it has resolved a
  // session once; the `checking` guard matters because a later run would reset
  // `view` and bounce the operator off whichever surface they picked.
  useEffect(() => {
    if (!checking) return;
    const found = getMissionSession();
    if (!found) {
      router.replace("/");
      return;
    }
    setSession(found);
    setChecking(false);
    // Ground-certified operators open on the control console; EVA on the HUD.
    setView(found.operator?.clearance?.startsWith("GROUND") ? "ground" : "hud");
  }, [checking, router]);

  const poll = useCallback(async () => {
    try {
      const payload = await fetchTelemetry();
      if (payload?.telemetry) {
        setSnapshot(payload.telemetry);
        setLinkState("live");
      }
    } catch {
      // Offline or route unavailable: keep the local simulator running.
      setSnapshot(buildTelemetrySnapshot());
      setLinkState("degraded");
    }
  }, []);

  useEffect(() => {
    if (checking) return undefined;
    poll();
    const id = window.setInterval(poll, POLL_MS);
    return () => window.clearInterval(id);
  }, [checking, poll]);

  const value = useMemo(
    () => ({
      session,
      checking,
      view,
      setView,
      snapshot,
      linkState,
      pollMs: POLL_MS,
      refresh: poll,
    }),
    [session, checking, view, snapshot, linkState, poll]
  );

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}

export function useMission() {
  const context = useContext(MissionContext);
  if (!context) throw new Error("useMission must be used inside MissionProvider");
  return context;
}
