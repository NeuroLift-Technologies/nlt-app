# src/surfaces — App Surfaces Registry (app-only)

Registry of delivery surfaces that the 20th Developer advocate can patch per user:

- `apps/web` — Next.js web app
- `apps/mobile` — Expo mobile app
- `apps/api` — minimal FastAPI gateway (see `apps/api/main.py`)

Surfaces do NOT contain simulation or fusion logic. That code lives in:

- **World Engine**: https://github.com/NeuroLift-Technologies/nlt-world-engine
- **AI-Fusion**: https://github.com/NeuroLift-Technologies/neurolift-ai-fusion

Archived vendored code: `archive/pre-1-20-fullstack-2026-09-03/`
