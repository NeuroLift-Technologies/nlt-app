# 05 — MemoryMate — External Dump

> **Trait:** Working Memory / Organization — ranked **#5** for Joshd; supports #1 initiation.
> **System:** MemoryMate external dump (cross-System: START, TIME, TOP3)

**Capture bar** — `"I'll remember later"` → externalizes working memory so brain can detach from
intrusive idea and return to micro-step. Prevents "don't forget" loop that keeps brain attached
to previous thing (time blindness) and protects Top 3 from Later creep.

- **Stub:** `captureDump(idea, source) => DumpEntry`, `listDumps()`, `clearDumps()`
- **Surface:** `src/surfaces/DumpBar.tsx`
- **Upstream trait catalog:** [neurolift-ai-fusion](https://github.com/NeuroLift-Technologies/neurolift-ai-fusion) — `src/advocates/` + `src/avatars/adhd_traits/`
- **TODO[A2A]:** Wire to Advocate 05 persistent store via A2A (D1/KV) — currently in-memory stub

Minimal stub only — no model weights.
