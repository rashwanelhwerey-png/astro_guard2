# AstroGuard // Bio-Neural Space OS

Mission secure access console and three-surface orbital operations dashboard.
Next.js 15 (App Router) · React 19 · Tailwind CSS · Node.js/Express API mirror.

> All mission data is **simulated**. Nothing in this app talks to real NASA
> infrastructure — the telemetry engine is a deterministic seed-based generator.

## Quick start

```bash
npm install
npm run dev        # web + API routes → http://localhost:3000
```

Open the landing page, complete the three access steps, and the OS boots into
the Astronaut HUD. Use the header segmented control to switch to NASA Ground
Control or the Daily Wellness recovery bay.

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server (includes `/api/*` route handlers) |
| `npm run build` + `npm start` | Production build and serve |
| `npm run api` | Standalone Express API on `:4000` |
| `npm run dev:all` | Next web + Express together |

## Access console flow

1. **Step 1 — Agency Sync Link** · portal URL or channel code (`NASA-ISS-ORBIT-2026`).
2. **Step 2 — Astronaut Identity** · name *or* badge ID (`Kholoud Hussein` / `ASTRO-KH-07`)
   plus a passcode of 6+ characters, side by side.
3. **Step 3 — Launch** · `INITIATE ASTROGUARD OS` posts to `/api/auth/sync`, the
   "Establishing Orbital Telemetry Sync…" overlay runs to 100%, and the session
   redirects to `/dashboard`.

Enter advances a step, Esc steps back, and completed steps stay lit. A live
session offers a **resume** link on the next visit.

Any well-formed credential syncs; a display name that matches the crew roster
resolves to that astronaut's issued badge, so the HUD binds to their live record.

## Architecture

```
app/
  layout.jsx              root shell, metadata, design-token wiring
  page.jsx                mission access console (3-step onboarding)
  globals.css             design system: glass, neon, meters, HUD frames
  dashboard/page.jsx      mission surface (session-gated)
  api/auth/sync/route.js  POST verification · GET liveness
  api/telemetry/route.js  GET live mission snapshot
components/
  landing/                OnboardingCard · StepIndicator · FormField · SyncOverlay
  dashboard/              MissionProvider · AstronautHUD · GroundControl · panels
  wellness/               WellnessProvider · SleepAnalyzer · HydrationTracker ·
                          Nutrition · EmsProtocol · WellnessDashboard
  shared/                 SpaceBackdrop · Starfield · Panel · Waveform · GaugeMeter · MissionClock
lib/mission/
  validation.js           field rules + payload normalisation (client & server)
  auth-core.js            HMAC token issue/verify, shared by both runtimes
  telemetry.js            seed-based simulation: subsystems, orbit, crew, comms
  session.js              localStorage session + mission fetch helper
lib/wellness/
  protocol.js             pure recovery-bay derivation: sleep-quality curve,
                          ration arithmetic, EMS phase machine, protocol tiering
data/mission-profile.js   mission, crew, subsystem envelopes, advisories
server/index.js           Express mirror of the same API
```

**Why the split:** Next route handlers are the primary API and need no extra
process. `server/index.js` exists for deployments that want the backend on its
own port; both import `lib/mission/*`, so validation and token rules cannot drift.

**Deterministic telemetry:** values derive from `Math.floor(Date.now() / 4000)`
rather than `Math.random()`, so every client polling the same window sees
identical numbers — and the server snapshot, the Express snapshot and the
offline fallback all agree.

## Daily Wellness bay

Four state-driven cards — sleep, hydration, nutrition, EMS — sit under a
weighted recovery index. No card computes anything itself: `WellnessProvider`
holds the log (`useState` + `astroguard.wellness.v1` in localStorage) and
derives every readout through `lib/wellness/protocol.js`, which is pure, so the
"AI" advice is reproducible rather than noise.

- **Sleep Analyzer** · 3–10 h slider drives a quality curve peaking inside the
  7.5–8.5 h band; quality selects the EMS protocol tier and the red-light
  prescription, and below 40% interlocks the stimulation session.
- **Zero-G Hydration** · `+250 ml` / `+500 ml` quick actions against the 2.5 l
  goal, with the remaining volume derived so the readout can't disagree with the bar.
- **Bio-Calorie & Nutrition** · intake enters only as ration packs from the
  galley manifest, so kcal, macro and micro-%DV totals always reconcile.
- **Zero-G EMS Protocol** · a live 30 s activation / 15 s perfusion-rest cycle
  rotating channel groups, computed from the single session start timestamp —
  so a reload mid-session resumes the correct block and countdown.

The provider mounts *above* the surface switch in `dashboard/page.jsx` because
`DashboardShell` unmounts the inactive view: a half-logged day must survive a
trip to the HUD and back.

## Design system

- Backdrop: astronaut image fixed at `cover / center`, slow Ken Burns drift,
  under a `rgba(6,11,25,0.75)` deep-space veil, starfield and instrument grid.
- Glass: `blur(18px)` over `rgba(15,23,42,0.65)` with a `#00F0FF` neon border,
  corner brackets (`.hud-frame`) and a CRT scanline sweep.
- Styling lives in named classes in `app/globals.css` (`glass-panel`,
  `field-shell`, `btn-launch`, `meter-fill`, `meter-track--block`,
  `range-neon`, `fx-live`, `telemetry-table`); Tailwind config only carries
  tokens — colours, fonts, keyframes.
- Motion respects `prefers-reduced-motion`.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `ASTROGUARD_SECRET` | `astroguard-dev-secret` | HMAC key for session tokens — **set this in production** |
| `ASTROGUARD_API_PORT` | `4000` | Express mirror port |
| `ASTROGUARD_ALLOWED_ORIGINS` | `http://localhost:3000` | CORS allow-list for the mirror |
| `NEXT_PUBLIC_API_BASE_URL` | *(empty)* | Point the client at the Express API instead of route handlers |

Copy `.env.example` to `.env.local` to override.

## Production notes

The auth layer is a deliberate simulation. Before any real deployment:
replace `issueToken` with an OIDC/OAuth federation against the agency IdP,
move session storage from `localStorage` to an httpOnly cookie, and drop the
`verifyCredentials` length fallback in `lib/mission/auth-core.js`.
