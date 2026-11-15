import { NextResponse } from "next/server";
import { runSecureSync } from "@/lib/mission/auth-core";

/**
 * POST /api/auth/sync
 * Simulated secure telemetry verification for the 3-step onboarding console.
 * Body: { agencyLink, agencyChannel, astronautName, astronautId, passcode }
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "BAD_JSON", message: "Request body must be JSON." } },
      { status: 400 }
    );
  }

  const { status, body: payload } = await runSecureSync(body);
  return NextResponse.json(payload, {
    status,
    headers: {
      "cache-control": "no-store",
      "x-astroguard-protocol": "ASTROGUARD-TL/1.2",
    },
  });
}

/** GET /api/auth/sync — liveness probe for the access console. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "astroguard-auth",
    protocol: "ASTROGUARD-TL/1.2",
    vault: "online",
    time: new Date().toISOString(),
  });
}
