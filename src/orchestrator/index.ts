/**
 * nlt-app orchestrator stub — app-only.
 *
 * Full training lives in neurolift-ai-fusion (SessionOrchestrator, FusionEngine).
 * Full world simulation lives in nlt-world-engine (WorldEngineDO, Registry, GridManager).
 * This stub only orchestrates the personalized 1:20 runtime via A2A.
 *
 * @see https://github.com/NeuroLift-Technologies/nlt-world-engine
 * @see https://github.com/NeuroLift-Technologies/neurolift-ai-fusion
 * Archived history: archive/pre-1-20-fullstack-2026-09-03/src/
 */

// TODO: replace with A2A client to nlt-world-engine and neurolift-ai-fusion.
// Previous imports like `import { Registry } from "../simulation/..."` were
// vendored and are now archived. Use remote agent calls instead.
//
// Example (placeholder):
//   import { worldEngineClient } from "./clients/worldEngine";
//   import { fusionClient } from "./clients/fusion";

export interface OrchestratorConfig {
  worldEngineUrl: string; // e.g. https://nlt-world-engine.workers.dev
  fusionUrl: string; // e.g. https://neurolift-ai-fusion.workers.dev
  userId: string;
}

export interface AdvocateHandle {
  id: string;
  role: string; // 1..19 domain, 20 = Developer builder
  endpoint: string;
}

export class AppOrchestrator {
  constructor(private readonly config: OrchestratorConfig) {}

  /** List 20 advocates for this user (19 + Developer builder). */
  async listAdvocates(): Promise<AdvocateHandle[]> {
    // TODO: fetch from AI-Fusion via A2A
    // Archived: src/advocates/base_advocate.py, src/fusion/fusion_engine.py
    throw new Error("AppOrchestrator.listAdvocates: wire to neurolift-ai-fusion via A2A");
  }

  /** Tick world simulation for this user's session. */
  async tickWorld(sessionId: string, intent: unknown): Promise<unknown> {
    // TODO: forward to nlt-world-engine via WebSocket /connect?agentId=
    // Archived: src/simulation/environment/world_engine.py, src/index.ts (WorldEngineDO)
    throw new Error("AppOrchestrator.tickWorld: wire to nlt-world-engine via A2A/WS");
  }
}
