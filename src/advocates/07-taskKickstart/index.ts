/**
 * 07 — TaskKickstart — Activation Bridge (System 1: START)
 *
 * ADHD trait: Task Initiation / Activation — ranked #1 very high for Joshd.
 * Core cycle bridge: Low interest → can't activate → procrastination → overwhelm.
 * Instead of lectures, give ONE 2-minute micro-step with [Done]/[Stuck] to reclassify.
 *
 * System mapping: System 1 START (TaskKickstart + Planner Pro) — Activation Bridge
 * - Single 2-min micro-step; on Done → next micro-step; on Stuck → reclassify via orchestrator/classifier
 * - Addresses decision fatigue & perfectionism by shrinking first move.
 *
 * @see https://github.com/NeuroLift-Technologies/neurolift-ai-fusion — trait catalog: TaskKickstart avatar/aide → Advocate 07
 * @see src/orchestrator/classifier.ts — reclassifies stuck reason into 5 advocates
 * Archived: archive/pre-1-20-fullstack-2026-09-03/src/advocates/base_advocate.py (BaseAdvocate)
 *
 * TODO[A2A]: Wire to neurolift-ai-fusion Advocate 07 inference via A2A.
 * TODO[Surface]: Rendered by src/surfaces/StartView.tsx — shows ONE step + [Done]/[Stuck].
 */

export interface MicroStep {
  /** Human-readable next action — must be doable in ~2 minutes, concrete verb first */
  next_action: string;
  /** Fixed 2-minute activation bridge (ADHD-friendly) */
  duration_min: 2;
  /** Optional: why this step helps (interest hook / friction reduction) */
  why?: string;
  /**
   * Reclassify on stuck — caller provides reason, we return refined micro-step.
   * In production, this delegates to orchestrator/classifier.classifyStuckState(reason, ctx)
   * and then to the appropriate advocate. Stub loops to smaller step.
   */
  reclassify: (reason: string) => MicroStep;
  /** Stable id for telemetry */
  id: string;
}

function makeReclassify(currentAction: string): (reason: string) => MicroStep {
  return (reason: string) => {
    const r = reason.toLowerCase();
    // Heuristic refinement — keep <2min, shrink further
    if (r.includes("overwhelm") || r.includes("too big")) {
      return createMicroStep(`Open doc + write title only for: ${currentAction.slice(0, 40)}`);
    }
    if (r.includes("bored") || r.includes("uninterest")) {
      return createMicroStep(`2-min curiosity scan: what puzzles you about ${currentAction.slice(0, 40)}?`);
    }
    if (r.includes("time") || r.includes("late")) {
      return createMicroStep(`Set 2-min timer + do first sentence of: ${currentAction.slice(0, 40)}`);
    }
    if (r.includes("perfect") || r.includes("not good")) {
      return createMicroStep(`Draft ugly first 2-min version of: ${currentAction.slice(0, 40)}`);
    }
    return createMicroStep(`Shrink further: open + do 30-sec touch on: ${currentAction.slice(0, 40)}`);
  };
}

function createMicroStep(next_action: string): MicroStep {
  return {
    next_action,
    duration_min: 2,
    id: `ms_${Math.random().toString(36).slice(2, 8)}`,
    reclassify: makeReclassify(next_action),
  };
}

/**
 * Get next micro-step for an intent — Activation Bridge.
 * Keeps step to ~2 minutes, concrete, verb-first, low friction.
 * @param intent - raw user intent (e.g. "write QBR report")
 * @returns MicroStep with reclassify hook
 */
export function getNextMicroStep(intent: string): MicroStep {
  const clean = (intent || "start").trim().slice(0, 120) || "start";
  // Shrink to micro-step: open + first physical action
  const next_action = `Open + do first 2-min touch: ${clean} — just open the doc/tab and write one ugly sentence`;
  return {
    next_action,
    duration_min: 2,
    why: "Activation Bridge: bridges intention→initiation without lecture; tiny win beats perfect plan.",
    id: `ms_${Math.random().toString(36).slice(2, 8)}`,
    reclassify: makeReclassify(next_action),
  };
}

// Minimal BaseAdvocate shape for future fusion wiring — keep stub, no vendored fusion code.
export const advocateMeta = {
  id: "07-taskKickstart" as const,
  role: "Activation Bridge — Task Initiation",
  trait: "Task Initiation/Activation (very high)",
  system: "System 1 START" as const,
  pipeline: "World >> Fusion >> App (1:20)" as const,
  upstream: "https://github.com/NeuroLift-Technologies/neurolift-ai-fusion",
};
