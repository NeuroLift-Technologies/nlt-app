/**
 * 09 — PlannerPro — Top 3 (System 3: TOP3 + System 1 START)
 *
 * ADHD trait: Executive Function / Prioritization + Decision Fatigue + Perfectionism.
 * Joshd ranked #4 Executive/prioritization, #5 Organization; #1 initiation ties into planning paralysis.
 * Provides daily Top 3 (not huge list), defers rest to Later, effort×time check to prevent overcommitment.
 *
 * System mapping:
 * - System 3 TOP3 (Planner Pro + EffortAlign) — daily Top 3, defer to Later, effort×time check
 * - Also serves System 1 START (with TaskKickstart) for Activation Bridge
 * - Addresses decision fatigue (too many choices → freeze) + perfectionism (huge list = never start)
 *
 * Governance (Ch.9: TOI → OTOI → ASFDK → RRT/Sleepwalker):
 * - TOI agency: human_led — user Input is human-led per TOI; PlannerPro is recommendation_only.
 *   getTop3() and effortCheck() propose a triage, they do NOT auto-commit tasks. User confirms Top 3.
 * - Solidarity Framework: every call goes through ASFDK provenance (asfdk_assess_text_sync +
 *   asfdk_process_interaction_sync) before heuristic. Unsafe content → escalate, return safe fallback.
 * - Single boundary: src/governance/asfdk.ts.
 *
 * @see https://github.com/NeuroLift-Technologies/neurolift-ai-fusion — trait catalog: PlannerPro avatar/aide → Advocate 09
 * @see src/governance/asfdk.ts — asfdk_assess_text, asfdk_process_interaction
 * Archived: archive/pre-1-20-fullstack-2026-09-03/src/fusion/ (fusion_engine)
 *
 * TODO[A2A]: Wire to neurolift-ai-fusion Advocate 09 + EffortAlign scoring via A2A.
 */

import {
  asfdk_assess_text_sync,
  asfdk_process_interaction_sync,
} from "../../governance/asfdk";

export interface TaskCandidate {
  id: string;
  title: string;
  /** Effort 1-5 (1=trivial, 5=heavy) */
  effort: number;
  /** Estimated minutes */
  time_min: number;
  /** Interest 1-10 (low interest = StayAlert reframing candidate) */
  interest?: number;
  /** Must-do today? */
  mustDo?: boolean;
}

export interface Top3Result {
  top3: TaskCandidate[];
  later: TaskCandidate[];
  /** Total estimated time for top3 */
  total_time_min: number;
  /** Total effort for top3 */
  total_effort: number;
}

export interface EffortCheck {
  ok: boolean;
  reason: string;
  suggested?: string;
}

function provenanceOk(candidates: TaskCandidate[] | TaskCandidate): boolean {
  try {
    const text = Array.isArray(candidates) ? candidates.map((c) => c.title).join(" | ").slice(0, 500) : candidates.title;
    const a = asfdk_assess_text_sync({ text, context: { source: "advocate/09-plannerPro", agency: "human_led", pipeline: "World>>Fusion>>App" } });
    if (!a.safe) {
      asfdk_process_interaction_sync({
        interactionType: "emergency_escalation",
        data: { reason: "plannerPro_assessment_unsafe", flags: a.flags, signals: a.signals },
        context: { source: "advocate/09-plannerPro" },
      });
      return false;
    }
    asfdk_process_interaction_sync({
      interactionType: "agent_action",
      data: { action: Array.isArray(candidates) ? "getTop3" : "effortCheck", titles: text.slice(0, 200), agency: "recommendation_only" },
      context: { source: "advocate/09-plannerPro", toi_agency: "human_led" },
    });
    return true;
  } catch {
    return true; // gov failure — never block planning, degrade gracefully
  }
}

