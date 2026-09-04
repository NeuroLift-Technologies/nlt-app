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
 * Governance (Ch.9: TOI → OTOI → ASFDK → RRT/Sleepwalker):
 * - TOI agency: human_led, recommendation_only — micro-step is a proposal, not an auto-action.
 *   User must confirm [Done] / [Stuck] before next step. No silent chaining.
 * - Solidarity Framework: intent is assessed via ASFDK before any micro-step is returned;
 *   agent_action is routed via asfdk_process_interaction for audit trail.
 * - Single boundary: src/governance/asfdk.ts (no direct harness imports).
 *
 * @see https://github.com/NeuroLift-Technologies/neurolift-ai-fusion — trait catalog: TaskKickstart avatar/aide → Advocate 07
 * @see src/orchestrator/classifier.ts — reclassifies stuck reason into 5 advocates
 * @see src/governance/asfdk.ts — asfdk_assess_text, asfdk_process_interaction
 * Archived: archive/pre-1-20-fullstack-2026-09-03/src/advocates/base_advocate.py (BaseAdvocate)
 *
 * TODO[A2A]: Wire to neurolift-ai-fusion Advocate 07 inference via A2A.
 * TODO[Surface]: Rendered by src/surfaces/StartView.tsx — shows ONE step + [Done]/[Stuck].
 */

import {
  asfdk_assess_text,
  asfdk_assess_text_sync,
  asfdk_process_interaction,
  asfdk_process_interaction_sync,
} from "../../governance/asfdk";

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
    // Governance: reclassify reason is user text → assess synchronously (pure helper)
    try {
      const a = asfdk_assess_text_sync({ text: reason, context: { source: "reclassify", advocate: "07-taskKickstart" } });
      if (!a.safe) {
        return createMicroStep(`Safe fallback: pause + breathe — flagged for review (${a.flags.join(",")})`);
      }
    } catch {
      // gov failed — fall through to heuristic
    }
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

// ---------------------------------------------------------------------------
// Heuristic micro-step templates — no LLM, concrete 2-min actions
// Maps intent keywords to tiny physical first moves (ADHD: friction → start)
// ---------------------------------------------------------------------------

export function generateMicroSteps(intent: string): string[] {
  const raw = (intent || "").trim().toLowerCase();
  const clean = (intent || "start").trim().slice(0, 80);
  if (/\bclean|house|tidy|organize|declutter|room\b/.test(raw)) {
    return [
      `Pick up 5 pieces of trash / clutter for "${clean}" (2 min)`,
      `Put dishes in sink / clear one surface for "${clean}" (2 min)`,
      `Take out trash or reset one area — "${clean}" (2 min)`,
      `Wipe one surface clean for "${clean}" (2 min)`,
    ];
  }
  if (/\bemail|message|inbox|reply\b/.test(raw)) {
    return [
      `Open inbox + pick ONE email for "${clean}" (2 min)`,
      `Write ugly first sentence for that email — "${clean}" (2 min)`,
      `Finish that one email draft and send/save (2 min)`,
    ];
  }
  if (/\breport|doc|write|paper|essay|draft|qbr\b/.test(raw)) {
    return [
      `Open doc + write title + one bullet for "${clean}" (2 min)`,
      `Draft one ugly paragraph for "${clean}" — no editing (2 min)`,
      `Add next bullet / paragraph for "${clean}" (2 min)`,
      `Reread + fix one sentence for "${clean}" (2 min)`,
    ];
  }
  if (/\bcode|program|build|feature|bug|commit|pr\b/.test(raw)) {
    return [
      `Open editor + read one function for "${clean}" (2 min)`,
      `Write one small failing test or comment for "${clean}" (2 min)`,
      `Implement smallest change for "${clean}" (2 min)`,
    ];
  }
  if (/\bstudy|learn|read|research|course\b/.test(raw)) {
    return [
      `Open book/page + read one paragraph for "${clean}" (2 min)`,
      `Write one question about "${clean}" (2 min)`,
      `Explain that paragraph in one sentence for "${clean}" (2 min)`,
    ];
  }
  if (/\bexercise|workout|run|walk|gym\b/.test(raw)) {
    return [
      `Put on shoes + stretch 30 sec for "${clean}" (2 min)`,
      `Do 10 jumping jacks or walk in place for "${clean}" (2 min)`,
      `Start main exercise for "${clean}" — just 2 min`,
    ];
  }
  if (/\bcall|meeting|schedule|plan\b/.test(raw)) {
    return [
      `Open calendar/phone + find contact for "${clean}" (2 min)`,
      `Draft one-line agenda for "${clean}" (2 min)`,
      `Send invite or make call for "${clean}" (2 min)`,
    ];
  }
  // generic fallback — still concrete verb first
  return [
    `Open + do first 2-min touch: "${clean}" — just open the doc/tab and write one ugly sentence`,
    `Continue "${clean}" — next 2-min slice: add one more sentence / action`,
    `Keep going on "${clean}" — one more tiny touch (2 min)`,
  ];
}

