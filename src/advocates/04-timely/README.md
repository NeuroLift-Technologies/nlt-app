# 04 — Timely — Time Visibility (System 2 TIME)

> **Trait:** Time Blindness — ranked **#3 very high** for Joshd; brain stays attached to previous thing.
> **System:** System 2 TIME (Timely) — time visibility

Provides **live countdown bar + estimate vs actual + transition buffers** for time blindness.
Paired with **Hyperfocus Guard/Exit Ramp** (see `src/advocates/01-stayAlert` + `src/surfaces/TimeBar.tsx`).

- **Stub:** `getTimeVisibility()`, `getLiveRemaining()`, `createTransitionBuffer()`, `shouldTriggerHyperfocusGuard()`
- **Upstream trait catalog:** [neurolift-ai-fusion](https://github.com/NeuroLift-Technologies/neurolift-ai-fusion) — `src/avatars/adhd_traits/` + `src/advocates/`
- **Archived time logic:** `archive/pre-1-20-fullstack-2026-09-03/src/simulation/environment/time_manager.py`
- **TODO[A2A]:** Wire to Advocate 04 + `nlt-world-engine` time_manager via A2A

Minimal stub only — no model weights.
