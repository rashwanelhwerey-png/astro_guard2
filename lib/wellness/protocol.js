/**
 * AstroGuard — Daily Wellness protocol.
 *
 * Pure derivation layer: no React, no DOM, no randomness. Every number the
 * recovery bay shows comes from the logged values below, so the "AI" advice is
 * reproducible and explainable rather than simulated noise.
 */

export const SLEEP = {
  min: 3,
  max: 10,
  step: 0.5,
  optimalLow: 7.5,
  optimalHigh: 8.5,
  target: 8,
};

export const HYDRATION = {
  goalMl: 2500,
  quickAddMl: [250, 500],
  ceilingMl: 3500,
};

export const NUTRITION = {
  goalKcal: 2600,
  macros: [
    { key: "protein", label: "Protein", unit: "g", goal: 120 },
    { key: "carbs", label: "Carbohydrate", unit: "g", goal: 300 },
    { key: "fat", label: "Fat", unit: "g", goal: 85 },
  ],
  micros: [
    { key: "vitD", label: "Vitamin D", unit: "%DV", goal: 100 },
    { key: "calcium", label: "Calcium", unit: "%DV", goal: 100 },
    { key: "iron", label: "Iron", unit: "%DV", goal: 100 },
    { key: "potassium", label: "Potassium", unit: "%DV", goal: 100 },
  ],
};

/**
 * EMS session shape: 30 s activation blocks separated by 15 s perfusion rests,
 * rotating channel groups so no muscle group is stimulated back-to-back.
 */
export const EMS = {
  sessionMin: 20,
  blockSec: 30,
  restSec: 15,
  channels: ["LOWER", "CORE", "UPPER"],
  maxMilliamps: 120,
};

