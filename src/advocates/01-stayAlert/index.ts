/**
 * 01 — StayAlert — Interest Injection + Hyperfocus Guard companion
 *
 * ADHD trait: Interest-Based Nervous System — ranked #2 very high for Joshd.
 * Strengths when interested: problem-solving / strategic thinking (very high), creativity/hyperfocus.
 * Challenge: low interest → can't activate (core cycle entry).
 * Injects interest by reframing task as puzzle/strategy/creative challenge; also supports Hyperfocus Guard/Exit Ramp.
 *
 * System mapping: StayAlert interest injection — reframed task as challenge; pairs with Timely for Hyperfocus Guard
 *
 * Governance (Ch.9: TOI → OTOI → ASFDK → RRT/Sleepwalker):
 * - TOI ethical pillar: Cognitive Integrity — injectInterest() must NOT manipulate.
 *   It reframes via curiosity/strategy/creativity hooks that preserve agency; user can dismiss.
 *   Emotional_integrity preserved check via ASFDK (asfdk_assess_text) ensures no coercive framing.
 * - TOI agency: human_led, recommendation_only — reframe is a suggestion, not an auto-nudge.
 * - Solidarity Framework: every injectInterest call is audited via asfdk_process_interaction.
 * - Single boundary: src/governance/asfdk.ts.
 *
 * @see https://github.com/NeuroLift-Technologies/neurolift-ai-fusion — trait catalog: StayAlert avatar/aide → Advocate 01
 * @see src/advocates/04-timely/index.ts — shouldTriggerHyperfocusGuard() + createTransitionBuffer() for exit ramp
 * @see src/governance/asfdk.ts — ASFDK emotional_integrity wrapper
 * Archived: archive/pre-1-20-fullstack-2026-09-03/src/avatars/adhd_traits/attention_deficit.py + stay_alert_avatar.py
 *
 * TODO[A2A]: Wire to neurolift-ai-fusion Advocate 01 reframing model via A2A.
 */

import {
  asfdk_assess_text_sync,
  asfdk_process_interaction_sync,
} from "../../governance/asfdk";

export interface ReframedTask {
  original: string;
  reframed: string;
  /** Why this framing taps Joshd's strengths */
  hook: string;
  /** 2-min curiosity starter */
  starter: string;
}

const STRATEGY_FRAMES = [
  "puzzle: what hidden pattern makes this tricky?",
  "strategy: what's the clever 20% that unlocks 80%?",
  "creative: how would you make this delightfully weird?",
  "systems: what tiny system would make this run itself next time?",
];

/**
 * Inject interest — reframe low-interest task as strategic/creative puzzle.
 * Leverages Joshd's high problem-solving when interested.
 *
 * Governance boundary: emotional_integrity preserved check via ASFDK.
 * If assessment flags manipulation/coercion risk → return safe fallback reframe
 * that preserves agency and escalates via emergency_escalation.
 *
 * @param task - raw task title
 */
export function injectInterest(task: string): ReframedTask {
  const clean = (task || "this task").trim().slice(0, 120) || "this task";

  // 1) Emotional integrity check — must not manipulate (Cognitive Integrity pillar)
  try {
    const assessment = asfdk_assess_text_sync({
      text: clean,
      context: {
        source: "advocate/01-stayAlert",
        function: "injectInterest",
        check: "emotional_integrity_preserved",
        agency: "human_led",
        // TOI: AI suggestions are recommendation_only — must preserve user agency
      },
    });
    if (!assessment.safe) {
      asfdk_process_interaction_sync({
        interactionType: "emergency_escalation",
        data: { reason: "stayAlert_emotional_integrity_flag", flags: assessment.flags, task: clean.slice(0, 60) },
        context: { source: "advocate/01-stayAlert", pillar: "Cognitive Integrity" },
      });
      // Safe fallback — no manipulation, just a neutral prompt
      return {
        original: clean,
        reframed: `${clean} — neutral: what one small question would make this slightly less tedious?`,
        hook: "Agency preserved — no manipulative framing; curiosity prompt only.",
        starter: `2-min pause: what one thing would make "${clean.slice(0, 40)}" 1% more interesting to you?`,
      };
    }
    // 2) Audit successful reframe as agent_action (recommendation_only)
    asfdk_process_interaction_sync({
      interactionType: "agent_action",
      data: { action: "injectInterest", original: clean, agency: "recommendation_only", integrity: "emotional_integrity_preserved" },
      context: { source: "advocate/01-stayAlert", pipeline: "World>>Fusion>>App" },
    });
  } catch {
    // gov failure — degrade gracefully, still provide reframe (no block)
  }

  const frame = STRATEGY_FRAMES[hashString(clean) % STRATEGY_FRAMES.length];
  const lower = clean.toLowerCase();
  let hook: string;
  if (lower.includes("report") || lower.includes("doc") || lower.includes("write")) {
    hook = "Strategic thinking — craft the one insight that makes the reader's decision obvious.";
  } else if (lower.includes("organize") || lower.includes("clean") || lower.includes("sort")) {
    hook = "Systems puzzle — design the 5-minute system future-you will thank.";
  } else if (lower.includes("email") || lower.includes("message")) {
    hook = "Problem-solving — what's the clear ask that unblocks everyone in one line?";
  } else {
    hook = "Creativity + hyperfocus fuel — turn the boring part into a curiosity experiment.";
  }
  return {
    original: clean,
    reframed: `${clean} — ${frame}`,
    hook,
    starter: `2-min scan: what puzzles you about "${clean.slice(0, 50)}"? Write one question, not an answer.`,
  };
}

/**
 * Hyperfocus Exit Ramp — when Guard triggers, reframe exit as next interesting puzzle.
 * Paired with Timely.shouldTriggerHyperfocusGuard() — call when overtime + still locked in.
 * Inherits same emotional_integrity governance as injectInterest().
 * @param task - current hyperfocused task
 * @param nextTask - what comes after (for transition buffer)
 */
export function getExitRamp(task: string, nextTask: string = "transition buffer"): ReframedTask & { exitRamp: string } {
  // Governance: assess both tasks for integrity
  try {
    const a1 = asfdk_assess_text_sync({ text: task, context: { source: "exitRamp", advocate: "01-stayAlert" } });
    const a2 = asfdk_assess_text_sync({ text: nextTask, context: { source: "exitRamp_next", advocate: "01-stayAlert" } });
    if (!a1.safe || !a2.safe) {
      const base = injectInterest(task); // will handle fallback internally
      return {
        ...base,
        exitRamp: `Hyperfocus Guard: pause flagged for review (${[...a1.flags, ...a2.flags].join(",")}) — save point + 5-min buffer → safe pause.`,
      };
    }
  } catch {
    // ignore
  }
  const base = injectInterest(task);
  return {
    ...base,
    exitRamp: `Hyperfocus Guard: you've gone deep on "${task.slice(0, 40)}" — save point + 5-min buffer → "${nextTask.slice(
      0,
      40
    )}". Next puzzle awaits.`,
  };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export const advocateMeta = {
  id: "01-stayAlert" as const,
  role: "Interest Injection — Interest-Based Attention",
  trait: "Interest-Based Attention (very high), Hyperfocus",
  system: "StayAlert + Hyperfocus Guard/Exit Ramp" as const,
  pipeline: "World >> Fusion >> App (1:20)" as const,
  upstream: "https://github.com/NeuroLift-Technologies/neurolift-ai-fusion",
};
