/**
 * Credential validation shared by the onboarding form (client) and
 * /api/auth/sync (server). Keeping one implementation means a malformed code can
 * never slip past the UI into a "successful" sync.
 */

import { CREW } from "../../data/mission-profile.js";

const AGENCY_CODE = /^[A-Z]{2,12}(?:[-_][A-Z0-9]{2,12}){1,5}$/i;
const AGENCY_URL = /^https?:\/\/[^\s]{6,}$/i;
const ASTRO_ID = /^[A-Z0-9][A-Z0-9._-]{2,31}$/i;

export const FIELD_LIMITS = {
  agencyMin: 8,
  agencyMax: 96,
  nameMin: 3,
  nameMax: 48,
  passcodeMin: 6,
};

export function validateAgencyLink(value) {
  const input = (value ?? "").trim();
  if (!input) return "Agency link or sync code is required.";
  if (input.length < FIELD_LIMITS.agencyMin)
    return `Sync code is too short — minimum ${FIELD_LIMITS.agencyMin} characters.`;
  if (input.length > FIELD_LIMITS.agencyMax) return "Sync code exceeds uplink buffer.";
  // Accept either a paste of the agency portal URL or a typed channel code.
  if (AGENCY_URL.test(input) || AGENCY_CODE.test(input)) return null;
  return "Format must be a NASA portal URL or a code like NASA-ISS-ORBIT-2026.";
}

export function validateAstronautName(value) {
  const input = (value ?? "").trim();
  if (!input) return "Astronaut name or ID is required.";
  if (input.length < FIELD_LIMITS.nameMin)
    return `Callsign is too short — minimum ${FIELD_LIMITS.nameMin} characters.`;
  if (input.length > FIELD_LIMITS.nameMax) return "Callsign exceeds identity buffer.";
  // "Kholoud Hussein" (display name) and "ASTRO-KH-07" (badge ID) are both valid.
  if (/^[A-Za-z][A-Za-z .'-]{2,47}$/.test(input) || ASTRO_ID.test(input)) return null;
  return "Use a display name or badge ID such as ASTRO-KH-07.";
}

export function validatePasscode(value) {
  const input = value ?? "";
  if (!input) return "Secure passcode is required.";
  if (input.length < FIELD_LIMITS.passcodeMin)
    return `Passcode needs at least ${FIELD_LIMITS.passcodeMin} characters.`;
  if (/\s/.test(input.trim())) return "Passcode cannot contain leading or trailing spaces.";
  return null;
}

/** Returns { field: message|null } — null for a field means it passed. */
export function validateStep(step, values) {
  if (step === 1) return { agencyLink: validateAgencyLink(values.agencyLink) };
  if (step === 2)
    return {
      astronautName: validateAstronautName(values.astronautName),
      passcode: validatePasscode(values.passcode),
    };
  return {
    agencyLink: validateAgencyLink(values.agencyLink),
    astronautName: validateAstronautName(values.astronautName),
    passcode: validatePasscode(values.passcode),
  };
}

export function stepIsComplete(step, values) {
  const errors = validateStep(step, values);
  return Object.values(errors).every((error) => error === null);
}

/**
 * Normalises the raw form into the payload sent to the API, so the server never
 * has to guess how the operator typed their callsign.
 */
export function buildSyncPayload(values) {
  const agencyLink = (values.agencyLink ?? "").trim();
  const astronautName = (values.astronautName ?? "").trim();
  const isUrl = AGENCY_URL.test(agencyLink);
  return {
    agencyLink,
    agencyChannel: isUrl ? new URL(agencyLink).hostname.toUpperCase() : agencyLink.toUpperCase(),
    astronautName,
    astronautId: ASTRO_ID.test(astronautName)
      ? astronautName.toUpperCase()
      : deriveBadgeId(astronautName),
    passcode: values.passcode ?? "",
    surface: values.surface ?? "auto",
    clientTs: Date.now(),
  };
}

/**
 * Badge resolution order:
 * 1. an ID that is already well-formed (ASTRO-KH-07) is passed through;
 * 2. a display name that matches the crew roster takes its issued badge, so the
 *    HUD can bind the operator to their live crew record;
 * 3. anything else mints a deterministic ASTRO-<initials>-<nn>.
 */
export function deriveBadgeId(name) {
  const rostered = CREW.find(
    (member) => member.name.toLowerCase() === name.trim().toLowerCase()
  );
  if (rostered) return rostered.id;

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .join("");
  const seed = [...name]
    .reduce((total, char) => total + char.charCodeAt(0), 0)
    .toString()
    .padStart(4, "0");
  return `ASTRO-${(initials || "XX").slice(0, 3)}-${seed.slice(-2)}`;
}
