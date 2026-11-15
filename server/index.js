/**
 * AstroGuard — standalone Node.js / Express API mirror.
 *
 * The Next.js route handlers under `app/api/**` are the primary API and need no
 * extra process. This server exists for deployments that want the backend on its
 * own port/container (or for a judge who asked for an Express structure):
 *
 *   npm run api            → http://localhost:4000
 *   npm run dev:all        → Next web + Express together
 *
 * It reuses `lib/mission/*` so verification rules can never drift from the
 * route handlers. Run with Node 18+ (ESM).
 */
import express from "express";
import { runSecureSync, verifyToken } from "../lib/mission/auth-core.js";
import { buildTelemetrySnapshot } from "../lib/mission/telemetry.js";
import { MISSION } from "../data/mission-profile.js";

const PORT = Number(process.env.ASTROGUARD_API_PORT ?? 4000);
const app = express();

app.use(express.json({ limit: "64kb" }));

// The web app runs on :3000, so the mirrored API needs an explicit CORS policy.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = (process.env.ASTROGUARD_ALLOWED_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((value) => value.trim());
  if (origin && (allowed.includes(origin) || allowed.includes("*"))) {
    res.setHeader("access-control-allow-origin", origin);
    res.setHeader("vary", "origin");
  }
  if (req.method === "OPTIONS") {
    res.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
    res.setHeader("access-control-allow-headers", "content-type,authorization");
    return res.sendStatus(204);
  }
  return next();
});

app.get("/", (_req, res) =>
  res.json({
    ok: true,
    service: "astroguard-api",
    version: "1.0.0",
    mission: MISSION.designation,
    endpoints: ["/api/auth/sync", "/api/telemetry", "/api/health"],
  })
);

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, time: new Date().toISOString(), vault: "online" })
);

app.post("/api/auth/sync", async (req, res) => {
  const { status, body } = await runSecureSync(req.body ?? {});
  res.status(status).set("x-astroguard-protocol", "ASTROGUARD-TL/1.2").json(body);
});

app.get("/api/telemetry", (req, res) => {
  const claims = verifyToken(req.headers.authorization);
  res.json({ ok: true, operator: claims, telemetry: buildTelemetrySnapshot() });
});

// Guard against a stray `next start` port clash with a clear message.
const server = app.listen(PORT, () => {
  console.log(`[astroguard-api] listening on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`[astroguard-api] port ${PORT} is busy — set ASTROGUARD_API_PORT and retry.`);
    process.exit(1);
  }
  throw err;
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
