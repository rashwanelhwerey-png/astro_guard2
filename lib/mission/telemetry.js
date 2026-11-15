/**
 * Deterministic telemetry simulation.
 *
 * Everything is derived from a time seed rather than Math.random() so that the
 * server route, the Express mirror and the client all render the *same* mission
 * clock — which matters when a reviewer compares screenshots across surfaces.
 */

import { SUBSYSTEMS, MISSION, CREW } from "../../data/mission-profile.js";

/** Smooth pseudo-wave in [-1, 1] built from summed sines; no RNG involved. */
function wave(seed, harmonics = 3, phase = 0) {
  let sum = 0;
  for (let i = 1; i <= harmonics; i += 1) {
    sum += Math.sin(seed * 0.0013 * i + phase * i) / i;
  }
  return Math.max(-1, 1) * (sum / 1.6);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function missionSeed(now = Date.now()) {
  return Math.floor(now / 4000);
}

/**
 * Read one subsystem at a given seed.
 * `weight` shifts the healthy band so channels do not all breathe in sync.
 */
export function readSubsystem(subsystem, seed) {
  const [min, max] = subsystem.band;
  const span = max - min;
  const osc = wave(seed + subsystem.weight * 9000, 3, subsystem.weight * 7);
  const value = min + span * (0.5 + 0.42 * osc);
  return Number(value.toFixed(subsystem.unit === "dBm" ? 0 : 1));
}

export function statusFor(value, subsystem) {
  const [min, max] = subsystem.band;
  if (value < min || value > max) return "caution";
  // Push the last 6% of the band into "caution" so meters visibly breathe.
  if (value > max - (max - min) * 0.06) return "caution";
  return "nominal";
}

/** Full subsystem snapshot for the current tick. */
export function readSubsystemSnapshot(seed = missionSeed()) {
  return SUBSYSTEMS.map((subsystem) => {
    const value = readSubsystem(subsystem, seed);
    const [min, max] = subsystem.band;
    return {
      key: subsystem.key,
      label: subsystem.label,
      unit: subsystem.unit,
      value,
      status: statusFor(value, subsystem),
      // Normalised 0..1 position inside the band, for meters and sparklines.
      ratio: clamp((value - min) / (max - min), 0, 1),
    };
  });
}

/** Rolling history for a channel, oldest first — used by sparklines/waveforms. */
export function readHistory(key, seed = missionSeed(), points = 48) {
  const subsystem = SUBSYSTEMS.find((item) => item.key === key) ?? SUBSYSTEMS[0];
  return Array.from({ length: points }, (_, index) =>
    readSubsystem(subsystem, seed - (points - index))
  );
}

/**
 * Composes a single ECG-ish trace from the cardiac channel so the waveform
 * reacts to the same numbers the vitals panel shows.
 */
export function readWaveform(key, seed = missionSeed(), samples = 96) {
  const subsystem = SUBSYSTEMS.find((item) => item.key === key) ?? SUBSYSTEMS[5];
  const beatRate = clamp(readSubsystem(subsystem, seed) / 100, 0.4, 1.2);
  return Array.from({ length: samples }, (_, index) => {
    const t = (seed * 4 + index) * 0.35;
    const base = Math.sin(t * 0.5) * 0.16;
    const spike = Math.exp(-(((index % 24) - 12) ** 2) / 3) * 0.85;
    const micro = Math.sin(t * 3.1) * 0.05;
    return Number(((base + spike * beatRate + micro) * 100).toFixed(2) / 100);
  });
}

/** Mission epoch — ASTROGUARD-IV increment, not the Unix epoch. */
const MISSION_EPOCH_MS = Date.parse("2026-09-14T00:00:00Z");
const ORBITS_PER_DAY = 15.6; // 92.4 min period

/** Orbit geometry for the ground-track map. */
export function readOrbit(seed = missionSeed(), now = Date.now()) {
  const phase = ((seed % 1000) / 1000 + MISSION.orbit.groundTrackSeed) % 1;
  const longitude = -180 + phase * 360;
  // Full inclination amplitude so the marker always sits on the drawn trace.
  const latitude = Math.sin(phase * Math.PI * 2) * MISSION.orbit.inclinationDeg;
  return {
    phase,
    longitude: Number(longitude.toFixed(2)),
    latitude: Number(latitude.toFixed(2)),
    altitudeKm: Number((MISSION.orbit.altitudeKm + wave(seed, 2) * 1.8).toFixed(2)),
    velocityKms: Number((MISSION.orbit.velocityKms + wave(seed + 400, 2, 1) * 0.02).toFixed(3)),
    nextEclipseInMin: Number((26 - (phase * 92) % 26).toFixed(1)),
    // Orbits since the mission epoch — advances live but stays plausible.
    orbitsCompleted:
      4210 + Math.max(0, Math.floor(((now - MISSION_EPOCH_MS) / 86400000) * ORBITS_PER_DAY)),
  };
}

/** Crew rows with live vitals, keyed to the same seed as the subsystems. */
export function readCrew(seed = missionSeed()) {
  return CREW.map((member) => {
    const heart = Math.round(clamp(member.heart + wave(seed + member.heart, 2) * 6, 52, 128));
    const o2 = Number(clamp(member.o2 + wave(seed + member.o2 * 10, 2, 2) * 0.9, 88, 100).toFixed(1));
    const status =
      heart > 104 || o2 < 93 ? "caution" : member.status === "caution" ? "caution" : "nominal";
    return { ...member, heart, o2, status };
  });
}

/** Link budget numbers for the comms panel. */
export function readComms(seed = missionSeed()) {
  const rssi = readSubsystem(SUBSYSTEMS[7], seed);
  return {
    node: MISSION.agency.node,
    rssi,
    uplinkMbps: Number((MISSION.agency.uplinkMbps * (0.82 + wave(seed, 2, 3) * 0.08)).toFixed(1)),
    downlinkMbps: Number(
      (MISSION.agency.downlinkMbps * (0.86 + wave(seed + 800, 2, 4) * 0.07)).toFixed(1)
    ),
    packetLoss: Number(Math.max(0, 0.4 + wave(seed + 2200, 3, 5) * 0.35).toFixed(2)),
    latencyMs: Math.round(clamp(readSubsystem(SUBSYSTEMS[6], seed) * 3.4 + 22, 30, 180)),
  };
}

/** One aggregate payload — matches the shape returned by /api/telemetry. */
export function buildTelemetrySnapshot(now = Date.now()) {
  const seed = missionSeed(now);
  return {
    stamp: new Date(now).toISOString(),
    mission: MISSION,
    subsystems: readSubsystemSnapshot(seed),
    orbit: readOrbit(seed, now),
    crew: readCrew(seed),
    comms: readComms(seed),
    // Every channel carries history so no trace column renders empty.
    history: Object.fromEntries(
      SUBSYSTEMS.map((subsystem) => [subsystem.key, readHistory(subsystem.key, seed)])
    ),
    waveforms: {
      ecg: readWaveform("heart", seed),
      spo2: readWaveform("o2", seed, 72),
      eeg: readWaveform("neural", seed, 72),
    },
  };
}
