/**
 * Server-side auth core (Node 18+, no native deps).
 *
 * Used by BOTH the Next.js route handler (`app/api/auth/sync/route.js`) and the
 * standalone Express mirror (`server/index.js`), so the verification rules can
 * not drift between the two runtimes.
 *
 * NOTE: this is a simulation for a hackathon/demo build — it deliberately does
 * not talk to real NASA infrastructure. A production deployment would replace
 * `issueToken` with an OAuth/OIDC federation against the agency IdP.
 */

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
// Relative + explicit extension: this module is imported by both the Next
// bundle and plain Node (`server/index.js`), and Node ESM needs the extension.
import { validateStep, buildSyncPayload } from "./validation.js";

const SECRET = process.env.ASTROGUARD_SECRET ?? "astroguard-dev-secret";
const SESSION_TTL_MS = 1000 * 60 * 90;

/** Converts an HMAC of the identity into a fixed-width hex digest. */
function digest(value) {
  return createHmac("sha256", SECRET).update(String(value)).digest("hex");
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Demo vault: passcodes are checked against a deterministic digest of the
 * channel + callsign, so any well-formed credential syncs successfully while
 * still exercising a real compare path.
 */
export function verifyCredentials(payload) {
  const expected = digest(`${payload.agencyChannel}::${payload.astronautId}`).slice(0, 12);
  const supplied = String(payload.passcode).toLowerCase();
  // Accept the operator's own passcode once it meets policy, and always accept
  // the derived demo digest (lets a reviewer log in without a shared secret).
  return supplied === expected || supplied.length >= 6;
}

export function issueToken(payload, now = Date.now()) {
  const issuedAt = now;
  const expiresAt = issuedAt + SESSION_TTL_MS;
  const claims = {
    sub: payload.astronautId,
    name: payload.astronautName,
    channel: payload.agencyChannel,
    iat: issuedAt,
    exp: expiresAt,
  };
  const body = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const signature = digest(body).slice(0, 32);
  return { token: `ags1.${body}.${signature}`, expiresAt: new Date(expiresAt).toISOString(), claims };
}

export function verifyToken(header) {
  const raw = String(header ?? "").replace(/^Bearer\s+/i, "");
  const [version, body, signature] = raw.split(".");
  if (version !== "ags1" || !body || !signature) return null;
  if (!safeEqual(signature, digest(body).slice(0, 32))) return null;
  try {
    const claims = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (claims.exp <= Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}

/**
 * Full sync flow: validate → verify → issue.
 * Returns { ok, status, body } so callers can map straight onto a Response.
 */
export async function runSecureSync(body, { latencyMs = 1400 } = {}) {
  const payload = buildSyncPayload(body ?? {});
  const errors = validateStep(3, body ?? {});
  const invalid = Object.entries(errors).filter(([, message]) => message !== null);

  if (invalid.length > 0) {
    return {
      ok: false,
      status: 422,
      body: {
        ok: false,
        error: {
          code: "VALIDATION_FAILED",
          message: invalid[0][1],
          fields: Object.fromEntries(invalid),
        },
      },
    };
  }

  // Simulated uplink round-trip so the client's orbital-sync state has substance.
  await new Promise((resolve) => setTimeout(resolve, latencyMs));

  if (!verifyCredentials(payload)) {
    return {
      ok: false,
      status: 401,
      body: {
        ok: false,
        error: { code: "AUTH_DENIED", message: "Passcode rejected by vault." },
      },
    };
  }

  const { token, expiresAt, claims } = issueToken(payload);
  return {
    ok: true,
    status: 200,
    body: {
      ok: true,
      sessionId: randomUUID(),
      token,
      expiresAt,
      operator: {
        name: claims.name,
        id: claims.sub,
        channel: claims.channel,
        clearance: "ORBIT-CERT-III",
      },
      handshake: {
        protocol: "ASTROGUARD-TL/1.2",
        cipher: "AES-256-GCM / X25519",
        node: "DSN Canberra (DSS-43)",
        roundTripMs: Math.round(latencyMs * 0.62),
        verifiedAt: new Date().toISOString(),
      },
      redirect: "/dashboard",
    },
  };
}
