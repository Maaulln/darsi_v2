"""
main.py — DARSI FastAPI Backend
================================
Start: uvicorn main:app --reload --port 8000
Docs : http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from .routers import dashboard, resources, cost_insurance, patient, ai
except ImportError:
    from routers import dashboard, resources, cost_insurance, patient, ai

app = FastAPI(
    title="DARSI SIMRS API",
    description="Backend API for DARSI RSI Surabaya — connects darsi_clean.db to the React frontend",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:4173",   # Vite preview
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(dashboard.router)
app.include_router(resources.router)
app.include_router(cost_insurance.router)
app.include_router(patient.router)
app.include_router(ai.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    """Mengembalikan status kesehatan API dan konektivitas database.

    Returns:
        dict: Status layanan, nama database, keterjangkauan database, dan jumlah data pasien.
    """
    import sqlite3, os
    db_path = os.path.join(os.path.dirname(__file__), "darsi_clean.db")
    db_ok = os.path.exists(db_path)
    rows = 0
    if db_ok:
        try:
            conn = sqlite3.connect(db_path)
            rows = conn.execute("SELECT COUNT(*) FROM pasien").fetchone()[0]
            conn.close()
        except Exception:
            db_ok = False
    return {
        "status": "ok",
        "database": "darsi_clean.db",
        "db_reachable": db_ok,
        "pasien_count": rows,
    }