function pickMicroStep(intent: string, stepIndex: number = 0): string {
  const steps = generateMicroSteps(intent);
  const idx = Math.max(0, Math.min(stepIndex, steps.length - 1));
  // cycle if beyond length
  return steps[idx % steps.length];
}

/**
 * Get next micro-step for an intent — Activation Bridge (ASFDK-governed).
 *
 * Governance boundary at top (TOI agency: human_led, recommendation_only):
 * 1. Assess intent via asfdk_assess_text — flags crisis/manipulation/governance bypass
 * 2. Route agent_action via asfdk_process_interaction before returning micro-step
 * 3. If !safe → return safe fallback step + escalate, do not proceed with normal step
 *
 * @param intent - raw user intent (e.g. "write QBR report")
 * @param stepIndex - optional sequence index for Done→next step (ADHD: tiny wins chain)
 * @returns MicroStep with reclassify hook (async — governance boundary)
 */
export async function getNextMicroStep(intent: string, stepIndex: number = 0): Promise<MicroStep> {
  const clean = (intent || "start").trim().slice(0, 120) || "start";

  // 1) Assess intent — Solidarity Framework (RRT/Sleepwalker/OTOI)
  let assessment: Awaited<ReturnType<typeof asfdk_assess_text>>;
  try {
    assessment = await asfdk_assess_text({ text: clean, context: { source: "user_message", advocate: "07-taskKickstart", pipeline: "World>>Fusion>>App" } });
  } catch {
    assessment = { safe: true, flags: [], signals: [], componentResults: { error: "assess_failed" } };
  }
  if (!assessment.safe) {
    await asfdk_process_interaction({
      interactionType: "emergency_escalation",
      data: { reason: "taskKickstart_assessment_unsafe", flags: assessment.flags, intent: clean.slice(0, 80) },
      context: { source: "advocate/07-taskKickstart", agency: "human_led" },
    }).catch(() => undefined);
    return {
      next_action: `Safe pause: intent flagged for review (${assessment.flags.join(",")}) — take 2-min breathe, then rephrase your intent`,
      duration_min: 2,
      why: "ASFDK governance: flagged intent not turned into micro-step; escalated for human review.",
      id: `ms_${Math.random().toString(36).slice(2, 8)}`,
      reclassify: makeReclassify(clean),
    };
  }

  // 2) Route agent_action through governance before returning
  await asfdk_process_interaction({
    interactionType: "agent_action",
    data: { action: "getNextMicroStep", intent: clean, stepIndex, duration_min: 2, agency: "recommendation_only" },
    context: { source: "advocate/07-taskKickstart", pipeline: "World>>Fusion>>App" },
  }).catch(() => undefined);

  // 3) Shrink to micro-step via template (heuristic, no LLM) — concrete verb first
  const next_action = pickMicroStep(clean, stepIndex);
  const steps = generateMicroSteps(clean);
  const why = stepIndex === 0
    ? "Activation Bridge: bridges intention→initiation without lecture; tiny win beats perfect plan."
    : `Step ${stepIndex + 1}/${steps.length}: tiny win chain — keeps momentum without overwhelm.`;
  return {
    next_action,
    duration_min: 2,
    why,
    id: `ms_${Math.random().toString(36).slice(2, 8)}`,
    reclassify: makeReclassify(next_action),
  };
}

/**
 * Synchronous fallback — preserves original heuristic with sync governance stub.
 * Used by surfaces/tests that cannot await. Production should prefer async getNextMicroStep().
 */
export function getNextMicroStepSync(intent: string, stepIndex: number = 0): MicroStep {
  const clean = (intent || "start").trim().slice(0, 120) || "start";
  try {
    const a = asfdk_assess_text_sync({ text: clean, context: { source: "user_message", advocate: "07-taskKickstart" } });
    if (!a.safe) {
      return {
        next_action: `Safe pause: flagged (${a.flags.join(",")}) — breathe 2 min`,
        duration_min: 2,
        why: "ASFDK sync governance flagged intent",
        id: `ms_${Math.random().toString(36).slice(2, 8)}`,
        reclassify: makeReclassify(clean),
      };
    }
    asfdk_process_interaction_sync({
      interactionType: "agent_action",
      data: { action: "getNextMicroStepSync", intent: clean, stepIndex },
      context: { source: "advocate/07-taskKickstart" },
    });
  } catch {
    // gov failed — fall through
  }
  const next_action = pickMicroStep(clean, stepIndex);
  const steps = generateMicroSteps(clean);
  const why = stepIndex === 0
    ? "Activation Bridge: bridges intention→initiation without lecture; tiny win beats perfect plan."
    : `Step ${stepIndex + 1}/${steps.length}: tiny win chain — keeps momentum without overwhelm.`;
  return {
    next_action,
    duration_min: 2,
    why,
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
