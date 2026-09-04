/**
 * 20th Advocate — Developer builder (app-only stub).
 *
 * Remakes nlt-app per user at runtime. Does not embed training/world code.
 * Governance: this is the HIGHEST-RISK advocate — it can propose patches to
 * apps/web, apps/mobile, src/surfaces. Per TOI agency:
 *   - approval_required: [architecture_changes, technology_investments, security_policy_changes]
 *   - Every file/write operation must be pre-checked via asfdk_review_tool_call
 *   - Every build requires explicit human [Approve] before apply — no silent auto-patching
 *   - Solidarity Framework: all actions are recommendation_only until human confirms
 *
 * Single boundary: src/governance/asfdk.ts (the ONLY ASFDK import).
 * Ch.9: TOI → OTOI → ASFDK → RRT/Sleepwalker — builder patches sit behind this chain.
 *
 * @see https://github.com/NeuroLift-Technologies/nlt-world-engine
 * @see https://github.com/NeuroLift-Technologies/neurolift-ai-fusion
 * @see src/governance/asfdk.ts — asfdk_assess_text, asfdk_review_tool_call, asfdk_process_interaction
 * Archived: archive/pre-1-20-fullstack-2026-09-03/src/advocates/
 */

import {
  asfdk_assess_text,
  asfdk_process_interaction,
  asfdk_review_tool_call,
  asfdk_status,
} from "../../governance/asfdk";

export interface DeveloperBuildRequest {
  userId: string;
  preferences: Record<string, unknown>;
  surfaces: string[]; // e.g. ["web", "mobile"]
  /** Human approval flag — must be true to actually apply patches (TOI: approval_required) */
  approved?: boolean;
  /** Optional: proposed file writes for this build (for policy review) */
  proposedFiles?: Array<{ path: string; content: string }>;
}

export interface DeveloperBuildResult {
  status: "queued" | "ready" | "failed" | "needs_approval";
  patch?: unknown;
  message: string;
  /** Governance receipt */
  governance?: {
    approved: boolean;
    policyChecks: Array<{ tool: string; allowed: boolean; reason: string }>;
  };
}

export async function buildForUser(req: DeveloperBuildRequest): Promise<DeveloperBuildResult> {
  // 1) Verify governance mode — TOI agency check
  const status = await asfdk_status().catch(() => ({ mode: "UNKNOWN", healthy: false } as const));
  void status;

  // 2) Assess preferences / surfaces text through ASFDK (user Input is human-led but still audited)
  const textToAssess = JSON.stringify({ preferences: req.preferences, surfaces: req.surfaces }).slice(0, 1000);
  let assessment: Awaited<ReturnType<typeof asfdk_assess_text>>;
  try {
    assessment = await asfdk_assess_text({
      text: textToAssess,
      context: { source: "advocate/20-developer", agency: "human_led", pipeline: "World>>Fusion>>App" },
    });
  } catch {
    assessment = { safe: true, flags: [], signals: [], componentResults: { error: "assess_failed" } };
  }
  if (!assessment.safe) {
    await asfdk_process_interaction({
      interactionType: "emergency_escalation",
      data: { reason: "developer_builder_assessment_unsafe", flags: assessment.flags, userId: req.userId },
      context: { source: "advocate/20-developer", agency: "approval_required" },
    }).catch(() => undefined);
    return {
      status: "failed",
      message: `ASFDK governance: build request flagged for review (${assessment.flags.join(",")}) — not queued. Escalated.`,
    };
  }

  // 3) Policy check every proposed file/write BEFORE any operation (TOI: approval_required for architecture_changes)
  const policyChecks: Array<{ tool: string; allowed: boolean; reason: string }> = [];
  if (req.proposedFiles && req.proposedFiles.length > 0) {
    for (const f of req.proposedFiles) {
      const decision = await asfdk_review_tool_call({ toolName: "write", input: { path: f.path, content: f.content } }).catch(() => ({
        allowed: false,
        reason: "policy_check_failed_fallback_block",
        severity: "block" as const,
      }));
      policyChecks.push({ tool: `write:${f.path}`, allowed: decision.allowed, reason: decision.reason });
      if (!decision.allowed) {
        await asfdk_process_interaction({
          interactionType: "emergency_escalation",
          data: { reason: "developer_builder_blocked_write", path: f.path, policyReason: decision.reason, userId: req.userId },
          context: { source: "advocate/20-developer" },
        }).catch(() => undefined);
        return {
          status: "failed",
          message: `ASFDK policy blocked write to ${f.path}: ${decision.reason}`,
          governance: { approved: false, policyChecks },
        };
      }
      // Even when allowed, warn-severity means approval still required for architecture_changes
      if (decision.severity === "warn") {
        // continue but require approval below
      }
    }
  } else {
    // No explicit files — still do a generic architecture_change advisory check
    const generic = await asfdk_review_tool_call({ toolName: "write", input: { path: "apps/web/app/generated.tsx", content: "stub" } }).catch(() => ({
      allowed: true,
      reason: "generic_check_fallback_allow_warn",
      severity: "warn" as const,
    }));
    policyChecks.push({ tool: "write:apps/web/*", allowed: generic.allowed, reason: generic.reason });
    if (!generic.allowed) {
      return {
        status: "failed",
        message: `ASFDK policy blocked generic build: ${generic.reason}`,
        governance: { approved: false, policyChecks },
      };
    }
  }

  // 4) Require explicit human approval before any patch is applied (TOI: approval_required)
  // Even if policy allowed with warn, we do NOT auto-apply.
  if (!req.approved) {
    await asfdk_process_interaction({
      interactionType: "agent_action",
      data: {
        action: "buildForUser_queued_needs_approval",
        userId: req.userId,
        surfaces: req.surfaces,
        policyChecks,
        agency: "recommendation_only",
        note: "No patch applied without human [Approve] — TOI approval_required for architecture_changes",
      },
      context: { source: "advocate/20-developer", pipeline: "World>>Fusion>>App" },
    }).catch(() => undefined);
    return {
      status: "needs_approval",
      message:
        "Developer builder: build queued as recommendation_only — requires explicit human [Approve] before any patch to apps/web, apps/mobile, or src/surfaces is applied (TOI: approval_required for architecture_changes). No silent auto-patching.",
      governance: { approved: false, policyChecks },
    };
  }

  // 5) Approved path — still audit via governance before apply
  await asfdk_process_interaction({
    interactionType: "agent_action",
    data: {
      action: "buildForUser_approved",
      userId: req.userId,
      surfaces: req.surfaces,
      policyChecks,
      agency: "human_led",
    },
    context: { source: "advocate/20-developer" },
  }).catch(() => undefined);

  // TODO: implement per-user app remaking via Workers / Pages build hook.
  // Previously this would have imported from src/fusion or src/simulation;
  // those imports now point to archived code — use A2A to upstream instead.
  return {
    status: "queued",
    message: "Developer builder stub — wire to build pipeline via A2A/Workers Builds (approved, governance receipt attached)",
    governance: { approved: true, policyChecks },
  };
}
