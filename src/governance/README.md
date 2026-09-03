# src/governance — Governance Passthrough (app-only)

This directory holds **no reimplemented governance logic**. All governance
is canonical in `.github-private` / `NLT-DEV-OTOI.md` and validated by
`.nltotoi/scripts/validate-governance.sh`.

App surfaces that need TOI/OTOI checks should call the harness via the
existing governance scripts and templates, not duplicate them here.

- Contract: `NLT-DEV-OTOI.md` (ORG-DEV-OTOI-1.0.3)
- Private ops: https://github.com/NeuroLift-Technologies/.github-private
- Validation: `bash .nltotoi/scripts/validate-governance.sh` (38 checks)
