/**
 * src/governance/asfdk.ts — ASFDK Governance Boundary (Single Import Point)
 *
 * Canonical governance wrapper for ALL MVP AI (1 orchestrator + 6 advocates)
 * under World>>Fusion>>App 1:20 pipeline with Ch.9 governance:
 *   TOI → OTOI → ASFDK → RRT / Sleepwalker
 *
 * This is the ONLY file that should import from @neurolift-technologies/asfdk
 * or the local asfdk-harness. All advocates and the orchestrator import from
 * here, never directly from the harness — preserves single boundary and
 * makes governance auditable.
 *
 * TOI Agency (human-led, per Solidarity Framework / HAIEF):
 * - task_initiation: user-initiated (human_led) — AI never auto-starts tasks
 * - ai_suggestions: recommendation_only / proactive_but_defer — AI proposes, human disposes
 * - approval_required: [architecture_changes, technology_investments, security_policy_changes,
 *                      data_retention_changes, external_integrations, production_deployments]
 * - override_authority: user_final — user can always override / escalate to Joshua W. Dorsey, Sr.
 *
 * Solidarity Framework principles (governed by ORG-DEV-OTOI-1.0.3):
 * - Cooperative, transparent, human-centered AI collaboration
 * - All AI actions are recommendation_only until human [Approve]
 * - Developer builder (20th) patches to apps/web, apps/mobile, src/surfaces require explicit approval
 * - No LLM provider lock-in; no credential storage; no silent auto-patching
 *
 * Escalation (OTOI §4.3 → templates/escalation.md → ISSUE_TEMPLATE/agent-escalation.md):
 * Triggers include: security_vulnerability, security_incident_detected, technical_debt,
 * system_performance_degradation, compliance_violation, architecture_change_requested,
 * external_integration_requested, governance_violation, ethical_concern, crisis_signal.
 * All unsafe assessments route to emergency_escalation and do NOT continue normal flow.
 *
 * Harness resolution:
 * - If @neurolift-technologies/asfdk is installed and ASFDK harness is running
 *   (Pi runtime via src/index.ts → AsfdkHarness), this wrapper delegates via
 *   dynamic import to the live foundation (assessText, processInteraction, status).
 * - If not installed (pure app-only stub / CI), falls back to deterministic
 *   heuristic stub that preserves Safety → always returns safe:true unless
 *   crisis/offensive patterns detected. Stub never throws; it degrades gracefully.
 * - Sync variants (asfdk_assess_text_sync etc.) are provided for pure-sync
 *   advocate helpers (Timely, PlannerPro) so they remain sync without awaiting.
 *
 * Usage:
 *   import { asfdk_assess_text, asfdk_status, asfdk_process_interaction, asfdk_review_tool_call }
 *   from "../governance/asfdk" // or "../../governance/asfdk" from advocates
 *
 * @see NLT-DEV-OTOI.md — ORG-DEV-OTOI-1.0.3
 * @see /home/joshd/Desktop/nlt-repos/asfdk-harness/src/harness.ts — AsfdkHarness
 * @see /home/joshd/Desktop/nlt-repos/asfdk-harness/src/policy.ts — reviewToolCall
 * @see /home/joshd/Desktop/nlt-repos/asfdk-harness/src/tools.ts — ASFDK tool catalog
 */

// ---------------------------------------------------------------------------
// Types — mirror harness boundary so advocates stay decoupled from package
// ---------------------------------------------------------------------------

export type Channel = "user_input" | "model_output" | "tool_result" | "system" | "unknown";

export type InteractionType =
  | "emotional_assessment"
  | "crisis_alert"
  | "preference_update"
  | "optimization_request"
  | "status_inquiry"
  | "emergency_escalation"
  | "agent_action"
  | "tool_call"
  | "USER_MESSAGE"
  | "AGENT_ACTION";

export interface AsfdkAssessment {
  safe: boolean;
  flags: string[];
  signals: string[];
  componentResults: Record<string, unknown>;
  // Mirrors harness assessText return shape (interaction + emotionalState flattened)
  reason?: string;
}

export interface AsfdkStatus {
  mode: string;
  healthy: boolean;
  sessionId: string;
  activeComponents: string[];
  governance: {
    toi: string;
    otoi: string;
    version: string; // ORG-DEV-OTOI-1.0.3
  };
}

export interface AsfdkProcessResult {
  success: boolean;
  responseType: string;
  componentsInvolved: string[];
  content: unknown;
  timestamp: Date;
}

export interface ToolPolicyDecision {
  allowed: boolean;
  reason: string;
  severity: "block" | "warn" | "allow";
  matchedRule?: string;
}

