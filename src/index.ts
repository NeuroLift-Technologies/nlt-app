/**
 * nlt-app — app-only entry (stub)
 *
 * Full World Engine Durable Object (WorldEngineDO, Registry, GridManager) was
 * moved via `git mv` to archive/pre-1-20-fullstack-2026-09-03/src/index.ts
 * and now lives canonically in:
 *   https://github.com/NeuroLift-Technologies/nlt-world-engine
 *
 * This stub keeps `wrangler.toml`'s `main = "src/index.ts"` resolvable for
 * reference. Do NOT re-implement WorldEngineDO here — call upstream via A2A
 * from `src/orchestrator`.
 *
 * Archived: archive/pre-1-20-fullstack-2026-09-03/src/index.ts
 * @see https://github.com/NeuroLift-Technologies/nlt-world-engine
 * @see https://github.com/NeuroLift-Technologies/neurolift-ai-fusion
 */

// Re-export app orchestrator as the gateway's local interface.
// The actual WorldEngineDO is NOT here.
export { AppOrchestrator, classifyStuckState } from "./orchestrator/index";
export type { AdvocateId, StuckContext } from "./orchestrator/index";

// Personal OS v0.1 — MVP advocates (5 of 1:20) — stubs, wire to A2A (neurolift-ai-fusion)
// TODO: wire to A2A to neurolift-ai-fusion (FusionEngine/Advocate inference) — see src/orchestrator/classifier.ts
export * as TaskKickstart from "./advocates/07-taskKickstart/index";
export * as Timely from "./advocates/04-timely/index";
export * as PlannerPro from "./advocates/09-plannerPro/index";
export * as StayAlert from "./advocates/01-stayAlert/index";
export * as MemoryMate from "./advocates/05-memoryMate/index";
export * from "./advocates/20-developer/index";

// Placeholder for Wrangler compatibility — not a real Worker.
// Deployments of WorldEngineDO should use the nlt-world-engine repo.
export default {
  async fetch(): Promise<Response> {
    return new Response(
      JSON.stringify({
        service: "nlt-app",
        mode: "app-only",
        world_engine: "https://github.com/NeuroLift-Technologies/nlt-world-engine",
        ai_fusion: "https://github.com/NeuroLift-Technologies/neurolift-ai-fusion",
        archived: "archive/pre-1-20-fullstack-2026-09-03/src/index.ts",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  },
};
