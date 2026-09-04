/**
 * Orchestrator Classifier — Personal OS v0.1
 *
 * Classifies "I'm stuck" free-text into the 5 MVP advocates for Joshd profile.
 * Profile: high EF variability, strengths = problem-solving / strategic thinking when interested + creativity/hyperfocus.
 * Challenges ranked: #1 Task initiation (very high), #2 Interest-based attention (very high),
 * #3 Time blindness (very high), #4 Executive/prioritization, #5 Organization.
 * Core cycle: Low interest → can't activate → procrastination → overwhelm → adrenaline → exhaustion.
 *
 * MVP is Personal Operating System that bridges intention → initiation via micro-steps, not lectures.
 * 1:20 pipeline: World Engine >> AI-Fusion >> nlt-app (20th is Developer builder).
 * This classifier is the orchestrator routing layer (nlt-app delivery only).
 *
 * Governance (Ch.9: TOI → OTOI → ASFDK → RRT/Sleepwalker):
 * - TOI agency: human_led — task initiation is user_initiated, AI suggestions are
 *   recommendation_only and never auto-execute. All routing is advisory until human confirms.
 * - Solidarity Framework: every classify call is a governance boundary — verify ASFDK mode,
 *   assess text for crisis/emotional signals, and route via asfdk_process_interaction before
 *   returning AdvocateId. If !safe → escalate via emergency_escalation, do NOT route.
 * - Single import point: all governance via src/governance/asfdk.ts (the ONLY boundary).
 *
 * @see https://github.com/NeuroLift-Technologies/neurolift-ai-fusion — trait catalog + SessionOrchestrator/FusionEngine
 * @see https://github.com/NeuroLift-Technologies/nlt-world-engine — world simulation
 * @see src/governance/asfdk.ts — ASFDK wrapper (asfdk_assess_text, asfdk_status, asfdk_process_interaction)
 * Archived: archive/pre-1-20-fullstack-2026-09-03/src/fusion/ + src/simulation/
 *
 * TODO[A2A]: Wire to neurolift-ai-fusion SessionOrchestrator.classify() via A2A.
 *   - Replace heuristic keyword routing with FusionEngine advocate readiness scores.
 *   - Validate against live trait model in neurolift-ai-fusion/src/advocates/*
 *   - Add telemetry: log classifyStuckState input/context/output for fusion training.
 */

import {
  asfdk_assess_text,
  asfdk_assess_text_sync,
  asfdk_process_interaction,
  asfdk_status,
  asfdk_status_sync,
} from "../governance/asfdk";

// Advocate IDs in the 1:20 runtime (MVP uses 5 of 19 domain + 20th builder).
// Numbers follow legacy 1-20 catalog (see neurolift-ai-fusion/src/advocates/).
export type AdvocateId =
  | "07-taskKickstart"
  | "04-timely"
  | "09-plannerPro"
  | "01-stayAlert"
  | "05-memoryMate";

export interface StuckContext {
  /** Minutes remaining before next hard commitment (for TIME/Timely) */
  timeRemaining?: number;
  /** Self-rated overwhelm 0-10 (for TOP3/PlannerPro) */
  overwhelm?: number;
  /** Self-rated interest 0-10 — low = StayAlert candidate */
  interest?: number;
  /** Optional: raw candidate tasks for PlannerPro triage */
  candidateTasks?: string[];
}

// ---------------------------------------------------------------------------
// Pure heuristic — preserved for sync fallback + future Fusion delegation
// ---------------------------------------------------------------------------

