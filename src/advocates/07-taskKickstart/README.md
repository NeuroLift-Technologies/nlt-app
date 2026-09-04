# 07 — TaskKickstart — Activation Bridge (System 1 START)

> **Trait:** Task Initiation / Activation — ranked **#1 very high** for Joshd.
> **System:** System 1 START (TaskKickstart + Planner Pro) — Activation Bridge
> **Cycle bridge:** Low interest → can't activate → procrastination → overwhelm → adrenaline → exhaustion

Gives **one 2-minute micro-step** with `[Done]/[Stuck]` buttons (see `src/surfaces/StartView.tsx`).
On `Stuck`, calls `reclassify(reason)` → `src/orchestrator/classifier.classifyStuckState` to route
to Timely / PlannerPro / StayAlert / MemoryMate before shrinking further.

- **Stub:** `getNextMicroStep(intent: string) => MicroStep { next_action, duration_min: 2, reclassify }`
- **Upstream trait catalog:** [neurolift-ai-fusion](https://github.com/NeuroLift-Technologies/neurolift-ai-fusion) — `src/avatars/adhd_traits/task_kickstart_avatar.py` + `src/advocates/`
- **Archived BaseAdvocate:** `archive/pre-1-20-fullstack-2026-09-03/src/advocates/base_advocate.py`
- **TODO[A2A]:** Wire to Advocate 07 inference via A2A (AI-Fusion FusionEngine/ReadinessAssessor)

Minimal stub only — no model weights.