/**
 * Select Top 3 from candidates — Defer rest to Later.
 * Heuristic: mustDo first, then low effort×time, but preserve one high-interest if possible (for activation).
 * Prevents overcommitment: huge list → Later.
 *
 * Governance: provenance check via ASFDK at top (human_led, recommendation_only).
 * If unsafe → return safe fallback (first 3 as Later park, escalated).
 *
 * @param candidates - all candidate tasks
 */
export function getTop3(candidates: TaskCandidate[]): Top3Result {
  // Governance boundary — human_led: user input is human-led per TOI
  const safe = provenanceOk(candidates);
  if (!safe) {
    // Safe fallback — do not triage normally when flagged
    return {
      top3: candidates.slice(0, 1),
      later: candidates.slice(1),
      total_time_min: candidates.slice(0, 1).reduce((s, t) => s + t.time_min, 0),
      total_effort: candidates.slice(0, 1).reduce((s, t) => s + t.effort, 0),
    };
  }

  const sorted = [...candidates].sort((a, b) => {
    // mustDo first
    if (a.mustDo !== b.mustDo) return a.mustDo ? -1 : 1;
    // then effort×time weighted (small wins first for initiation)
    const scoreA = a.effort * Math.max(1, a.time_min / 30);
    const scoreB = b.effort * Math.max(1, b.time_min / 30);
    return scoreA - scoreB;
  });
  // Keep one high-interest in top3 if it wasn't already (activation-aware)
  const interestHigh = [...candidates].find((c) => (c.interest ?? 5) >= 8);
  let top3 = sorted.slice(0, 3);
  if (interestHigh && !top3.find((t) => t.id === interestHigh.id) && sorted.length > 3) {
    // Swap lowest-priority in top3 with high-interest
    top3 = [interestHigh, ...sorted.filter((c) => c.id !== interestHigh.id).slice(0, 2)];
  }
  const later = candidates.filter((c) => !top3.find((t) => t.id === c.id));
  return {
    top3,
    later,
    total_time_min: top3.reduce((s, t) => s + t.time_min, 0),
    total_effort: top3.reduce((s, t) => s + t.effort, 0),
  };
}

/**
 * Effort×Time check to prevent overcommitment (EffortAlign).
 * Joshd's pattern: high strategic energy when interested → overestimates capacity when planning.
 *
 * Governance: provenance check via ASFDK at top (human_led).
 *
 * @param task - candidate task
 * @param budget - today's budget (default 240 min / effort 8)
 */
export function effortCheck(
  task: TaskCandidate,
  budget: { time_min: number; effort: number } = { time_min: 240, effort: 8 }
): EffortCheck {
  const safe = provenanceOk(task);
  if (!safe) {
    return {
      ok: false,
      reason: `ASFDK governance: task "${task.title.slice(0, 40)}" flagged for review — not checked for effort, escalated.`,
      suggested: `Rephrase task title and retry; flagged content not triaged normally.`,
    };
  }

  if (task.time_min > budget.time_min * 0.7) {
    return {
      ok: false,
      reason: `Time heavy: ${task.time_min}min > 70% of remaining budget (${budget.time_min}min). Split into micro-steps or defer.`,
      suggested: `Split "${task.title.slice(0, 40)}" into 2-min micro-steps (see TaskKickstart).`,
    };
  }
  if (task.effort >= 5 && task.time_min > 90) {
    return {
      ok: false,
      reason: `High effort (${task.effort}/5) × long time (${task.time_min}min) = overcommit risk.`,
      suggested: `Shrink to 30-min slice or pair with StayAlert interest injection.`,
    };
  }
  return { ok: true, reason: "Fits Top 3 budget — not overcommitted." };
}

export const advocateMeta = {
  id: "09-plannerPro" as const,
  role: "Top 3 — Prioritization & EffortAlign",
  trait: "Executive/Prioritization, Decision Fatigue, Perfectionism",
  system: "System 3 TOP3 (+ System 1 START)" as const,
  pipeline: "World >> Fusion >> App (1:20)" as const,
  upstream: "https://github.com/NeuroLift-Technologies/neurolift-ai-fusion",
};