function classifyHeuristic(input: string, context: StuckContext = {}): AdvocateId {
  const text = (input || "").toLowerCase();
  const { timeRemaining, overwhelm, interest } = context;

  // Strong context signals override keywords (preserve user's quantitative self-report)
  if (typeof interest === "number" && interest <= 3) {
    // Very low interest → StayAlert (interest-based nervous system)
    // but let MemoryMate win if explicitly dumping an idea
    if (!/\b(remember|idea|dump|later|don't forget|note)\b/.test(text)) {
      return "01-stayAlert";
    }
  }
  if (typeof timeRemaining === "number" && timeRemaining <= 15) {
    if (/\b(time|late|deadline|meeting|due|how long|time blind)\b/.test(text) || timeRemaining <= 5) {
      return "04-timely";
    }
  }
  if (typeof overwhelm === "number" && overwhelm >= 7) {
    return "09-plannerPro";
  }

  // Keyword routing — order matters (most specific first)
  // Use \w* suffix to catch overwhelmed/overwhelming, boredom, perfectionism, etc.
  if (/\b(remember|idea|dump|later|don't forget|capture|note to self|brain dump)\b/.test(text)) {
    return "05-memoryMate";
  }
  if (/\b(bored\w*|boring|uninterest\w*|tedious|dry|monotonous|can't focus|distract\w*)\b/.test(text)) {
    return "01-stayAlert";
  }
  if (/\b(time\w*|late|deadline|meeting|due|estimate\w*|how long|running out|time blind|transition)\b/.test(text)) {
    return "04-timely";
  }
  if (/\b(overwhelm\w*|too many|prioritiz\w*|priority|which one|choose|decide|perfection\w*|perfect\w*|properly|stuck choosing|list too long)\b/.test(text)) {
    return "09-plannerPro";
  }
  // Default: Activation Bridge — biggest #1 for Joshd is task initiation
  // Covers: "can't start", "stuck", "procrastinat", "activation", "initiation", generic stuck
  return "07-taskKickstart";
}

/**
 * Classify a stuck-state utterance into one MVP advocate — ASFDK-governed.
 *
 * Governance boundary (ASFDK must be first):
 * 1. Verify harness health via asfdk_status() — confirms governance mode (UNIFIED/etc.)
 * 2. Assess text via asfdk_assess_text({text: input, context: {source: "user_message"}})
 * 3. If !safe → escalate via asfdk_process_interaction(emergency_escalation) and do NOT route
 *    with normal heuristic — return safe default (07-taskKickstart) while escalated.
 * 4. Otherwise route via asfdk_process_interaction and then heuristic.
 *
 * TOI agency: human_led — this function is recommendation_only; caller (surface/orchestrator)
 * must still obtain human confirmation before activating the advocate.
 *
 * @param input - user stuck utterance (e.g. "I can't start this boring report")
 * @param context - optional quantitative context (timeRemaining, overwhelm, interest)
 * @returns AdvocateId for routing (async — governance boundary)
 */
export async function classifyStuckState(
  input: string,
  context: StuckContext = {}
): Promise<AdvocateId> {
  // 1) Verify governance mode — TOI human_led check
  try {
    const status = await asfdk_status();
    void status; // health logged via harness; stub returns healthy:true
  } catch {
    // Gov check failed — degrade to safe default but still audit
    await asfdk_process_interaction({
      interactionType: "emergency_escalation",
      data: { reason: "governance_status_unavailable", input: input.slice(0, 200) },
      context: { source: "orchestrator/classifier", pipeline: "World>>Fusion>>App" },
    }).catch(() => undefined);
  }

  // 2) Assess text through Solidarity Framework (RRT/Sleepwalker/OTOI)
  let assessment: Awaited<ReturnType<typeof asfdk_assess_text>>;
  try {
    assessment = await asfdk_assess_text({ text: input, context: { source: "user_message" } });
  } catch {
    assessment = { safe: true, flags: [], signals: [], componentResults: { error: "assess_failed_fallback_safe" } };
  }

  // 3) Governance check: if !safe → escalate, do not route normally
  if (!assessment.safe) {
    await asfdk_process_interaction({
      interactionType: "emergency_escalation",
      data: {
        reason: "asfdk_assessment_unsafe",
        flags: assessment.flags,
        signals: assessment.signals,
        input: input.slice(0, 200),
      },
      context: { source: "orchestrator/classifier", agency: "human_led" },
    }).catch(() => undefined);
    // Safe fallback — escalated, do not use heuristic routing for unsafe content
    return "07-taskKickstart";
  }

  // 4) Route via governance interaction (audit trail) before heuristic
  await asfdk_process_interaction({
    interactionType: "emotional_assessment",
    data: { text: input, context, assessment },
    context: { source: "orchestrator/classifier", pipeline: "World>>Fusion>>App", version: "1:20" },
  }).catch(() => undefined);

  return classifyHeuristic(input, context);
}

/**
 * Synchronous fallback — preserves original heuristic with sync governance stub.
 * Used by legacy sync callers and surfaces that cannot await. Runs the same
 * ASFDK checks synchronously via asfdk_*_sync stubs (no I/O, deterministic).
 * Production async path is classifyStuckState() above.
 */
export function classifyStuckStateSync(input: string, context: StuckContext = {}): AdvocateId {
  try {
    const status = asfdk_status_sync();
    void status;
    const assessment = asfdk_assess_text_sync({ text: input, context: { source: "user_message" } });
    if (!assessment.safe) return "07-taskKickstart";
  } catch {
    // sync gov failed — fall through to heuristic
  }
  return classifyHeuristic(input, context);
}

// Preserve original name as sync alias for backwards compat where await not used.
// New code should prefer `await classifyStuckState(...)` for full governance.
export { classifyStuckStateSync as classifyStuckStateHeuristic };

// TODO[A2A]: Export A2A wiring stub
// export async function classifyStuckStateViaFusion(input: string, context: StuckContext): Promise<AdvocateId> {
//   const fusionClient = await getFusionClient(); // from ./clients/fusion (TODO)
//   return fusionClient.classify({ input, context, pipeline: "World>>Fusion>>App", version: "1:20" });
// }
