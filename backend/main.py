"""
FastAPI Application Entry Point
================================
Water Flow & Flood Risk Analysis API

Run with:
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.db import init_db
from routes.health   import router as health_router
from routes.analysis import router as analysis_router
from routes.data     import router as data_router

# ── Application ────────────────────────────────────────────────────────────────
app = FastAPI(
    title       = "Water Flow & Flood Risk Analysis API",
    description = (
        "Educational/simulation API for vector-calculus-based "
        "water flow analysis and flood risk mapping. "
        "NOT an official flood forecasting system."
    ),
    version     = "1.0.0",
    docs_url    = "/docs",
    redoc_url   = "/redoc",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ── Startup ────────────────────────────────────────────────────────────────────
@app.on_event("startup")
def startup_event():
    init_db()


# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(health_router,   prefix="/api", tags=["Health"])
app.include_router(analysis_router, prefix="/api", tags=["Analysis"])
app.include_router(data_router,     prefix="/api", tags=["Data"])


@app.get("/")
def root():
    return {
        "message":  "Water Flow & Flood Risk Analysis API",
        "docs":     "/docs",
        "health":   "/api/health",
    }
