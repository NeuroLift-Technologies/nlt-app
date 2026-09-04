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
 * @see https://github.com/NeuroLift-Technologies/neurolift-ai-fusion — trait catalog + SessionOrchestrator/FusionEngine
 * @see https://github.com/NeuroLift-Technologies/nlt-world-engine — world simulation
 * Archived: archive/pre-1-20-fullstack-2026-09-03/src/fusion/ + src/simulation/
 *
 * TODO[A2A]: Wire to neurolift-ai-fusion SessionOrchestrator.classify() via A2A.
 *   - Replace heuristic keyword routing with FusionEngine advocate readiness scores.
 *   - Validate against live trait model in neurolift-ai-fusion/src/advocates/*
 *   - Add telemetry: log classifyStuckState input/context/output for fusion training.
 */

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

/**
 * Classify a stuck-state utterance into one MVP advocate.
 *
 * Heuristic stub — intentionally keyword + context weighted.
 * Production: delegate to AI-Fusion via A2A (SessionOrchestrator/FusionEngine).
 *
 * Routing:
 * - MemoryMate (05): externalize working memory — "remember this", "idea", "don't forget"
 * - StayAlert (01): interest injection — "bored", "uninteresting", low interest score
 * - Timely (04): time blindness — "no time", "late", "how long", low timeRemaining
 * - PlannerPro (09): prioritization/overwhelm — "overwhelm", "too many", "choose", high overwhelm
 * - TaskKickstart (07): default activation bridge — "can't start", "stuck", "procrastinating"
 *
 * @param input - user stuck utterance (e.g. "I can't start this boring report")
 * @param context - optional quantitative context (timeRemaining, overwhelm, interest)
 * @returns AdvocateId for routing
 */
export function classifyStuckState(
  input: string,
  context: StuckContext = {}
): AdvocateId {
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
  if (/\b(remember|idea|dump|later|don't forget|capture|note to self|brain dump)\b/.test(text)) {
    return "05-memoryMate";
  }
  if (/\b(bored|boring|uninterest|tedious|dry|monotonous|can't focus|distract)\b/.test(text)) {
    return "01-stayAlert";
  }
  if (/\b(time|late|deadline|meeting|due|estimate|how long|running out|time blind|transition)\b/.test(text)) {
    return "04-timely";
  }
  if (/\b(overwhelm|too many|prioritize|priority|which one|choose|decide|perfection|stuck choosing|list too long)\b/.test(text)) {
    return "09-plannerPro";
  }
  // Default: Activation Bridge — biggest #1 for Joshd is task initiation
  // Covers: "can't start", "stuck", "procrastinat", "activation", "initiation", generic stuck
  return "07-taskKickstart";
}

// TODO[A2A]: Export A2A wiring stub
// export async function classifyStuckStateViaFusion(input: string, context: StuckContext): Promise<AdvocateId> {
//   const fusionClient = await getFusionClient(); // from ./clients/fusion (TODO)
//   return fusionClient.classify({ input, context, pipeline: "World>>Fusion>>App", version: "1:20" });
// }
