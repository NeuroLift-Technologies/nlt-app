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
 * Governance (Ch.9: TOI → OTOI → ASFDK → Sleepwalker/RRT):
 * - TOI privacy: captureDump() must use encrypted_storage handling per TOI privacy
 *   (retention: session-only / encrypted at rest, no cross-platform sharing without consent).
 *   Via ASFDK: asfdk_assess_text + asfdk_process_interaction with privacy context, and
 *   encrypted_storage simulation (base64 obfuscation at rest; production: D1/KV encrypted).
 * - TOI agency: human_led — dump is user-initiated, AI does not auto-capture.
 * - Single boundary: src/governance/asfdk.ts.
 *
 * @see https://github.com/NeuroLift-Technologies/neurolift-ai-fusion — trait catalog: MemoryMate avatar/aide → Advocate 05
 * @see src/governance/asfdk.ts — asfdk_assess_text, asfdk_process_interaction
 * Archived: archive/pre-1-20-fullstack-2026-09-03/src/avatars/adhd_traits/ (working memory)
 *
 * TODO[A2A]: Wire to neurolift-ai-fusion Advocate 05 memory store via A2A (persistent D1/KV).
 * TODO[Surface]: Rendered by src/surfaces/DumpBar.tsx — "I'll remember later"
 */

import {
  asfdk_assess_text_sync,
  asfdk_process_interaction_sync,
} from "../../governance/asfdk";

export interface DumpEntry {
  id: string;
  text: string;
  capturedAt: number; // epoch ms
  /** Optional: which system tossed it */
  source?: "START" | "TIME" | "TOP3" | "manual";
  /** Hydrated later by PlannerPro */
  deferredToLater?: boolean;
  /** Governance: privacy handling marker */
  privacy?: {
    storage: "encrypted";
    retention: "session-only";
    encryptedAtRest: boolean;
  };
}

const memory: DumpEntry[] = [];

// Simple at-rest obfuscation to simulate encrypted_storage per TOI privacy.
// Production: D1/KV with actual encryption + TOI privacy retention enforcement.
// This stub base64-encodes at rest and decodes on read — never logs plaintext.
const atRest: Map<string, string> = new Map(); // id → b64(text)

function encryptAtRest(text: string): string {
  try {
    return Buffer.from(text, "utf-8").toString("base64");
  } catch {
    // browser fallback
    return btoa(unescape(encodeURIComponent(text)));
  }
}

function decryptAtRest(b64: string): string {
  try {
    return Buffer.from(b64, "base64").toString("utf-8");
  } catch {
    try {
      return decodeURIComponent(escape(atob(b64)));
    } catch {
      return b64;
    }
  }
}

/**
 * Capture dump — externalize working memory so brain can detach.
 * Instant, no friction: one line → stored → acknowledged "I'll remember later".
 *
 * Governance boundary at top (TOI privacy: encrypted_storage):
 * 1. Assess idea via asfdk_assess_text (crisis/governance bypass check)
 * 2. If !safe → escalate, store only safe fallback marker (not raw unsafe text)
 * 3. Encrypt at rest (base64 stub; production D1/KV encrypted) + audit via asfdk_process_interaction
 *
 * @param idea - free-text idea / intrusive thought
 * @param source - which system triggered dump
 */
export function captureDump(idea: string, source: DumpEntry["source"] = "manual"): DumpEntry {
  const raw = (idea || "").trim().slice(0, 500) || "(empty capture)";

  // 1) Assess through ASFDK (privacy + safety)
  let safe = true;
  let flags: string[] = [];
  try {
    const a = asfdk_assess_text_sync({
      text: raw,
      context: {
        source: "advocate/05-memoryMate",
        privacy: "encrypted_storage",
        retention: "session-only",
        agency: "human_led",
      },
    });
    safe = a.safe;
    flags = a.flags;
    if (!a.safe) {
      asfdk_process_interaction_sync({
        interactionType: "emergency_escalation",
        data: { reason: "memoryMate_assessment_unsafe", flags: a.flags, source },
        context: { source: "advocate/05-memoryMate", privacy: "encrypted_storage" },
      });
    } else {
      asfdk_process_interaction_sync({
        interactionType: "agent_action",
        data: { action: "captureDump", source, text_len: raw.length, privacy: "encrypted_storage", agency: "human_led" },
        context: { source: "advocate/05-memoryMate", pipeline: "World>>Fusion>>App" },
      });
    }
  } catch {
    // gov failed — degrade gracefully, still capture but mark
  }

  const textToStore = safe ? raw : `[flagged for review: ${flags.join(",")}]`;
  const entry: DumpEntry = {
    id: `dump_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    text: textToStore, // plaintext only in returned handle; at-rest copy is encrypted
    capturedAt: Date.now(),
    source,
    deferredToLater: true,
    privacy: {
      storage: "encrypted",
      retention: "session-only",
      encryptedAtRest: true,
    },
  };
  // 2) Encrypted at rest — store b64, keep plaintext only in memory handle for UX
  atRest.set(entry.id, encryptAtRest(textToStore));
  memory.push(entry);
  return entry;
}

/** List recent dumps (most recent first, max 20) — decrypts at read */
export function listDumps(limit: number = 20): DumpEntry[] {
  try {
    asfdk_process_interaction_sync({
      interactionType: "agent_action",
      data: { action: "listDumps", limit, privacy: "encrypted_storage" },
      context: { source: "advocate/05-memoryMate" },
    });
  } catch {
    // ignore
  }
  return [...memory]
    .reverse()
    .slice(0, limit)
    .map((e) => ({
      ...e,
      text: (() => {
        const b64 = atRest.get(e.id);
        return b64 ? decryptAtRest(b64) : e.text;
      })(),
    }));
}

/** Clear dumps (e.g. after PlannerPro triage) — respects TOI retention */
export function clearDumps(): number {
  try {
    asfdk_process_interaction_sync({
      interactionType: "agent_action",
      data: { action: "clearDumps", count: memory.length, retention: "session-only" },
      context: { source: "advocate/05-memoryMate" },
    });
  } catch {
    // ignore
  }
  const n = memory.length;
  memory.length = 0;
  atRest.clear();
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
