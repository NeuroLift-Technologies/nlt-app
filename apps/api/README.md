# nlt-app API — App Gateway (app-only)

> **App delivery layer only.** Simulation and training code was archived to
> `archive/pre-1-20-fullstack-2026-09-03/` and now lives in:
> - **World Engine**: https://github.com/NeuroLift-Technologies/nlt-world-engine
> - **AI-Fusion**: https://github.com/NeuroLift-Technologies/neurolift-ai-fusion
>
> This service is a minimal FastAPI gateway. It exposes `/health` and `/` and
> proxies future app-specific routes. World/fusion calls go via A2A to the
> upstream repos — code is referenced, not vendored.

## Run

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# → http://localhost:8000/api/docs
```

## Archived

Previous full-stack routers (`avatars`, `aides`, `sessions`, `advocates`) were
moved to `archive/pre-1-20-fullstack-2026-09-03/apps-api/` via `git mv` to
preserve history. Restore with `git log --follow`.

## Pipeline

`World Engine >> AI-Fusion >> nlt-app (1:20)` — this repo only runs the
personalized delivery layer (1 orchestrator : 20 advocates, 20th = Developer
builder that remakes the app per user).