/** Ration packs are the only way intake enters the log — totals are derived. */
export const RATION_PACKS = [
  {
    id: "eva",
    label: "EVA Ration",
    kcal: 620,
    macros: { carbs: 70, protein: 35, fat: 24 },
    micros: { vitD: 12, calcium: 20, iron: 8, potassium: 14 },
  },
  {
    id: "isolate",
    label: "Protein Isolate",
    kcal: 210,
    macros: { carbs: 5, protein: 30, fat: 2 },
    micros: { iron: 6, calcium: 9 },
  },
  {
    id: "shake",
    label: "Recovery Shake",
    kcal: 180,
    macros: { carbs: 22, protein: 14, fat: 3 },
    micros: { potassium: 22, vitD: 10 },
  },
  {
    id: "micro",
    label: "Micro Capsule",
    kcal: 0,
    macros: {},
    micros: { vitD: 45, calcium: 28, iron: 20, potassium: 12 },
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Sleep quality from hours slept.
 * Peak inside the optimal band, then a steeper penalty for deprivation than for
 * oversleep — long sleeps accelerate microgravity deconditioning but do not
 * impair a protocol the way 4 h of sleep does.
 */
export function sleepQuality(hours) {
  const h = clamp(Number(hours) || SLEEP.min, SLEEP.min, SLEEP.max);
  if (h >= SLEEP.optimalLow && h <= SLEEP.optimalHigh) {
    return Math.round(96 + (1 - Math.abs(h - SLEEP.target) / 0.5) * 4);
  }
  if (h < SLEEP.optimalLow) {
    return Math.round(clamp(100 - (SLEEP.optimalLow - h) ** 1.35 * 11, 22, 95));
  }
  return Math.round(clamp(100 - (h - SLEEP.optimalHigh) ** 1.25 * 9, 40, 95));
}

export function qualityBand(quality) {
  if (quality >= 85) return "nominal";
  if (quality >= 65) return "caution";
  return "critical";
}

/** Sum logged ration packs into the day's intake totals. */
export function sumIntake(packs = []) {
  const totals = { kcal: 0, macros: {}, micros: {} };
  for (const pack of packs) {
    totals.kcal += pack.kcal;
    for (const [key, value] of Object.entries(pack.macros)) {
      totals.macros[key] = (totals.macros[key] ?? 0) + value;
    }
    for (const [key, value] of Object.entries(pack.micros)) {
      totals.micros[key] = (totals.micros[key] ?? 0) + value;
    }
  }
  return totals;
}

/** Current position inside the EMS session, derived purely from elapsed time. */
export function emsPhase(elapsedSec) {
  const cycle = EMS.blockSec + EMS.restSec;
  const within = elapsedSec % cycle;
  const block = Math.floor(elapsedSec / cycle);
  const active = within < EMS.blockSec;
  return {
    key: active ? "activation" : "rest",
    label: active ? "ACTIVATION" : "PERFUSION REST",
    channel: EMS.channels[block % EMS.channels.length],
    block: block + 1,
    secondsToSwitch: active ? EMS.blockSec - within : cycle - within,
  };
}

/**
 * Cross-card advice. Sleep drives the load and the red-light prescription;
 * hydration and fuel add the secondary cautions.
 */
export function buildRecommendations({ quality, hydrationPct, fuelPct }) {
  const emsLocked = quality < 40;

  const intensity = emsLocked
    ? {
        label: "PROTOCOL R · PASSIVE ONLY",
        loadPct: 0,
        note: "Sleep debt beyond the flight-surgeon limit — EMS interlocked.",
      }
    : quality >= 85
      ? {
          label: "PROTOCOL C · FULL LOAD",
          loadPct: 100,
          note: "Restorative sleep confirmed — run the full 20-minute session.",
        }
      : quality >= 70
        ? {
            label: "PROTOCOL B · 70% LOAD",
            loadPct: 70,
            note: "Trim the eccentric phase; keep the last block at 50%.",
          }
        : {
            label: "PROTOCOL A · 45% LOAD",
            loadPct: 45,
            note: "Maintenance load only — protect form over force output.",
          };

  const redLight =
    quality >= 88
      ? { indicated: false, minutes: 0, note: "Circadian stable — hold the 18:00 dim cycle." }
      : quality >= 78
        ? { indicated: true, minutes: 6, note: "6 min 660 nm before the sleep window." }
        : quality >= 62
          ? { indicated: true, minutes: 10, note: "10 min 660 nm plus blue-block after 20:00." }
          : {
              indicated: true,
              minutes: 15,
              note: "15 min 660 nm now and pre-sleep — melatonin suppression suspected.",
            };

  const hydrationNote =
    hydrationPct < 60
      ? "Raise intake before the next block — 250 ml every 20 min."
      : hydrationPct < 90
        ? "Top up to close the daily goal, then hold 100 ml/h."
        : "Goal met — maintain trickle intake through the sleep window.";

  const fuelNote =
    fuelPct < 55
      ? "Protein timing behind — log the Recovery Shake within 45 min of the block."
      : fuelPct < 85
        ? "Close the calorie gap with one EVA Ration."
        : "Fuel target reached — micros are the remaining watch item.";

  return { emsLocked, intensity, redLight, hydrationNote, fuelNote };
}

/** Weighted whole-body readiness score for the recovery strip. */
export function recoveryIndex({ quality, hydrationPct, fuelPct, emsPct }) {
  return Math.round(
    clamp(quality * 0.4 + hydrationPct * 0.25 + fuelPct * 0.2 + emsPct * 0.15, 0, 100)
  );
}

export function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

/**
 * Single derived view-model for the recovery bay.
 * `now` is passed in so the EMS clock can be driven from one place.
 */
export function buildWellnessView(log, now = Date.now()) {
  const quality = sleepQuality(log.sleepHours);
  const band = qualityBand(quality);
  const debt = Number(Math.max(0, SLEEP.target - log.sleepHours).toFixed(1));

  const intakeMl = log.waterMl;
  const hydrationPct = Math.round(clamp((intakeMl / HYDRATION.goalMl) * 100, 0, 100));
  const hydration = {
    intakeMl,
    goalMl: HYDRATION.goalMl,
    pct: hydrationPct,
    remainingMl: Math.max(0, HYDRATION.goalMl - intakeMl),
    overCeiling: intakeMl > HYDRATION.ceilingMl,
  };

  const totals = sumIntake(
    log.packs.map((id) => RATION_PACKS.find((pack) => pack.id === id)).filter(Boolean)
  );
  const fuelPct = Math.round(clamp((totals.kcal / NUTRITION.goalKcal) * 100, 0, 100));
  const macros = NUTRITION.macros.map((item) => ({
    ...item,
    value: totals.macros[item.key] ?? 0,
    pct: Math.round(clamp(((totals.macros[item.key] ?? 0) / item.goal) * 100, 0, 100)),
    ratio: clamp((totals.macros[item.key] ?? 0) / item.goal, 0, 1),
  }));
  const micros = NUTRITION.micros.map((item) => {
    const value = totals.micros[item.key] ?? 0;
    return {
      ...item,
      value,
      pct: Math.round(clamp((value / item.goal) * 100, 0, 100)),
      ratio: clamp(value / item.goal, 0, 1),
    };
  });

  const running = Boolean(log.ems.startedAt);
  const targetSec = log.ems.targetSec || EMS.sessionMin * 60;
  const elapsed = running ? Math.max(0, Math.floor((now - log.ems.startedAt) / 1000)) : 0;
  const emsPct = Math.round(clamp(((log.ems.doneSec + Math.min(elapsed, targetSec)) / targetSec) * 100, 0, 100));

  const rec = buildRecommendations({ quality, hydrationPct, fuelPct });

  return {
    sleep: {
      hours: log.sleepHours,
      quality,
      band,
      debt,
      ratio: clamp(quality / 100, 0, 1),
      optimal: `${SLEEP.optimalLow}–${SLEEP.optimalHigh} h`,
    },
    hydration,
    nutrition: {
      kcal: totals.kcal,
      goalKcal: NUTRITION.goalKcal,
      fuelPct,
      ratio: clamp(totals.kcal / NUTRITION.goalKcal, 0, 1),
      macros,
      micros,
      packsLogged: log.packs.length,
    },
    ems: {
      running,
      elapsed,
      targetSec,
      remaining: Math.max(0, targetSec - elapsed),
      progressPct: Math.round(clamp((elapsed / targetSec) * 100, 0, 100)),
      loadPct: log.ems.loadPct,
      milliamps: Math.round((log.ems.loadPct * EMS.maxMilliamps) / 100),
      doneSec: log.ems.doneSec,
      emsPct,
      phase: running ? emsPhase(elapsed) : { key: "standby", label: "STANDBY", channel: "—", block: 0, secondsToSwitch: 0 },
    },
    rec,
    recoveryIndex: recoveryIndex({ quality, hydrationPct, fuelPct, emsPct }),
  };
}
