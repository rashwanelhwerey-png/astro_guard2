import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/mission/auth-core";
import { buildTelemetrySnapshot } from "@/lib/mission/telemetry";

/**
 * GET /api/telemetry
 * Returns the current mission snapshot. The simulation is seed-based, so every
 * client polling the same 4s window receives identical numbers.
 */
export async function GET(request) {
  const claims = verifyToken(request.headers.get("authorization"));
  const snapshot = buildTelemetrySnapshot();

  return NextResponse.json(
    { ok: true, operator: claims, telemetry: snapshot },
    { headers: { "cache-control": "no-store" } }
  );
}
