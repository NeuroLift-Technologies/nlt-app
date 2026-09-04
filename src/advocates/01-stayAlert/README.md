# 01 — StayAlert — Interest Injection

> **Trait:** Interest-Based Attention — ranked **#2 very high** for Joshd.
> **Strength when interested:** problem-solving / strategic thinking (very high), creativity / hyperfocus.
> **System:** StayAlert interest injection + Hyperfocus Guard / Exit Ramp companion (with Timely)

Reframes low-interest task as **puzzle / strategy / creative challenge** to inject dopamine via curiosity.
Supports **Hyperfocus Guard / Exit Ramp**: when Timely detects overtime + locked focus, StayAlert reframes exit
as the next interesting puzzle with a `TransitionBuffer`.

- **Stub:** `injectInterest(task) => ReframedTask`, `getExitRamp(task, nextTask)`
- **Upstream trait catalog:** [neurolift-ai-fusion](https://github.com/NeuroLift-Technologies/neurolift-ai-fusion) — `src/avatars/adhd_traits/attention_deficit.py` + `stay_alert_avatar.py` + `src/advocates/`
- **Archived:** `archive/pre-1-20-fullstack-2026-09-03/src/avatars/adhd_traits/attention_deficit.py`
- **TODO[A2A]:** Wire to Advocate 01 reframing model via A2A

Minimal stub only — no model weights.
