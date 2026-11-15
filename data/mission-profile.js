/**
 * Static mission reference data.
 * Kept separate from UI so the same source of truth serves both the Astronaut HUD
 * and NASA Ground Control views.
 */

export const MISSION = {
  designation: "ASTROGUARD-IV",
  program: "Bio-Neural Space Operations",
  vehicle: "Orion-CNV // EVA Platform 07",
  orbit: {
    regime: "LEO",
    altitudeKm: 418.6,
    inclinationDeg: 51.64,
    velocityKms: 7.66,
    periodMin: 92.4,
    groundTrackSeed: 0.38,
  },
  agency: {
    name: "NASA — International Space Station",
    node: "DSN Canberra (DSS-43)",
    uplinkMbps: 300,
    downlinkMbps: 150,
  },
};

/** Crew roster shown in Ground Control; `role` drives HUD default subsystems. */
export const CREW = [
  {
    id: "ASTRO-KH-07",
    name: "Kholoud Hussein",
    role: "EVA Lead",
    status: "nominal",
    suit: "xEMU-07",
    o2: 98.2,
    heart: 74,
    evaHours: 6.4,
  },
  {
    id: "ASTRO-DR-12",
    name: "Diego Ramirez",
    role: "Systems Engineer",
    status: "nominal",
    suit: "xEMU-12",
    o2: 97.1,
    heart: 68,
    evaHours: 4.1,
  },
  {
    id: "ASTRO-AN-03",
    name: "Anya Volkov",
    role: "Flight Surgeon",
    status: "caution",
    suit: "xEMU-03",
    o2: 94.6,
    heart: 91,
    evaHours: 8.7,
  },
  {
    id: "ASTRO-MB-21",
    name: "Marcus Bell",
    role: "Payload Specialist",
    status: "nominal",
    suit: "xEMU-21",
    o2: 99.0,
    heart: 62,
    evaHours: 2.3,
  },
];

/**
 * Suit + vehicle subsystems polled by /api/telemetry.
 * `band` = [min, max] healthy envelope; the telemetry engine jitters inside it.
 */
export const SUBSYSTEMS = [
  { key: "o2", label: "O₂ Reserve", unit: "%", band: [92, 100], weight: 0.4 },
  { key: "co2", label: "CO₂ Scrub", unit: "mmHg", band: [2, 6], weight: 0.55 },
  { key: "pressure", label: "Suit Pressure", unit: "psi", band: [4.1, 4.6], weight: 0.62 },
  { key: "thermal", label: "Thermal Loop", unit: "°C", band: [17, 24], weight: 0.48 },
  { key: "power", label: "EPS Charge", unit: "%", band: [72, 100], weight: 0.78 },
  { key: "heart", label: "Cardiac Rate", unit: "bpm", band: [58, 104], weight: 0.33 },
  { key: "neural", label: "Neural Link", unit: "ms", band: [8, 26], weight: 0.21 },
  { key: "comms", label: "S-Band RSSI", unit: "dBm", band: [-92, -68], weight: 0.66 },
];

/** Biometric channels rendered as the HUD waveform strip. */
export const BIO_CHANNELS = [
  { key: "ecg", label: "ECG Lead II", color: "#7CFF4F" },
  { key: "spo2", label: "SpO₂ Pleth", color: "#00F0FF" },
  { key: "eeg", label: "EEG Band α", color: "#FF3DF2" },
];

/** Ordered log lines emitted while the OS boots after a successful sync. */
export const SYNC_SEQUENCE = [
  "Resolving agency uplink handshake…",
  "Verifying astronaut identity token…",
  "Cross-checking passcode against vault…",
  "Negotiating encrypted telemetry channel…",
  "Calibrating bio-neural interface…",
  "Rendering mission surface…",
];

/** Advisory feed shown on both surfaces, keyed to subsystem status. */
export const ADVISORIES = [
  {
    id: "ADV-1042",
    level: "caution",
    source: "FLIGHT SURGEON",
    text: "ASTRO-AN-03 cardiac rate trending above nominal band — EVA egress recommended within 40 min.",
    utcOffsetMin: -12,
  },
  {
    id: "ADV-1041",
    level: "nominal",
    source: "GNC",
    text: "Reboost window confirmed. Δv budget 1.4 m/s reserved for next apogee pass.",
    utcOffsetMin: -38,
  },
  {
    id: "ADV-1040",
    level: "nominal",
    source: "EPS",
    text: "Array bank B realigned after eclipse; charge rate restored to 96% of baseline.",
    utcOffsetMin: -71,
  },
  {
    id: "ADV-1039",
    level: "critical",
    source: "ECLSS",
    text: "CO₂ scrubbed bed 2 saturation exceeded 80% — swap scheduled with next resupply.",
    utcOffsetMin: -96,
  },
];
