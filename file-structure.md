# nlt-app — File Structure (app-only, 2026-09-03)

> **Pipeline:** `World Engine >> AI-Fusion >> nlt-app (1:20)` — This repo is the **app-only delivery layer**. Simulation, fusion, and world code were moved via `git mv` to `archive/pre-1-20-fullstack-2026-09-03/` and now live in upstream repos (referenced via A2A, not vendored). No git submodules — links are sufficient.

## Related Repos — World >> Fusion >> App

- **World Engine**: [NeuroLift-Technologies/nlt-world-engine](https://github.com/NeuroLift-Technologies/nlt-world-engine) — embodied UE 5.8 simulation — ECS, `world_map`, simulation environment, NPCs, `WorldEngineDO` Durable Object
- **AI-Fusion**: [NeuroLift-Technologies/neurolift-ai-fusion](https://github.com/NeuroLift-Technologies/neurolift-ai-fusion) — trains the 1 orchestrator + 20 advocates — `SessionOrchestrator`, `FusionEngine`, `ReadinessAssessor`, avatars/aides/advocates
- **Governance (private)**: [NeuroLift-Technologies/.github-private](https://github.com/NeuroLift-Technologies/.github-private) — canonical OTOI contracts (see public mirror: [.github](https://github.com/NeuroLift-Technologies/.github))

```
World Engine (nlt-world-engine, UE 5.8) ──>> AI-Fusion (neurolift-ai-fusion, trains 1:20) ──>> nlt-app (this repo, runs 1:20 runtime)
     ECS / world simulation                     avatar-aide-adocate training                  1 orchestrator : 20 advocates (20th = Developer builder per user)
                                              Do NOT re-vendor: reference & link via A2A.
```

## Current Minimal App-Only Layout

```
nlt-app/
├── apps/
│   ├── web/                  # Next.js web app — kept (personalized delivery)
│   │   ├── app/              # Next.js app router (page.tsx, layout.tsx, api/insights/route.ts, simulation-lab/, world/)
│   │   ├── components/       # UI + neurolift/* (fusion-simulator, pairs-grid, etc.)
│   │   ├── lib/              # avatar-pairs-data.ts
│   │   ├── src/simulation/   # web-only simulation-lab fixture + world polling types (NOT vendored root src/simulation)
│   │   └── package.json      # workspace: @neurolift/web
│   ├── mobile/               # Expo mobile app — kept
│   │   ├── app/              # expo-router tabs + session screens
│   │   └── src/api/client.ts # mobile API client (calls app gateway / upstream via A2A)
│   └── api/                  # Minimal FastAPI gateway stub — kept (was full simulation API; archived to archive/pre-1-20-.../apps-api/)
│       ├── main.py           # health + gateway (links to upstream)
│       └── requirements.txt
├── src/                      # App-only stubs (NEW, replaces vendored simulation/fusion)
│   ├── orchestrator/         # 1 orchestrator — calls World Engine + AI-Fusion via A2A
│   │   ├── README.md
│   │   ├── index.ts          # AppOrchestrator stub
│   │   └── __init__.py
│   ├── advocates/
│   │   └── 20-developer/     # 20th advocate — small Developer builder that remakes app per user
│   │       ├── README.md
│   │       ├── index.ts
│   │       └── __init__.py
│   ├── governance/           # governance passthrough — see NLT-DEV-OTOI.md
│   │   └── README.md
│   ├── surfaces/             # registry of web/mobile surfaces the builder can patch
│   │   └── README.md
│   └── __init__.py
├── packages/
│   └── simulation-sdk/       # shared TS contracts/client — kept (now points to upstream A2A endpoints)
├── public/                   # static assets — kept
├── config/                   # global TOI configs — kept (simulation configs canonical in upstream repos)
├── templates/                # agent templates — kept
├── docs/
│   ├── ARCHITECTURE.md       # pipeline diagram + upstream links (NEW)
│   ├── architecture.md       # existing architecture overview (kept)
│   ├── active-threads.md     # thread tracking (kept)
│   └── agent-log/            # handoffs/registrations (kept)
├── archive/
│   ├── pre-1-20-fullstack-2026-09-03/  # NEW — reversible archive (git mv preserved history)
│   │   ├── src/              # advocates, aides, avatars, fusion, simulation, core, database, utils, ecs.ts, world_map.ts, index.ts
│   │   ├── backend/          # FastAPI simulation backend (legacy)
│   │   ├── cloudflare-engine/# WorldEngineDO Durable Object (world-specific)
│   │   ├── data/             # simulation templates
│   │   ├── prototypes/       # world-engine browser prototype
│   │   ├── services/api/     # simulation service
│   │   ├── supabase/         # simulation DB migrations
│   │   └── apps-api/         # full simulation routers (avatars, aides, sessions, advocates)
│   └── legacy-content/       # earlier archive — kept
├── wrangler.toml             # root Wrangler — kept but now app-gateway only; WorldEngineDO lives in nlt-world-engine
├── package.json              # workspaces: ["apps/web","apps/mobile"] — kept minimal
├── turbo.json                # tasks: build/dev/lint/type-check — kept
└── NLT-DEV-OTOI.md + AGENTS.md + .nltotoi/ + .claude/  # governance — kept intact (38 checks)
```

## What Lives Elsewhere (Referenced, Not Vendored)

| Concern | Canonical Repo | Key Files |
|---|---|---|
| Simulation ECS, world_map, time/relationships/scenario, NPCs, world_engine | [nlt-world-engine](https://github.com/NeuroLift-Technologies/nlt-world-engine) | `src/simulation/*`, `src/ecs.ts`, `src/world_map.ts`, `src/index.ts` (WorldEngineDO), `cloudflare-engine/*` |
| Avatar/Aide/Advocate training, fusion, readiness, Python simulation SDK | [neurolift-ai-fusion](https://github.com/NeuroLift-Technologies/neurolift-ai-fusion) | `src/advocates/*`, `src/aides/*`, `src/avatars/*`, `src/fusion/*`, `src/core/*`, `src/database/*`, `config/*`, `data/*` |
| Supabase simulation schema | [neurolift-ai-fusion](https://github.com/NeuroLift-Technologies/neurolift-ai-fusion) or [nlt-world-engine](https://github.com/NeuroLift-Technologies/nlt-world-engine) | `supabase/migrations/*` (archived here) |
| Governance contracts, SOPs, templates | [.github-private](https://github.com/NeuroLift-Technologies/.github-private) | `NLT-DEV-OTOI.md`, `SOPs/*`, `templates/*`, `.nltotoi/*` |

To restore any vendored path for inspection:

```bash
git log --follow -- archive/pre-1-20-fullstack-2026-09-03/src/simulation/session_orchestrator.py
git show HEAD:archive/pre-1-20-fullstack-2026-09-03/src/fusion/fusion_engine.py
```

## Architecture Decision: Public vs. Private Governance

| Layer | Repo | Audience | Purpose |
|---|---|---|---|
| **Public governance identity** | `NeuroLift-Technologies/.github` | All agents, public | Solidarity Framework principles, HAIEF attribution, org profile |
| **Private operational governance** | `NeuroLift-Technologies/.github-private` | Internal coding agents only | TOI-OTOI contracts, internal procedures, escalation templates, agent registration |
| **Repo-level stubs** | Each NLT repo (including this one) | That repo's agents | Thin pointers to both repos above + app-specific stubs (`src/governance`) |

## Previous Content (preserved for reference via archive)

<details>
<summary>Prior file-structure notes (pre-2026-09-03) — click to expand</summary>

The previous version of this file documented `.github-private` internal file structure
from `nlt-business-agents`. That content is preserved in git history:

```bash
git show 5d39734:file-structure.md
```

and in `archive/pre-1-20-fullstack-2026-09-03/` for the simulation/fusion split.
Key governance file index remains at `.nltotoi/index/governance-files.md`.

</details>
