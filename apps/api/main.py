"""nlt-app — Minimal App API Gateway (app-only).

This is the app delivery layer. It does NOT embed World Engine or AI-Fusion
training code. Those live in their own repos and are called via A2A/agent
interface at runtime.

- World Engine: https://github.com/NeuroLift-Technologies/nlt-world-engine
  — embodied UE 5.8 simulation (upstream)
- AI-Fusion: https://github.com/NeuroLift-Technologies/neurolift-ai-fusion
  — trains 1 orchestrator + 20 advocates (midstream)
- This repo (nlt-app): runs the personalized 1:20 runtime where the 20th
  advocate is a small Developer builder that remakes the app per user.

Archived full-stack code (pre-1-20): archive/pre-1-20-fullstack-2026-09-03/
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="NeuroLift App API — Gateway",
    description=(
        "App-only API gateway. Simulation and training have moved to "
        "nlt-world-engine and neurolift-ai-fusion. "
        "This service proxies /health and future app-specific routes; "
        "world/fusion calls go via A2A to those repos."
    ),
    version="1.20.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

_raw_origins = os.environ.get("ALLOWED_ORIGINS", "")
_allowed_origins: list[str] = [o.strip() for o in _raw_origins.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=_allowed_origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "service": "nlt-app-gateway",
        "mode": "app-only",
        "world_engine": "https://github.com/NeuroLift-Technologies/nlt-world-engine",
        "ai_fusion": "https://github.com/NeuroLift-Technologies/neurolift-ai-fusion",
        "archived": "archive/pre-1-20-fullstack-2026-09-03/",
    }


@app.get("/")
async def root() -> dict:
    return {
        "message": "nlt-app gateway — see /api/docs",
        "pipeline": "World Engine >> AI-Fusion >> nlt-app (1:20)",
        "links": {
            "world_engine": "https://github.com/NeuroLift-Technologies/nlt-world-engine",
            "ai_fusion": "https://github.com/NeuroLift-Technologies/neurolift-ai-fusion",
            "governance": "https://github.com/NeuroLift-Technologies/.github-private",
        },
    }
