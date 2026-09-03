# src/orchestrator — 1 Orchestrator (app-only stub)

> **App delivery layer only.** Full orchestration training lives in
> [neurolift-ai-fusion](https://github.com/NeuroLift-Technologies/neurolift-ai-fusion)
> and the embodied simulation lives in
> [nlt-world-engine](https://github.com/NeuroLift-Technologies/nlt-world-engine).

This directory is the **personalized 1:20 runtime stub** for nlt-app.
The orchestrator here does NOT re-implement training or world ECS logic.
At runtime it calls upstream services via the A2A/agent interface:

```
nlt-app orchestrator (1) ──A2A──▶ World Engine (simulation tick / world_map / ECS)
                       ──A2A──▶ AI-Fusion (advocate inference / fusion_engine / readiness)
                       ──▶ 20 advocates: 19 domain + 1 Developer builder (src/advocates/20-developer)
```

## Archived

Previous Python/TS simulation code (`src/simulation`, `src/fusion`, `src/core`, etc.)
was moved to `archive/pre-1-20-fullstack-2026-09-03/src/` via `git mv`.

## Integration

Replace TODOs below with real A2A clients when wiring to:

- `nlt-world-engine` — `WorldEngine`, `GridManager`, `Registry` (ECS), `DurableObject` `WorldEngineDO`
- `neurolift-ai-fusion` — `SessionOrchestrator`, `FusionEngine`, `ReadinessAssessor`

No simulation logic should be re-added here; reference and link only.