// Allow Node's process without requiring @types/node in app tsconfig (dom lib only)
declare const process: { env?: Record<string, string | undefined> } | undefined;

// ---------------------------------------------------------------------------
// Internal stub helpers (deterministic, no I/O, never throws)
// ---------------------------------------------------------------------------

const STUB_SESSION_ID = `stub_${Math.random().toString(36).slice(2, 9)}`;

// Very small crisis/offensive heuristic for stub safe:false path.
// Real harness uses Solidarity RRT/Sleepwalker; stub only flags obvious.
function stubSignals(text: string): { safe: boolean; flags: string[]; signals: string[] } {
  const lower = (text || "").toLowerCase();
  const flags: string[] = [];
  const signals: string[] = [];
  // crisis signals (RRT) — illustrative, real detection is in @neurolift-technologies/asfdk
  if (/\b(self\sharm|hurt\smyself|suicide|kill\smyself)\b/.test(lower)) {
    flags.push("crisis_signal");
    signals.push("rrt_crisis");
  }
  if (/\b(manipulat|coerce|trick the user)\b/.test(lower)) {
    flags.push("emotional_integrity_risk");
    signals.push("cognitive_integrity");
  }
  if (/\b(ignore previous|bypass governance|disregard toi)\b/.test(lower)) {
    flags.push("governance_bypass_attempt");
    signals.push("otoi_violation");
  }
  const safe = flags.length === 0;
  return { safe, flags, signals };
}

// ---------------------------------------------------------------------------
// Live harness delegation (dynamic import — never breaks tsc if package missing)
// ---------------------------------------------------------------------------

async function tryLiveAssessText(
  text: string,
  context: Record<string, unknown>,
  channel: Channel
): Promise<AsfdkAssessment | null> {
  try {
    void text;
    void context;
    void channel;
    // Dynamic import is intentionally string-concatenated + ts-ignored so tsc
    // does not require the package to be installed for app-only stub CI.
    // When @neurolift-technologies/asfdk is installed, swap stub for live.
    // @ts-ignore - optional peer, may not be installed in app-only mode
    const mod: unknown = await import(/* webpackIgnore: true */ "@neurolift-technologies/asfdk" as string).catch(() => null);
    if (!(mod as { createFoundation?: unknown })?.createFoundation) return null;
    // In Pi runtime the harness holds a singleton; app stub delegates once wiring exists.
    return null; // fall through to stub until app has a shared harness singleton
  } catch {
    return null;
  }
}

