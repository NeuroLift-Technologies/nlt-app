# src/governance — ASFDK Runtime Governance Boundary (App-Only)

This directory is the **single governance boundary** for ALL MVP AI in `World >> Fusion >> App` 1:20 pipeline.
Every AI (1 orchestrator + 6 advocates) imports from `src/governance/asfdk.ts` — never directly from the harness.

- Contract: `NLT-DEV-OTOI.md` (ORG-DEV-OTOI-1.0.3)
- Pipeline: `World (nlt-world-engine) >> Fusion (neurolift-ai-fusion) >> App (nlt-app, 20th is Developer builder)`
- Ch.9 governance chain: `TOI → OTOI → ASFDK → RRT / Sleepwalker`
- Private ops: https://github.com/NeuroLift-Technologies/.github-private
- Validation: `bash .nltotoi/scripts/validate-governance.sh` (39 checks) — must remain 39/39
- Harness: `/home/joshd/Desktop/nlt-repos/asfdk-harness` (skill `asfdk-harness`)

## ASFDK is Installed in Every AI — MVP v0.1

| # | Component | File | Main Export | ASFDK Boundary |
|---|-----------|------|-------------|----------------|
| 0 | **Orchestrator Classifier** | `src/orchestrator/classifier.ts` | `classifyStuckState(input, ctx)` | `asfdk_assess_text({text, context:{source:"user_message"}})` + `asfdk_status()` at top; routes via `asfdk_process_interaction` before returning `AdvocateId`; if `!safe` → `emergency_escalation`, do not route (safe fallback `07-taskKickstart`) |
| 1 | **07 — TaskKickstart** | `src/advocates/07-taskKickstart/index.ts` | `getNextMicroStep(intent)` | `asfdk_assess_text` on intent + `asfdk_process_interaction(agent_action)` before returning micro-step; `reclassify()` also does sync assess; unsafe → escalate + safe pause step |
| 2 | **04 — Timely** | `src/advocates/04-timely/index.ts` | `getTimeVisibility`, `getLiveRemaining`, `createTransitionBuffer`, `shouldTriggerHyperfocusGuard` | **All** time functions wrapped with `provenanceCheck()` → `asfdk_assess_text_sync` + `asfdk_process_interaction_sync` at top; preserves `human_led` / `recommendation_only` agency |
| 3 | **09 — PlannerPro** | `src/advocates/09-plannerPro/index.ts` | `getTop3(candidates)`, `effortCheck(task)` | Both go through `asfdk_assess_text_sync` + `asfdk_process_interaction_sync`; user Input is **human-led** per TOI agency; triage is `recommendation_only` — user confirms Top 3; unsafe → escalate + safe fallback |
| 4 | **01 — StayAlert** | `src/advocates/01-stayAlert/index.ts` | `injectInterest(task)` | `emotional_integrity` preserved check via `asfdk_assess_text_sync` — must NOT manipulate; reframe is `recommendation_only`; if flagged → fallback neutral prompt + `emergency_escalation` |
| 5 | **05 — MemoryMate** | `src/advocates/05-memoryMate/index.ts` | `captureDump(idea, source)` | `encrypted_storage` handling per TOI privacy (`retention: session-only`) via `asfdk_assess_text_sync` + `asfdk_process_interaction_sync`; at-rest base64 obfuscation stub (production: D1/KV encrypted); unsafe → escalate, store flagged marker only |
| 6 | **20 — Developer** | `src/advocates/20-developer/index.ts` | `buildForUser(req)` | `asfdk_review_tool_call` before **any** file/write operation; `approval_required` for `architecture_changes`; requires explicit `approved:true` / human `[Approve]` — no silent auto-patching; `needs_approval` status + governance receipt |

All components import from `src/governance/asfdk.ts` (the ONLY ASFDK import point). Direct `from "@neurolift-technologies/asfdk"` or `from "asfdk-harness"` in advocates/orchestrator is forbidden.

## TOI Agency & Solidarity Framework

- **TOI agency (human_led):** `task_initiation: user_initiated` — AI never auto-starts tasks.
  `ai_suggestions: recommendation_only / proactive_but_defer` — AI proposes, human disposes.
  `override_authority: user_final` — user can always override; final authority `Joshua W. Dorsey, Sr.`
- **approval_required:** `architecture_changes`, `technology_investments`, `security_policy_changes`,
  `data_retention_changes`, `external_integrations`, `production_deployments` — all require human sign-off.
- **Solidarity Framework & HAIEF:** cooperative, transparent, human-centered; no exploitation.

## Escalation Triggers (OTOI §4.3)

When `asfdk_assess_text` returns `!safe` or `asfdk_review_tool_call` blocks, the component routes to
`asfdk_process_interaction({interactionType: "emergency_escalation", ...})` and **does not continue** normal flow.

Canonical triggers (per TOI/OTOI and `archive/.../cto-agent/agent-config.json`):

- `security_vulnerability` / `security_incident_detected`
- `technical_debt` / `system_performance_degradation`
- `compliance_violation` / `governance_violation`
- `architecture_change_requested` / `major_architecture_changes`
- `external_integration_requested` / `technology_obsolescence_risk`
- `crisis_signal` (RRT — e.g. self-harm language) / `emotional_integrity_risk` / `governance_bypass_attempt`
- `ethical_concern` / `human_agency_violation`

All escalations follow `templates/escalation.md` → `ISSUE_TEMPLATE/agent-escalation.md` → `info@neuroliftsolutions.com`.
See `NLT-DEV-OTOI.md` §§4.3–4.5, `REVIEW.md`, and `asfdk-harness` policy.

## Single Boundary

`src/governance/asfdk.ts` re-exports the harness boundary:

- `asfdk_status` / `asfdk_status_sync`
- `asfdk_assess_text` / `asfdk_assess_text_sync`
- `asfdk_process_interaction` / `asfdk_process_interaction_sync`
- `asfdk_review_tool_call` / `asfdk_review_tool_call_sync`
- `asfdk_health_check`, `asfdk_update_preferences`

If `@neurolift-technologies/asfdk` is installed, the wrapper delegates to the live foundation;
otherwise it degrades to a deterministic stub that preserves Safety (always returns `safe:true`
unless crisis/bypass patterns detected) and never throws. The stub keeps `tsc --noEmit` green
and `validate-governance.sh` at 39/39 while documenting the intended live wiring.

- Dependency: `package.json` → `@neurolift-technologies/asfdk: ^0.2.2` (or local `asfdk-harness` path).
- No `from src.fusion` / `src.simulation` imports — decoupling check (`validate-governance.sh` “DECOUPLED”) must pass.

## Validation

```bash
bash .nltotoi/scripts/validate-governance.sh   # must be 39/39
npx tsc --noEmit
```

Personalization without drift: trait catalog stays canonical in `neurolift-ai-fusion`; app only references via A2A (see `src/orchestrator/classifier.ts`). No simulation code vendored — archived to `archive/pre-1-20-fullstack-2026-09-03/`.
