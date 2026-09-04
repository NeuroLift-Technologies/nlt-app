# src/surfaces — App Surfaces Registry (app-only + Personal OS v0.1)

Registry of delivery surfaces that the 20th Developer advocate can patch per user:

- `apps/web` — Next.js web app
- `apps/mobile` — Expo mobile app
- `apps/api` — minimal FastAPI gateway (see `apps/api/main.py`)

## MVP v0.1 Surfaces — Personal OS for Joshd (1:20)

4 surfaces in `src/surfaces/` (stubs, Tailwind + React — no external deps beyond `apps/web`):

- `StartView.tsx` — **System 1 START** (TaskKickstart) — ONE 2-min micro-step + `[Done]/[Stuck]` → reclassify via `src/orchestrator/classifier.ts`
- `TimeBar.tsx` — **System 2 TIME** (Timely) — live countdown bar + estimate vs actual + `Hyperfocus Guard / Exit Ramp` (pairs with StayAlert)
- `Top3View.tsx` — **System 3 TOP3** (PlannerPro + EffortAlign) — 3 cards + `[Defer to Later]` + effort×time check
- `DumpBar.tsx` — **MemoryMate** — capture bar "I'll remember later" → externalizes working memory (supports all 3 systems)

Each is scaffold stub with `TODO` wiring to A2A (`neurolift-ai-fusion` + `nlt-world-engine`). Minimal — no model weights.

Surfaces do NOT contain simulation or fusion logic. That code lives in:

- **World Engine**: https://github.com/NeuroLift-Technologies/nlt-world-engine
- **AI-Fusion**: https://github.com/NeuroLift-Technologies/neurolift-ai-fusion

Archived vendored code: `archive/pre-1-20-fullstack-2026-09-03/`

## Governance

Developer builder patches require `[Approve]` via ASFDK — see `src/governance/README.md`.
