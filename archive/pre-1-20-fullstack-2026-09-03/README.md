# Archive — pre-1-20 fullstack (2026-09-03)

This directory is the **reversible archive** of the monolithic full-stack import
that previously vendored World Engine and AI-Fusion code inside `nlt-app`.

Moved via `git mv` on 2026-09-03 from branch `feat/governance-sync-1-20`
(commit 5d39734 → next) to preserve history. Revert with `git log --follow` or
`git mv` back.

## Pipeline after strip

```
World Engine (nlt-world-engine, UE 5.8) ──>> AI-Fusion (neurolift-ai-fusion, trains 1:20) ──>> nlt-app (this repo, runs 1:20 runtime)
```

- **World Engine**: https://github.com/NeuroLift-Technologies/nlt-world-engine — embodied simulation (ECS, world_map, durable object)
- **AI-Fusion**: https://github.com/NeuroLift-Technologies/neurolift-ai-fusion — trains 1 orchestrator + 20 advocates
- **App (this repo)**: `apps/web`, `apps/mobile`, `apps/api` (gateway stub), `src/orchestrator`, `src/advocates/20-developer`, `src/surfaces`, `src/governance` — calls upstream via A2A/agent interface, does not embed their code.

## What was archived

- `src/advocates`, `src/aides`, `src/avatars`, `src/fusion`, `src/simulation`, `src/core`, `src/database`, `src/utils`, `src/ecs.ts`, `src/world_map.ts`, `src/index.ts`, `src/__init__.py`
- `backend/` (FastAPI simulation backend)
- `cloudflare-engine/` (WorldEngineDO Durable Object)
- `data/` (simulation templates)
- `prototypes/world-engine/` (browser prototype)
- `supabase/migrations/` (avatar/aide/supabase schema for simulation)
- `services/api/` (simulation service)
- `apps/api` → `apps-api/` (full simulation routers; replaced in `apps/api/` by minimal gateway stub)

## How to restore (if needed)

```bash
git log --follow -- archive/pre-1-20-fullstack-2026-09-03/src/simulation/session_orchestrator.py
git mv archive/pre-1-20-fullstack-2026-09-03/src/simulation src/simulation
```

Do not re-vendor without explicit approval — prefer links and A2A.
