/**
 * 05 — MemoryMate — External Dump (Working Memory)
 *
 * ADHD trait: Working Memory / Organization — ranked #5 Organization; supports #1 initiation
 * by externalizing the "don't forget" loop that keeps brain attached to previous thing.
 * Capture bar: "I'll remember later" → frees activation energy.
 *
 * System mapping: MemoryMate external dump — supplements all 3 systems
 * - System 1 START: dump intrusive idea → back to micro-step
 * - System 2 TIME: dump prevents time-blind loop on old task
 * - System 3 TOP3: dump goes to Later, not Top 3
 *
 * @see https://github.com/NeuroLift-Technologies/neurolift-ai-fusion — trait catalog: MemoryMate avatar/aide → Advocate 05
 * Archived: archive/pre-1-20-fullstack-2026-09-03/src/avatars/adhd_traits/ (working memory)
 *
 * TODO[A2A]: Wire to neurolift-ai-fusion Advocate 05 memory store via A2A (persistent D1/KV).
 * TODO[Surface]: Rendered by src/surfaces/DumpBar.tsx — "I'll remember later"
 */

export interface DumpEntry {
  id: string;
  text: string;
  capturedAt: number; // epoch ms
  /** Optional: which system tossed it */
  source?: "START" | "TIME" | "TOP3" | "manual";
  /** Hydrated later by PlannerPro */
  deferredToLater?: boolean;
}

const memory: DumpEntry[] = [];

/**
 * Capture dump — externalize working memory so brain can detach.
 * Instant, no friction: one line → stored → acknowledged "I'll remember later".
 * @param idea - free-text idea / intrusive thought
 * @param source - which system triggered dump
 */
export function captureDump(idea: string, source: DumpEntry["source"] = "manual"): DumpEntry {
  const text = (idea || "").trim().slice(0, 500) || "(empty capture)";
  const entry: DumpEntry = {
    id: `dump_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    text,
    capturedAt: Date.now(),
    source,
    deferredToLater: true,
  };
  memory.push(entry);
  return entry;
}

/** List recent dumps (most recent first, max 20) */
export function listDumps(limit: number = 20): DumpEntry[] {
  return [...memory].reverse().slice(0, limit);
}

/** Clear dumps (e.g. after PlannerPro triage) */
export function clearDumps(): number {
  const n = memory.length;
  memory.length = 0;
  return n;
}

export const advocateMeta = {
  id: "05-memoryMate" as const,
  role: "External Dump — Working Memory",
  trait: "Organization, Working Memory",
  system: "MemoryMate (cross-System)" as const,
  pipeline: "World >> Fusion >> App (1:20)" as const,
  upstream: "https://github.com/NeuroLift-Technologies/neurolift-ai-fusion",
};
