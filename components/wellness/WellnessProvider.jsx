"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { EMS, HYDRATION, RATION_PACKS, SLEEP, buildWellnessView } from "@/lib/wellness/protocol";

/**
 * Session-scoped wellness log.
 *
 * Lives above the surface switch (not inside the cards) because DashboardShell
 * unmounts the inactive view — card-local state would erase a half-finished
 * hydration log every time the operator glanced at the HUD.
 */
const STORAGE_KEY = "astroguard.wellness.v1";

const EMPTY_LOG = {
  sleepHours: 7,
  waterMl: 0,
  packs: [],
  ems: { startedAt: null, targetSec: EMS.sessionMin * 60, loadPct: 70, doneSec: 0 },
};

const WellnessContext = createContext(null);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** Read + sanitise the stored log so a tampered payload can't crash the bay. */
function readStoredLog() {
  if (typeof window === "undefined") return EMPTY_LOG;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_LOG;
    const parsed = JSON.parse(raw);
    return {
      sleepHours: clamp(Number(parsed.sleepHours) || EMPTY_LOG.sleepHours, SLEEP.min, SLEEP.max),
      waterMl: clamp(Math.round(Number(parsed.waterMl) || 0), 0, 20000),
      packs: Array.isArray(parsed.packs)
        ? parsed.packs.filter((id) => RATION_PACKS.some((pack) => pack.id === id))
        : [],
      ems: {
        startedAt: Number(parsed.ems?.startedAt) || null,
        targetSec: Number(parsed.ems?.targetSec) || EMS.sessionMin * 60,
        loadPct: clamp(Number(parsed.ems?.loadPct) || 0, 0, 100),
        doneSec: Math.max(0, Math.round(Number(parsed.ems?.doneSec) || 0)),
      },
    };
  } catch {
    return EMPTY_LOG;
  }
}

export function WellnessProvider({ children }) {
  // Safe as a lazy initialiser: the shell renders the session-gate placeholder on
  // the server, so no card markup exists in the HTML for storage values to clash with.
  const [log, setLog] = useState(readStoredLog);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
    } catch {
      // Private mode / quota — the bay still works for this sitting.
    }
  }, [log]);

  // One clock for the whole bay, and only ticking while a session runs.
  const running = Boolean(log.ems.startedAt);
  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // Freeze an elapsed block into doneSec when the operator stops early.
  const stopEms = useCallback(() => {
    setLog((current) => {
      if (!current.ems.startedAt) return current;
      const elapsed = Math.max(0, Math.floor((Date.now() - current.ems.startedAt) / 1000));
      return {
        ...current,
        ems: {
          ...current.ems,
          startedAt: null,
          doneSec: clamp(current.ems.doneSec + elapsed, 0, current.ems.targetSec),
        },
      };
    });
  }, []);

  // A finished session banks the full target instead of rolling on forever.
  useEffect(() => {
    if (!running) return;
    const elapsed = Math.floor((now - log.ems.startedAt) / 1000);
    if (elapsed >= log.ems.targetSec) stopEms();
  }, [running, now, log.ems.startedAt, log.ems.targetSec, stopEms]);

  const value = useMemo(() => {
    const view = buildWellnessView(log, now);
    return {
      ...view,
      log,
      setSleepHours: (hours) =>
        setLog((current) => ({
          ...current,
          sleepHours: clamp(Number(hours) || SLEEP.min, SLEEP.min, SLEEP.max),
        })),
      addWater: (ml) =>
        setLog((current) => ({
          ...current,
          waterMl: clamp(current.waterMl + ml, 0, 20000),
        })),
      resetWater: () => setLog((current) => ({ ...current, waterMl: 0 })),
      logPack: (id) =>
        setLog((current) =>
          RATION_PACKS.some((pack) => pack.id === id)
            ? { ...current, packs: [...current.packs, id] }
            : current
        ),
      undoPack: () =>
        setLog((current) => ({ ...current, packs: current.packs.slice(0, -1) })),
      resetIntake: () => setLog((current) => ({ ...current, packs: [] })),
      setLoadPct: (loadPct) =>
        setLog((current) => ({
          ...current,
          ems: { ...current.ems, loadPct: clamp(Math.round(loadPct), 0, 100) },
        })),
      startEms: () => {
        setNow(Date.now());
        setLog((current) => ({
          ...current,
          ems: {
            ...current.ems,
            startedAt: Date.now(),
            targetSec: current.ems.targetSec || EMS.sessionMin * 60,
          },
        }));
      },
      stopEms,
      resetEms: () =>
        setLog((current) => ({
          ...current,
          ems: { ...current.ems, startedAt: null, doneSec: 0 },
        })),
      resetAll: () => setLog({ ...EMPTY_LOG, ems: { ...EMPTY_LOG.ems } }),
      goalMl: HYDRATION.goalMl,
    };
  }, [log, now, running, stopEms]);

  return <WellnessContext.Provider value={value}>{children}</WellnessContext.Provider>;
}

export function useWellness() {
  const ctx = useContext(WellnessContext);
  if (!ctx) throw new Error("useWellness must be used inside <WellnessProvider>");
  return ctx;
}