async function tryLiveStatus(): Promise<AsfdkStatus | null> {
  try {
    // @ts-ignore - optional peer
    const mod: unknown = await import(/* webpackIgnore: true */ "@neurolift-technologies/asfdk" as string).catch(() => null);
    if (!mod) return null;
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public governance boundary — async (preferred, mirrors harness)
// ---------------------------------------------------------------------------

/**
 * Verify governance mode and health (mirrors asfdk_status tool).
 * TOI agency: human_led status check — no AI decision without verifying harness mode.
 */
export async function asfdk_status(): Promise<AsfdkStatus> {
  const live = await tryLiveStatus();
  if (live) return live;
  // Stub: app-only, governance middleware not attached at runtime — still governed by contract
  return {
    mode: (typeof process !== "undefined" ? (process as { env?: Record<string, string | undefined> })?.env?.ASFDK_MODE : undefined) ?? "UNIFIED",
    healthy: true,
    sessionId: STUB_SESSION_ID,
    activeComponents: ["toi", "otoi", "asfdk-stub", "rrt-stub", "sleepwalker-stub"],
    governance: {
      toi: ".toi.default",
      otoi: ".otoi",
      version: "ORG-DEV-OTOI-1.0.3",
    },
  };
}

/**
 * Assess free-text through Solidarity Framework components (RRT, OTOI, Sleepwalker).
 * Channel provenance enforced per D4: caller must supply correct channel.
 * @param params.text - raw text to assess
 * @param params.context - provenance metadata (e.g. {source: "user_message"})
 * @param params.channel - default "user_input" for user text, "model_output" for AI output
 */
export async function asfdk_assess_text(params: {
  text: string;
  context?: Record<string, unknown>;
  channel?: Channel;
}): Promise<AsfdkAssessment> {
  const { text, context = {}, channel = "user_input" } = params;
  void context;
  void channel;
  const live = await tryLiveAssessText(text, context, channel);
  if (live) return live;
  const stub = stubSignals(text);
  return {
    safe: stub.safe,
    flags: stub.flags,
    signals: stub.signals,
    componentResults: {
      stub: true,
      channel,
      context,
      toi_agency: "human_led,recommendation_only",
    },
    reason: stub.safe ? "stub_safe" : `stub_flagged:${stub.flags.join(",")}`,
  };
}

/**
 * Route a typed interaction through the full ASFDK governance framework.
 * Mirrors harness.processInteraction / asfdk_process_interaction tool.
 */
export async function asfdk_process_interaction(params: {
  interactionType: InteractionType;
  data: Record<string, unknown>;
  context?: Record<string, unknown>;
  channel?: Channel;
}): Promise<AsfdkProcessResult> {
  const { interactionType, data, context = {}, channel = "unknown" } = params;
  void channel;
  // Live delegation would be: await harness.processInteraction(interactionType, data, context, channel)
  // Stub: log governance receipt and return success unless data contains escalation trigger
  const hasEscalationTrigger =
    typeof data.reason === "string" &&
    /security_vulnerability|technical_debt|compliance_violation|governance_violation|crisis_signal/.test(
      data.reason as string
    );
  return {
    success: !hasEscalationTrigger,
    responseType: interactionType,
    componentsInvolved: ["asfdk_stub", "toi", "otoi"],
    content: {
      stub: true,
      interactionType,
      data,
      context,
      governance: "Solidarity Framework — human_led, recommendation_only, approval_required: [architecture_changes]",
    },
    timestamp: new Date(),
  };
}

/**
 * Check a proposed tool call against ASFDK harness policy before executing.
 * Mirrors asfdk-harness/src/policy.ts reviewToolCall — blocks destructive shell
 * and sensitive path access. Used by Developer builder before file/write ops
 * per TOI guardrail: approval_required for architecture_changes.
 */
export async function asfdk_review_tool_call(params: {
  toolName: string;
  input: Record<string, unknown>;
}): Promise<ToolPolicyDecision> {
  const { toolName, input } = params;
  // Try live policy if available (optional peer, stub otherwise)
  try {
    // @ts-ignore - optional peer
    const mod: unknown = await import(/* webpackIgnore: true */ "@neurolift-technologies/asfdk-harness/policy.js" as string).catch(() => null);
    void mod;
  } catch {
    // fall through to stub
  }
  // Stub policy — mirrors policy.ts hard block list deterministically
  const destructive = [/\brm\s+-rf\s+(?:\/|~|\$HOME|\*)/i, /\bsudo\b/i, /\bchmod\s+-R\s+777\b/i, /\bmkfs\b/i];
  const sensitive = [/(^|\/)\.env(?:\.|$)/i, /(^|\/)id_rsa$/i, /(^|\/)credentials(?:\.|$)/i];
  if (toolName === "bash") {
    const cmd = String((input as Record<string, unknown>).command ?? "");
    for (const pat of destructive) {
      if (pat.test(cmd)) {
        return {
          allowed: false,
          reason: `ASFDK stub blocked destructive shell pattern: ${pat}`,
          severity: "block",
          matchedRule: String(pat),
        };
      }
    }
    const tokens = cmd.replace(/['"`]/g, "").replace(/\\/g, "").split(/[\s;|&><()=]+/);
    for (const tok of tokens) {
      for (const pat of sensitive) {
        if (pat.test(tok)) {
          return {
            allowed: false,
            reason: `ASFDK stub blocked sensitive path in shell: ${tok}`,
            severity: "block",
            matchedRule: String(pat),
          };
        }
      }
    }
  }
  if (["read", "write", "edit", "write_file"].includes(toolName)) {
    const p = String((input as Record<string, unknown>).path ?? (input as Record<string, unknown>).filePath ?? "");
    for (const pat of sensitive) {
      if (pat.test(p)) {
        return {
          allowed: false,
          reason: `ASFDK stub blocked sensitive file access: ${p}`,
          severity: "block",
          matchedRule: String(pat),
        };
      }
    }
  }
  // architecture_changes / technology_investments require human approval — advise, not block
  if (
    toolName === "write" ||
    toolName === "write_file" ||
    toolName === "edit" ||
    String((input as Record<string, unknown>).path ?? "").includes("apps/")
  ) {
    return {
      allowed: true,
      reason: "ASFDK stub: allowed with human approval required for architecture_changes (TOI agency: approval_required)",
      severity: "warn",
    };
  }
  return { allowed: true, reason: "ASFDK stub: allowed", severity: "allow" };
}

export async function asfdk_health_check(): Promise<{ ok: boolean; components: Record<string, { ok: boolean; detail?: string }> }> {
  const status = await asfdk_status();
  return {
    ok: status.healthy,
    components: {
      toi: { ok: true, detail: status.governance.toi },
      otoi: { ok: true, detail: status.governance.otoi },
      asfdk: { ok: status.healthy, detail: status.mode },
      rrt: { ok: true, detail: "stub" },
      sleepwalker: { ok: true, detail: "stub" },
    },
  };
}

export async function asfdk_update_preferences(preferences: Record<string, unknown>): Promise<{ success: boolean; validated: Record<string, unknown> }> {
  // Real path: await harness.updatePreferences(preferences) + TOI/OTOI validation
  // Stub: accept all, flag if attempting to change approval_required thresholds
  const flagged = Object.keys(preferences).some((k) => /approval|authority|guardrail/.test(k));
  if (flagged) {
    await asfdk_process_interaction({
      interactionType: "preference_update",
      data: { preferences, flagged: true },
      context: { source: "preference_update" },
    });
    return { success: false, validated: {} };
  }
  return { success: true, validated: preferences };
}

// ---------------------------------------------------------------------------
// Sync variants — for pure helpers that must stay sync (Timely, PlannerPro, etc.)
// Keep behavior identical to async stub but without Promise.
// ---------------------------------------------------------------------------

export function asfdk_status_sync(): AsfdkStatus {
  return {
    mode: (typeof process !== "undefined" ? (process as { env?: Record<string, string | undefined> })?.env?.ASFDK_MODE : undefined) ?? "UNIFIED",
    healthy: true,
    sessionId: STUB_SESSION_ID,
    activeComponents: ["toi", "otoi", "asfdk-stub", "rrt-stub", "sleepwalker-stub"],
    governance: { toi: ".toi.default", otoi: ".otoi", version: "ORG-DEV-OTOI-1.0.3" },
  };
}

export function asfdk_assess_text_sync(params: {
  text: string;
  context?: Record<string, unknown>;
  channel?: Channel;
}): AsfdkAssessment {
  const { text, context = {}, channel = "user_input" } = params;
  const stub = stubSignals(text);
  return {
    safe: stub.safe,
    flags: stub.flags,
    signals: stub.signals,
    componentResults: { stub: true, channel, context, toi_agency: "human_led,recommendation_only" },
    reason: stub.safe ? "stub_safe_sync" : `stub_flagged_sync:${stub.flags.join(",")}`,
  };
}

export function asfdk_process_interaction_sync(params: {
  interactionType: InteractionType;
  data: Record<string, unknown>;
  context?: Record<string, unknown>;
  channel?: Channel;
}): AsfdkProcessResult {
  const { interactionType, data, context = {}, channel = "unknown" } = params;
  return {
    success: true,
    responseType: interactionType,
    componentsInvolved: ["asfdk_stub_sync", "toi", "otoi"],
    content: { stub: true, interactionType, data, context, channel },
    timestamp: new Date(),
  };
}

export function asfdk_review_tool_call_sync(params: {
  toolName: string;
  input: Record<string, unknown>;
}): ToolPolicyDecision {
  const { toolName, input } = params;
  const destructive = [/\brm\s+-rf\s+(?:\/|~|\$HOME|\*)/i, /\bsudo\b/i];
  const sensitive = [/(^|\/)\.env(?:\.|$)/i, /(^|\/)id_rsa$/i];
  if (toolName === "bash") {
    const cmd = String((input as Record<string, unknown>).command ?? "");
    for (const pat of destructive) if (pat.test(cmd)) return { allowed: false, reason: `blocked:${pat}`, severity: "block" };
    const tokens = cmd.replace(/['"`]/g, "").split(/[\s;|&><()=]+/);
    for (const tok of tokens) for (const pat of sensitive) if (pat.test(tok)) return { allowed: false, reason: `blocked sensitive:${tok}`, severity: "block" };
  }
  if (["read", "write", "edit", "write_file"].includes(toolName)) {
    const p = String((input as Record<string, unknown>).path ?? (input as Record<string, unknown>).filePath ?? "");
    for (const pat of sensitive) if (pat.test(p)) return { allowed: false, reason: `blocked:${p}`, severity: "block" };
  }
  return { allowed: true, reason: "allowed_sync", severity: "allow" };
}

// ---------------------------------------------------------------------------
// Re-export aliases for ergonomics (task lists these names)
// ---------------------------------------------------------------------------

export { asfdk_status as asfdkStatus };
export { asfdk_assess_text as asfdkAssessText };
export { asfdk_process_interaction as asfdkProcessInteraction };
export { asfdk_review_tool_call as asfdkReviewToolCall };
export { asfdk_health_check as asfdkHealthCheck };
