# src/advocates/20-developer — Small Developer Builder (app-only)

> The **20th advocate** in the 1:20 runtime. The other 19 are domain advocates
> trained in [neurolift-ai-fusion](https://github.com/NeuroLift-Technologies/neurolift-ai-fusion);
> the simulation they trained in lives in
> [nlt-world-engine](https://github.com/NeuroLift-Technologies/nlt-world-engine).

This advocate is a **small on-device / edge Developer builder** that remakes
the app per user at runtime — scaffolding surfaces, wiring orchestrator calls,
and personalizing the delivery layer. It does NOT re-implement
`BaseAdvocate` fusion logic (archived to `archive/pre-1-20-fullstack-2026-09-03/src/advocates/`).

## Contract

- Input: user preference + 19 advocate outputs (via `src/orchestrator`)
- Output: patched `apps/web` / `apps/mobile` surfaces (see `src/surfaces`)
- Calls upstream via A2A only; no vendored `src/fusion` or `src/simulation`

## Archived

`src/advocates/base_advocate.py` and related fusion code were moved via `git mv`
to `archive/pre-1-20-fullstack-2026-09-03/src/advocates/` to preserve history.
