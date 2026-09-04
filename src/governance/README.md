# src/governance — Governance Passthrough (app-only)

This directory holds **no reimplemented governance logic**. All governance
is canonical in `.github-private` / `NLT-DEV-OTOI.md` and validated by
`.nltotoi/scripts/validate-governance.sh`.

App surfaces that need TOI/OTOI checks should call the harness via the
existing governance scripts and templates, not duplicate them here.

- Contract: `NLT-DEV-OTOI.md` (ORG-DEV-OTOI-1.0.3)
- Private ops: https://github.com/NeuroLift-Technologies/.github-private
- Validation: `bash .nltotoi/scripts/validate-governance.sh` (39 checks)

## Personal OS v0.1 — Developer Builder Governance

The **20th advocate (Developer builder)** remakes nlt-app per user at runtime
(`src/advocates/20-developer`). Any builder-proposed patch that changes
`apps/web`, `apps/mobile`, or `src/surfaces` **requires explicit `[Approve]`**
via the **ASFDK** harness before apply — no silent auto-patching.

- Personalization without drift: trait catalog stays canonical in
  `neurolift-ai-fusion`; app only references via A2A (see `src/orchestrator/classifier.ts`).
- No simulation code vendored — archived to `archive/pre-1-20-fullstack-2026-09-03/`.
