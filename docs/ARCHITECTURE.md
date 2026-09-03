# nlt-app Architecture — World >> Fusion >> App (app-only)

> **This repo is the app-only delivery layer.** World simulation and AI-Fusion training are **referenced and linked** via A2A/agent interface, not vendored. Full-stack code archived to `archive/pre-1-20-fullstack-2026-09-03/` via `git mv` (reversible).

```
World Engine (nlt-world-engine, UE 5.8) ──>> AI-Fusion (neurolift-ai-fusion, trains 1:20) ──>> nlt-app (this repo, runs 1:20 runtime)
     ECS / world simulation                     avatar-aide-adocate training                  1 orchestrator : 20 advocates
     GridManager, Registry, WorldEngineDO      SessionOrchestrator, FusionEngine,              └─ 20th = small Developer builder
     time/relationship/scenario/NPCs           ReadinessAssessor, 19 domain advocates          remakes app per user
               ──────────────── A2A / agent interface ────────────────▶
```

## Related Repos

- **World Engine**: [NeuroLift-Technologies/nlt-world-engine](https://github.com/NeuroLift-Technologies/nlt-world-engine) — embodied UE 5.8 simulation (upstream; ECS, world_map, durable object, browser prototype)
- **AI-Fusion**: [NeuroLift-Technologies/neurolift-ai-fusion](https://github.com/NeuroLift-Technologies/neurolift-ai-fusion) — trains the 1 orchestrator + 20 advocates (midstream; Python simulation, fusion engine)
- **Governance (private)**: [NeuroLift-Technologies/.github-private](https://github.com/NeuroLift-Technologies/.github-private) — OTOI contracts, SOPs, templates (public mirror: [.github](https://github.com/NeuroLift-Technologies/.github))
- **This repo (nlt-app)**: [NeuroLift-Technologies/nlt-app](https://github.com/NeuroLift-Technologies/nlt-app) — personalized runtime; 20th advocate = small Developer builder

No git submodules — markdown links above are sufficient.

## App-Only Layout (post-2026-09-03)

```
apps/web         → Next.js 15 (kept, pnpm)
apps/mobile      → Expo 56 (kept, npm)
apps/api         → FastAPI minimal gateway stub (kept; full routers archived to archive/pre-1-20-.../apps-api/)
src/orchestrator → 1 orchestrator stub (NEW; calls World Engine + AI-Fusion via A2A — do not re-vendor)
src/advocates/20-developer → Developer builder (NEW; patches apps/web + apps/mobile per user)
src/governance   → passthrough to NLT-DEV-OTOI.md (NEW)
src/surfaces     → registry of surfaces the builder can patch (NEW)
packages/simulation-sdk → shared TS client (kept, now points to upstream A2A)
public/, config/, templates/, docs/ → kept (docs updated to link upstream)
archive/pre-1-20-fullstack-2026-09-03/ → reversible archive (git mv preserved history)
```

## What Was Archived (and where)

Via `git mv` on branch `feat/governance-sync-1-20` (2026-09-03, after 5d39734):

| Archived Path | Canonical Location Now |
|---|---|
| `src/advocates`, `src/aides`, `src/avatars`, `src/fusion`, `src/simulation`, `src/core`, `src/database`, `src/utils`, `src/ecs.ts`, `src/world_map.ts`, `src/index.ts` | `archive/pre-1-20-fullstack-2026-09-03/src/` → now in [nlt-world-engine](https://github.com/NeuroLift-Technologies/nlt-world-engine) / [neurolift-ai-fusion](https://github.com/NeuroLift-Technologies/neurolift-ai-fusion) |
| `backend/` | `archive/.../backend/` → fusion/backend in AI-Fusion |
| `cloudflare-engine/` | `archive/.../cloudflare-engine/` → [nlt-world-engine](https://github.com/NeuroLift-Technologies/nlt-world-engine) |
| `data/` (aide_interactions, avatar_progress, training_logs, world_saves) | `archive/.../data/` → AI-Fusion / World Engine |
| `prototypes/world-engine/` | `archive/.../prototypes/world-engine/` → nlt-world-engine prototype |
| `supabase/migrations/` | `archive/.../supabase/` → AI-Fusion / World Engine DB |
| `services/api/` | `archive/.../services/api/` → AI-Fusion service |
| `apps/api` (full routers) | `archive/.../apps-api/` → replaced by minimal gateway stub in `apps/api/` |

Restore any path with `git log --follow` and `git mv` back — no code was deleted, only moved.

## Runtime Contracts (A2A)

This repo MUST call upstream; it MUST NOT re-implement:

| Capability | Upstream | Call Site |
|---|---|---|
| Tick simulation, spatial queries, world state | nlt-world-engine `WorldEngineDO` / `GridManager` / `Registry` | `src/orchestrator` → WebSocket `GET /connect?agentId=` |
| Avatar/Aide/Advocate training, fusion readiness | neurolift-ai-fusion `SessionOrchestrator` / `FusionEngine` | `src/orchestrator` → `POST /sessions`, `POST /fusion` via A2A |
| Per-user app remaking | nlt-app `src/advocates/20-developer` (this repo) | `src/surfaces` patched via Workers Builds / Pages |

See `src/orchestrator/index.ts` and `src/advocates/20-developer/index.ts` stubs for wiring points (marked `TODO: wire to ... via A2A`).

## Governance

- Contract: `NLT-DEV-OTOI.md` (ORG-DEV-OTOI-1.0.3) — kept intact
- Validation: `bash .nltotoi/scripts/validate-governance.sh` — must pass 38/38 (still does after strip)
- No LLM provider lock-in, no production deploy without approval, PR-only workflow

## Links

- Links reference: `links.md` (updated with pipeline links + .github-private)
- File structure: `file-structure.md` (rewritten to app-only layout)
- Previous full-stack import: `git show 5d39734:README.md` and `archive/pre-1-20-fullstack-2026-09-03/README.md`
