# `.claude/` — Claude Code Session Governance

**Synced from:** `NeuroLift-Technologies/.github-private` (canonical) — mirrored to this **public** app repo via PR #1 (governance propagation)
**Governed by:** ORG-DEV-OTOI-1.0.3 | Solidarity Framework | HAIEF
**Authority:** Joshua W. Dorsey, Sr.

---

## Repo-owned overlay

This directory **was** a synced copy of `.github-private/.claude`, but `nlt-app` is a public delivery repo. The `governance-auto-propagate` sync for `.claude/` is paused for this repo during the visibility split (THREAD-027). Local governance patches (settings `1.0.3`, `REVIEW.md` check) are therefore maintained here until the upstream public-mirror lands.

**To change session governance long-term:** open a PR against `.github-private/.claude/` — once `governance-auto-propagate` is re-enabled for public repos, the next run will re-sync.

**For repo-specific overrides:** create `.claude/settings.local.json` in this repo. The propagation workflow never touches that file.

---

## What This Directory Provides

When a Claude Code session starts in this repo:

1. **SessionStart hook** (`hooks/session-start.sh`, wired via `settings.json`) prints the OTOI mandatory reading order and validates that `NLT-DEV-OTOI.md`, `AGENTS.md`, `CLAUDE.md`, and `nltotoi.json` exist.
2. **Subagents** (`agents/`) are available via subagent dispatch: `nlt-governance-steward`, `nlt-code-reviewer`, `swe-agent`.
3. **Skills** (`skills/`) are loadable on demand: `nlt-otoi`, `nlt-agent-registration`, `nlt-handoff-record`, `nlt-escalation`, `nlt-intent-log`, `nlt-commit-format`, `nlt-incident-response`.
4. **Slash commands** (`commands/`):
   - `/register-session` — file agent self-registration (OTOI §3)
   - `/handoff` — write session handoff (OTOI §5)
   - `/escalate <topic>` — file an escalation (OTOI §4.3)
   - `/intent-log <topic>` — log intent before significant action (OTOI §7)
   - `/governance-check` — run `validate-governance.sh`

---

*Synced from `NeuroLift-Technologies/.github-private` | ORG-DEV-OTOI-1.0.3 — local overlay for public `nlt-app` (see above)*
